# Base de datos (Supabase)

Los archivos de `migrations/` se ejecutan en orden desde **Supabase → SQL Editor**.

| Archivo | Qué hace | Cuándo |
|---|---|---|
| `0001_estructura_y_seguridad.sql` | Crea tablas y reglas de aislamiento por empresa (RLS) | Una vez |
| `0002_datos_demostrativos.sql` | Crea "Empresa Demo A" y "Empresa Demo B" con datos ficticios | Una vez |
| `0003_asignar_usuarios_demo.sql` | Asocia los usuarios de prueba a su empresa | Después de crear los usuarios |
| `0004_registro_de_prospectos.sql` | Crea la empresa BRich y la función `register_web_lead` (solo n8n puede usarla) | Una vez |
| `0005_cambiar_estado_prospecto.sql` | Función `set_lead_status`: el cliente cambia solo el estado de prospectos de su empresa | Una vez |
| `0007_prospectos_sin_duplicados.sql` | Mismo correo o WhatsApp en la misma empresa = mismo prospecto: suma una visita, agrega el mensaje y reabre si estaba perdido. `register_web_lead` devuelve `{id, repetido, veces}` | Una vez |
| `0006_limite_de_envios.sql` | Límite de envíos del formulario: 3 cada 10 min y 10 al día por conexión, 60 por hora en total. Guarda solo una huella cifrada, no la IP, y borra los registros a las 24 h | Una vez |

## Modelo de seguridad
- Cada usuario solo puede **leer** los datos de su empresa (`current_company_id()`).
- Nadie edita las tablas directamente desde el navegador. n8n registra prospectos con `register_web_lead` (clave secreta, solo en n8n) y el cliente solo puede cambiar el **estado** de sus propios prospectos con `set_lead_status`.
- Sin registro público: BRich crea los usuarios en Authentication → Users.

## Probado
Las reglas se probaron en un Postgres local: A ve solo sus datos, B solo los suyos, un usuario sin empresa ve 0, un visitante sin sesión es rechazado, y nadie puede insertar ni cambiarse de empresa.
