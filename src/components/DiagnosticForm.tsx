import { systems } from "@/lib/systems";
import { LeadForm } from "./LeadForm";

/** Formulario de diagnóstico de la web de BRich. */
export function DiagnosticForm({ defaultSystem }: { defaultSystem?: string }) {
  return (
    <LeadForm
      options={systems.map((s) => s.name)}
      defaultOption={defaultSystem}
      messageLabel="¿Cuál es tu mayor problema hoy? (opcional)"
      submitLabel="Pedir diagnóstico"
      successTitle="Recibimos tu solicitud"
      successText="El equipo de BRich revisará tus datos y te contactará por WhatsApp o correo para agendar el diagnóstico."
      legal="Usaremos tus datos solo para contactarte sobre el diagnóstico."
    />
  );
}
