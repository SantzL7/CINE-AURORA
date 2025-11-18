import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate("/", { replace: true });
    } catch (error) {
      setErr(error.message);
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Cine Aurora</h1>
        <p className="muted">Entre com sua conta ou cadastre-se</p>

        {err && <div className="error">{err}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input"
        />

        <button type="submit" className="btn primary">
          {mode === "login" ? "Entrar" : "Cadastrar"}
        </button>

        <button
          type="button"
          className="btn ghost"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Criar uma conta" : "Já tenho conta"}
        </button>
      </form>
    </div>
  );
}
