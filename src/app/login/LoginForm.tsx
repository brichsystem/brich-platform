"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="form login-form" noValidate>
      <div className="field">
        <label htmlFor="l-email">Correo</label>
        <input id="l-email" name="email" type="email" autoComplete="email" defaultValue={state.email} required />
      </div>
      <div className="field">
        <label htmlFor="l-password">Contraseña</label>
        <input id="l-password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && (
        <p className="form-error" role="alert">{state.error}</p>
      )}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
      <p className="login-help">
        Los accesos los entrega BRich a cada cliente. Si olvidaste tu contraseña, escríbenos y la restablecemos.
      </p>
    </form>
  );
}
