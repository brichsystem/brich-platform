/**
 * Catálogo de sistemas BRich. Editar aquí el contenido; las páginas se generan solas.
 * Regla de marca: sin cifras, clientes ni resultados inventados.
 */
export type SystemInfo = {
  slug: string;
  name: string;
  title: string;
  summary: string;
  forWho: string;
  problems: string[];
  features: string[];
  chain: string[];
  howItWorks: { title: string; text: string }[];
  tools: string[];
  clientProvides: string[];
};

export const systems: SystemInfo[] = [
  {
    slug: "sales",
    name: "BRich Sales System",
    title: "Ventas con seguimiento",
    summary: "Cada consulta queda registrada, clasificada y asignada a un vendedor, con seguimiento programado.",
    forWho: "Para empresas que reciben consultas pero pierden oportunidades por falta de seguimiento.",
    problems: [
      "Las consultas llegan por varios canales y nadie las registra.",
      "No se sabe qué vendedor atiende a cada prospecto.",
      "El seguimiento depende de la memoria del equipo.",
    ],
    features: [
      "Registro automático de cada prospecto",
      "Clasificación por prioridad",
      "Aviso al vendedor responsable",
      "Seguimiento programado",
    ],
    chain: ["Consulta", "registro", "clasificación", "vendedor", "panel"],
    howItWorks: [
      { title: "Captación", text: "El prospecto escribe por WhatsApp o llena el formulario de tu web." },
      { title: "Registro", text: "Sus datos se guardan en tu CRM o base de datos sin copiarlos a mano." },
      { title: "Clasificación", text: "El sistema lo ordena según el servicio que pide y su urgencia." },
      { title: "Aviso", text: "El vendedor responsable recibe una notificación inmediata." },
      { title: "Seguimiento", text: "Se programan los recordatorios y el avance queda visible en tu panel." },
    ],
    tools: ["n8n", "CRM", "Supabase", "WhatsApp Business (API oficial)", "Formulario web"],
    clientProvides: [
      "Cómo vende hoy y quién atiende a cada cliente",
      "Acceso autorizado a WhatsApp Business y a su CRM, si tiene uno",
      "Validación de las reglas de clasificación",
    ],
  },
  {
    slug: "ai-assistant",
    name: "BRich AI Assistant",
    title: "Atención automatizada",
    summary: "Un asistente con la información de tu negocio responde, recopila datos y deriva a una persona cuando hace falta.",
    forWho: "Para empresas que responden las mismas preguntas todos los días y no dan abasto.",
    problems: [
      "El equipo pierde horas respondiendo preguntas repetidas.",
      "Las consultas fuera de horario quedan sin respuesta.",
      "Los datos del cliente se piden varias veces.",
    ],
    features: [
      "Respuestas con la información de tu negocio",
      "Recopila los datos del cliente",
      "Deriva a una persona cuando hace falta",
      "Historial de cada conversación",
    ],
    chain: ["Pregunta", "respuesta", "datos", "derivación", "panel"],
    howItWorks: [
      { title: "Base de conocimiento", text: "Reunimos tus servicios, precios y respuestas frecuentes aprobadas por ti." },
      { title: "Respuesta", text: "El asistente responde con esa información, sin inventar lo que no sabe." },
      { title: "Datos", text: "Pide y guarda los datos necesarios para atender al cliente." },
      { title: "Derivación", text: "Si el caso lo requiere, pasa la conversación a una persona de tu equipo." },
      { title: "Revisión", text: "Las conversaciones quedan registradas para revisarlas y mejorar las respuestas." },
    ],
    tools: ["n8n", "Modelo de IA", "WhatsApp Business (API oficial)", "Supabase"],
    clientProvides: [
      "Información aprobada sobre servicios, precios y políticas",
      "Criterios para derivar a una persona",
      "Revisión de las respuestas antes de activar el asistente",
    ],
  },
  {
    slug: "operations",
    name: "BRich Operations System",
    title: "Operación en orden",
    summary: "Tareas asignadas, avisos por estado y reportes que se generan solos, conectando las herramientas que ya usas.",
    forWho: "Para empresas con tareas administrativas repetitivas y reportes armados a mano.",
    problems: [
      "Las tareas se asignan por chat y se pierden.",
      "Los reportes se arman a mano cada semana.",
      "Las herramientas de la empresa no se comunican entre sí.",
    ],
    features: [
      "Asignación y aviso de tareas",
      "Reportes automáticos",
      "Notificaciones por estado",
      "Conexión entre tus herramientas actuales",
    ],
    chain: ["Evento", "tarea", "responsable", "reporte", "panel"],
    howItWorks: [
      { title: "Mapeo", text: "Identificamos las tareas repetitivas y quién las ejecuta." },
      { title: "Asignación", text: "Cada evento genera una tarea con responsable y fecha." },
      { title: "Avisos", text: "El equipo recibe notificaciones cuando algo cambia de estado." },
      { title: "Reportes", text: "Los indicadores se consolidan y se envían en la frecuencia acordada." },
    ],
    tools: ["n8n", "Supabase", "Google Workspace", "Herramientas actuales del cliente"],
    clientProvides: [
      "Lista de procesos y responsables",
      "Acceso autorizado a las herramientas que se conectarán",
      "Indicadores que quiere recibir",
    ],
  },
];

export function getSystem(slug: string) {
  return systems.find((s) => s.slug === slug);
}
