// Pruebas del SQL con PGlite (un Postgres que corre en memoria, sin tocar Supabase).
// Uso: npm run test:db
// Carga TODAS las migraciones en orden y comprueba el comportamiento con datos ficticios.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");
const db = new PGlite();
let passed = 0;
const failed = [];

function check(name, cond, extra = "") {
  if (cond) passed++;
  else failed.push(`${name} ${extra}`);
  console.log(`${cond ? "  ok  " : " FALLA"} ${name}${cond ? "" : " " + extra}`);
}
const q = async (sql, params) => (await db.query(sql, params)).rows;
const one = async (sql, params) => (await q(sql, params))[0];
async function fails(sql, params) {
  try { await db.query(sql, params); return false; } catch { return true; }
}
/** Ejecuta como un usuario con sesión (igual que el portal). */
async function asUser(userId, fn) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${userId}', false);`);
  try { return await fn(); } finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`); }
}
async function asRole(role, fn) {
  await db.exec(`set role ${role};`);
  try { return await fn(); } finally { await db.exec(`reset role;`); }
}

// ---- Lo que Supabase ya trae y PGlite no: roles, esquema auth y auth.uid() ----
await db.exec(`
  create role anon; create role authenticated; create role service_role;
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text unique);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
  insert into auth.users (email) values ('demo-a@brich.test'), ('demo-b@brich.test');
`);

for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  try { await db.exec(readFileSync(join(dir, f), "utf8")); }
  catch (e) { console.error(`No se pudo cargar ${f}: ${e.message}`); process.exit(1); }
}
console.log("Migraciones cargadas.\n");

const reg = async (args) =>
  (await one(`select public.register_web_lead(p_company_slug => $1, p_name => $2, p_email => $3, p_phone => $4, p_message => $5, p_request_id => $6) as r`,
    [args.slug, args.name, args.email ?? null, args.phone ?? null, args.message ?? null, args.req ?? null])).r;

// ---- Datos ficticios: empresa "prueba" con dueña y dos vendedores ----
await db.exec(`
  insert into public.companies (name, slug, notify_emails) values ('Empresa Prueba', 'prueba', 'duena@prueba.invalid');
  insert into auth.users (email) values ('duena@prueba.invalid'), ('v1@prueba.invalid'), ('v2@prueba.invalid');
  insert into public.profiles (id, company_id, full_name, role, receives_leads, phone, created_at)
  select u.id, c.id, x.n, x.r, x.s, x.ph, now() - x.ago
    from (values ('duena@prueba.invalid', 'Dueña Prueba', 'owner', false, null, interval '3 days'),
                 ('v1@prueba.invalid', 'Vendedor Uno', 'member', true, '+593 99 111 1111', interval '2 days'),
                 ('v2@prueba.invalid', 'Vendedor Dos', 'member', true, null, interval '1 day')) as x(e, n, r, s, ph, ago)
    join auth.users u on u.email = x.e, public.companies c where c.slug = 'prueba';
`);
const uid = async (email) => (await one(`select id from auth.users where email = $1`, [email])).id;
const owner = await uid("duena@prueba.invalid");
const v1 = await uid("v1@prueba.invalid");
const v2 = await uid("v2@prueba.invalid");
const demoA = await uid("demo-a@brich.test");
const lead = async (id) => one(`select * from public.leads where id = $1`, [id]);

console.log("1. Compatibilidad: todo apagado por defecto");
let r = await reg({ slug: "prueba", name: "Ana Ficticia", email: "ana@ejemplo.invalid", message: "Hola" });
check("sin rotación no asigna vendedor", r.vendedor === null && r.avisar_a === "duena@prueba.invalid");
check("conserva los campos anteriores (empresa, notify_emails, repetido)", r.empresa === "Empresa Prueba" && r.notify_emails === "duena@prueba.invalid" && r.repetido === false && r.reintento === false);
check("n8n antiguo (8 parámetros, sin p_request_id) sigue funcionando",
  !(await fails(`select public.register_web_lead(p_company_slug => 'prueba', p_name => 'Viejo Flujo', p_company_name => 'X', p_phone => '0990000001', p_email => 'viejo@ejemplo.invalid', p_interest => 'A', p_message => 'm', p_source => 'web_form')`)));
check("sin recordatorios activos no reclama nada", (await one(`select public.claim_lead_reminders() as r`)).r.length === 0);

console.log("\n2. Asignación rotativa");
await db.exec(`update public.companies set lead_assignment = 'rotativa' where slug = 'prueba'`);
const a = await reg({ slug: "prueba", name: "Beto Ficticio", email: "beto@ejemplo.invalid", req: "req-1" });
const b = await reg({ slug: "prueba", name: "Caro Ficticia", email: "caro@ejemplo.invalid", req: "req-2" });
const c = await reg({ slug: "prueba", name: "Dani Ficticio", phone: "+593 98 222 3333", req: "req-3" });
check("1.º prospecto → Vendedor Uno", a.vendedor === "Vendedor Uno" && a.vendedor_email === "v1@prueba.invalid" && a.vendedor_whatsapp === "+593 99 111 1111", JSON.stringify(a));
check("2.º prospecto → Vendedor Dos", b.vendedor === "Vendedor Dos");
check("3.º prospecto → vuelve a Vendedor Uno", c.vendedor === "Vendedor Uno");
check("avisar_a = vendedor + correos de la empresa", a.avisar_a === "v1@prueba.invalid, duena@prueba.invalid");
check("la dueña (no vendedora) nunca recibe por rotación", (await one(`select count(*)::int n from public.leads where assigned_user_id = $1`, [owner])).n === 0);
check("guarda responsable visible en el portal", (await lead(a.id)).assigned_to === "Vendedor Uno");
check("deja constancia en automation_runs", (await one(`select count(*)::int n from public.automation_runs where name = 'Asignación de vendedor'`)).n === 3);

console.log("\n3. Reintentos y repetidos");
const a2 = await reg({ slug: "prueba", name: "Beto Ficticio", email: "beto@ejemplo.invalid", req: "req-1" });
check("mismo request_id = reintento, no suma", a2.reintento === true && a2.veces === 1 && a2.id === a.id && a2.repetido === false, JSON.stringify(a2));
check("el reintento no crea ejecuciones nuevas", (await one(`select count(*)::int n from public.automation_runs where name = 'Prospecto volvió a escribir'`)).n === 0);
const a3 = await reg({ slug: "prueba", name: "Beto Ficticio", email: "beto@ejemplo.invalid", req: "req-9", message: "Otra vez" });
check("request_id distinto = volvió a escribir", a3.reintento === false && a3.repetido === true && a3.veces === 2);
check("el repetido conserva su vendedor", a3.vendedor === "Vendedor Uno");
check("total de filas sin duplicados", (await one(`select count(*)::int n from public.leads l join public.companies c on c.id = l.company_id where c.slug = 'prueba'`)).n === 5);

console.log("\n4. Recordatorios");
await db.exec(`update public.companies set lead_reminder_hours = 24, lead_reminder_max = 2 where slug = 'prueba'`);
check("prospectos recientes no generan recordatorio", (await one(`select public.claim_lead_reminders() as r`)).r.length === 0);
// Simula el paso del tiempo: Beto y Dani (Vendedor Uno) y Caro (Vendedor Dos) esperan 30 h. Ana (sin vendedor) también.
await db.exec(`update public.leads set attention_since = now() - interval '30 hours' where id in ('${a.id}', '${b.id}', '${c.id}', '${r.id}')`);
let rem = (await one(`select public.claim_lead_reminders() as r`)).r;
const forV1 = rem.find((x) => x.para === "v1@prueba.invalid");
const forV2 = rem.find((x) => x.para === "v2@prueba.invalid");
const forOwner = rem.find((x) => x.para === "duena@prueba.invalid");
check("un solo correo por destinatario (3 filas)", rem.length === 3, JSON.stringify(rem));
check("Vendedor Uno recibe sus 2 pendientes juntos", forV1?.cantidad === 2 && forV1.detalle.includes("Beto Ficticio") && forV1.detalle.includes("Dani Ficticio") && forV1.detalle.includes("aviso 1 de 2"), forV1?.detalle);
check("Vendedor Dos recibe solo el suyo", forV2?.cantidad === 1 && forV2.detalle.includes("Caro Ficticia") && !forV2.detalle.includes("Beto"));
check("prospecto sin vendedor → correos de la empresa", forOwner?.cantidad === 1 && forOwner.detalle.includes("Ana Ficticia"));
check("primer aviso sin copia al dueño", forV1.copia === null);
check("cada fila es de una sola empresa", rem.every((x) => x.empresa === "Empresa Prueba"));
check("preguntar de nuevo no repite el aviso", (await one(`select public.claim_lead_reminders() as r`)).r.length === 0);
await db.exec(`update public.leads set last_reminder_at = now() - interval '25 hours' where reminder_count = 1`);
rem = (await one(`select public.claim_lead_reminders() as r`)).r;
check("segundo (último) aviso copia al dueño", rem.find((x) => x.para === "v1@prueba.invalid")?.copia === "duena@prueba.invalid" && rem.find((x) => x.para === "v1@prueba.invalid").detalle.includes("aviso 2 de 2"));
await db.exec(`update public.leads set last_reminder_at = now() - interval '25 hours' where reminder_count = 2`);
check("después del máximo no avisa más", (await one(`select public.claim_lead_reminders() as r`)).r.length === 0);
check("empresas demo no reciben recordatorios (apagado por defecto)", (await one(`select count(*)::int n from public.leads l join public.companies c on c.id = l.company_id where c.is_demo and l.reminder_count > 0`)).n === 0);

console.log("\n5. Cambio de estado desde el portal");
await asUser(v1, () => db.query(`select public.set_lead_status($1, 'contactado')`, [a.id]));
let la = await lead(a.id);
check("al atender, se reinician los avisos", la.status === "contactado" && la.reminder_count === 0 && la.last_reminder_at === null);
await db.exec(`update public.leads set attention_since = now() - interval '90 hours' where id = '${a.id}'`);
check("prospecto atendido no genera recordatorio", (await one(`select public.claim_lead_reminders() as r`)).r.length === 0);
await asUser(v1, () => db.query(`select public.set_lead_status($1, 'perdido')`, [a.id]));
const a4 = await reg({ slug: "prueba", name: "Beto Ficticio", email: "beto@ejemplo.invalid", req: "req-10" });
la = await lead(a.id);
check("perdido que vuelve a escribir → nuevo, con reloj en cero", la.status === "nuevo" && la.reminder_count === 0 && Date.now() - new Date(la.attention_since).getTime() < 60_000 && a4.veces === 3);

console.log("\n6. Reasignar desde el portal (assign_lead) y aislamiento por empresa");
await asUser(owner, () => db.query(`select public.assign_lead($1, $2)`, [a.id, v2]));
la = await lead(a.id);
check("la dueña reasigna a Vendedor Dos", la.assigned_user_id === v2 && la.assigned_to === "Vendedor Dos");
check("un vendedor (no dueño) no puede reasignar", await asUser(v1, () => fails(`select public.assign_lead($1, $2)`, [a.id, v1])));
check("no se puede asignar a alguien de otra empresa", await asUser(owner, () => fails(`select public.assign_lead($1, $2)`, [a.id, demoA])));
check("el dueño de otra empresa no puede tocar este prospecto", await asUser(demoA, () => fails(`select public.assign_lead($1, null)`, [a.id])));
await asUser(owner, () => db.query(`select public.assign_lead($1, null)`, [a.id]));
check("dejar sin asignar", (await lead(a.id)).assigned_user_id === null && (await lead(a.id)).assigned_to === null);
const team = await asUser(owner, () => q(`select * from public.company_team()`));
check("company_team muestra solo mi empresa (3 personas)", team.length === 3 && team.filter((t) => t.receives_leads).length === 2);
check("otra empresa ve solo su equipo", (await asUser(demoA, () => q(`select * from public.company_team()`))).length === 1);
check("RLS: otra empresa no ve estos prospectos", (await asUser(demoA, () => q(`select id from public.leads where id = $1`, [a.id]))).length === 0);

console.log("\n7. Permisos: lo de n8n solo con la clave secreta");
for (const role of ["anon", "authenticated"]) {
  check(`${role} no puede usar claim_lead_reminders`, await asRole(role, () => fails(`select public.claim_lead_reminders()`)));
  check(`${role} no puede usar log_automation_run`, await asRole(role, () => fails(`select public.log_automation_run(null, 'sales', 'x', 'ok')`)));
  check(`${role} no puede usar register_web_lead`, await asRole(role, () => fails(`select public.register_web_lead('prueba', 'x')`)));
}
check("anon no puede usar assign_lead ni company_team", await asRole("anon", async () => (await fails(`select public.assign_lead(null, null)`)) && (await fails(`select * from public.company_team()`))));
const cid = (await one(`select id from public.companies where slug = 'prueba'`)).id;
check("service_role registra una ejecución con error", await asRole("service_role", async () => !(await fails(`select public.log_automation_run($1, 'sales', 'Recordatorio al vendedor', 'error', 'Gmail no respondió')`, [cid]))));
check("log_automation_run rechaza estados inventados", await fails(`select public.log_automation_run($1, 'sales', 'x', 'raro')`, [cid]));
check("service_role puede reclamar recordatorios", await asRole("service_role", async () => !(await fails(`select public.claim_lead_reminders()`))));

console.log("\n8. Prospectos anteriores a esta migración");
check("todos tienen attention_since", (await one(`select count(*)::int n from public.leads where attention_since is null`)).n === 0);

console.log("\n9. Alta de clientes (0010)");
const link = (await one(`select public.create_onboarding('Cliente Ficticio') as l`)).l;
const code = link.split("/").pop();
check("create_onboarding devuelve un enlace /alta/<código de 32>", /^https:\/\/brich-platform\.vercel\.app\/alta\/[0-9a-f]{32}$/.test(link), link);
const pub = await asRole("anon", () => one(`select public.get_onboarding($1) as r`, [code]));
check("la página pública solo ve nombre y estado", pub.r.label === "Cliente Ficticio" && pub.r.submitted === false && Object.keys(pub.r).length === 2);
check("código inventado no devuelve nada", (await asRole("anon", () => one(`select public.get_onboarding('0000') as r`))).r === null);
check("no se puede aplicar antes de que el cliente responda", await fails(`select public.apply_onboarding($1, 'cliente-ficticio')`, [code]));
const alta = {
  company: "Cliente Ficticio S.A.", services: ["Servicio Uno", "Servicio Dos"], notifyEmails: ["gerencia@ficticio.invalid"],
  people: [
    { name: "Gerente Ficticia", email: "gerente@ficticio.invalid", phone: "+593 99 000 1111", owner: true, seller: false },
    { name: "Vendedor Ficticio", email: "ventas@ficticio.invalid", phone: "+593 99 000 2222", owner: false, seller: true },
    { name: "Persona Ajena", email: "v1@prueba.invalid", phone: "+593 99 000 3333", owner: false, seller: true },
  ],
  rotate: true, reminderHours: 24,
};
check("el cliente (anon) envía sus datos", (await asRole("anon", () => one(`select public.submit_onboarding($1, $2::jsonb) as r`, [code, JSON.stringify(alta)]))).r === true);
check("el enlace sirve una sola vez", (await asRole("anon", () => one(`select public.submit_onboarding($1, '{"company":"Otro"}'::jsonb) as r`, [code]))).r === false);
check("rechaza datos demasiado grandes", await asRole("anon", () => fails(`select public.submit_onboarding($1, $2::jsonb)`, [code, JSON.stringify({ x: "a".repeat(25000) })])));
for (const role of ["anon", "authenticated"]) {
  check(`${role} no puede crear, listar ni aplicar altas`, await asRole(role, async () =>
    (await fails(`select public.create_onboarding('x')`)) && (await fails(`select * from public.onboarding_status()`)) &&
    (await fails(`select public.apply_onboarding($1, 'x')`, [code])) && (await fails(`select * from public.onboarding_requests`))));
}
check("onboarding_status muestra la respuesta", (await q(`select * from public.onboarding_status()`))[0].respuestas.includes("Vendedor Ficticio"));
check("slug inválido se rechaza", await fails(`select public.apply_onboarding($1, 'Con Espacios')`, [code]));
await db.exec(`insert into auth.users (email) values ('gerente@ficticio.invalid')`);
let ap = (await one(`select public.apply_onboarding($1, 'cliente-ficticio') as r`, [code])).r;
check("vincula a quien ya tiene usuario", ap.usuarios_vinculados.length === 1 && ap.usuarios_vinculados[0] === "gerente@ficticio.invalid", JSON.stringify(ap));
check("avisa qué usuarios faltan por crear", ap.usuarios_por_crear_en_Authentication.includes("ventas@ficticio.invalid"));
check("no mueve a un usuario que ya es de otra empresa", ap.usuarios_que_ya_son_de_otra_empresa.includes("v1@prueba.invalid") &&
  (await one(`select c.slug from public.profiles p join public.companies c on c.id = p.company_id where p.id = $1`, [v1])).slug === "prueba");
await db.exec(`insert into auth.users (email) values ('ventas@ficticio.invalid')`);
ap = (await one(`select public.apply_onboarding($1, 'cliente-ficticio') as r`, [code])).r;
check("se puede repetir: ahora vincula a los dos", ap.usuarios_vinculados.length === 2 && ap.usuarios_por_crear_en_Authentication.length === 0);
const co = await one(`select * from public.companies where slug = 'cliente-ficticio'`);
check("empresa creada con formulario, servicios, avisos y configuración",
  co.form_enabled && co.form_services.length === 2 && co.notify_emails === "gerencia@ficticio.invalid" && co.lead_assignment === "rotativa" && co.lead_reminder_hours === 24 && !co.is_demo, JSON.stringify(co));
check("sin duplicar la empresa al repetir", (await one(`select count(*)::int n from public.companies where slug = 'cliente-ficticio'`)).n === 1);
const fl = await reg({ slug: "cliente-ficticio", name: "Prospecto Ficticio", email: "p@ejemplo.invalid", req: "alta-1" });
check("su primer prospecto va al vendedor y avisa a gerencia", fl.vendedor === "Vendedor Ficticio" && fl.avisar_a === "ventas@ficticio.invalid, gerencia@ficticio.invalid", JSON.stringify(fl));
check("su formulario público queda activo", (await asRole("anon", () => one(`select public.get_public_form('cliente-ficticio') as r`))).r.name === "Cliente Ficticio S.A.");
check("la página queda cerrada tras el envío", (await one(`select public.get_onboarding($1) as r`, [code])).r.submitted === true);

console.log(`\n${passed} comprobaciones correctas, ${failed.length} fallidas.`);
if (failed.length) { console.log(failed.map((f) => " - " + f).join("\n")); process.exit(1); }
