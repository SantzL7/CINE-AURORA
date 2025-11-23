import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Função para validar força da senha
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    requirements: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  };
};

export default function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  
  // Efeito para controlar o tempo de bloqueio
  useEffect(() => {
    let timer;
    if (isLocked && lockTime > 0) {
      timer = setTimeout(() => {
        setLockTime(prev => prev - 1);
      }, 1000);
    } else if (isLocked && lockTime === 0) {
      setIsLocked(false);
      setFailedAttempts(0);
    }
    return () => clearTimeout(timer);
  }, [isLocked, lockTime]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting || isLocked) return;
    
    // Validação básica de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Por favor, insira um email válido");
      return;
    }
    
    // Validação de senha para cadastro
    if (mode === "signup") {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setErr("A senha não atende aos requisitos de segurança");
        return;
      }
    }
    
    setErr("");
    setIsSubmitting(true);
    
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      
      // Redirecionamento seguro após login bem-sucedido
      const adminEmail = "matheus0mendes0marinho@gmail.com";
      if (email === adminEmail) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
      
      // Resetar tentativas após login bem-sucedido
      setFailedAttempts(0);
      
    } catch (error) {
      // Mensagens de erro mais amigáveis
      let errorMessage = "Ocorreu um erro ao fazer login";
      
      switch(error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = "Email ou senha incorretos";
          const attempts = failedAttempts + 1;
          setFailedAttempts(attempts);
          
          // Bloquear após 5 tentativas por 5 minutos
          if (attempts >= 5) {
            setIsLocked(true);
            setLockTime(300); // 5 minutos em segundos
            errorMessage = "Muitas tentativas. Tente novamente em 5 minutos.";
          }
          break;
        case 'auth/email-already-in-use':
          errorMessage = "Este email já está em uso";
          break;
        case 'auth/weak-password':
          errorMessage = "A senha é muito fraca";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
          break;
      }
      
      setErr(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Cine Aurora</h1>
        <p className="muted">Entre com sua conta ou cadastre-se</p>

        {err && <div className="error">{err}</div>}

        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
            className="input"
            disabled={isLocked || isSubmitting}
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
            disabled={isLocked || isSubmitting}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "signup" ? "8" : undefined}
          />
          {mode === "signup" && (
            <div className="password-requirements">
              <p className="small muted">A senha deve conter:</p>
              <ul className="requirement-list">
                <li className={password.length >= 8 ? 'valid' : ''}>Mínimo de 8 caracteres</li>
                <li className={/[A-Z]/.test(password) ? 'valid' : ''}>Pelo menos uma letra maiúscula</li>
                <li className={/[a-z]/.test(password) ? 'valid' : ''}>Pelo menos uma letra minúscula</li>
                <li className={/\d/.test(password) ? 'valid' : ''}>Pelo menos um número</li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'valid' : ''}>Pelo menos um caractere especial</li>
              </ul>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn primary"
          disabled={isSubmitting || isLocked}
        >
          {isSubmitting ? (
            <span className="spinner">Carregando...</span>
          ) : isLocked ? (
            `Tente novamente em ${Math.floor(lockTime / 60)}:${(lockTime % 60).toString().padStart(2, '0')}`
          ) : mode === "login" ? (
            "Entrar"
          ) : (
            "Cadastrar"
          )}
        </button>

        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setErr("");
          }}
          disabled={isSubmitting || isLocked}
        >
          {mode === "login" ? "Criar uma conta" : "Já tenho conta"}
        </button>
      </form>
    </div>
  );
}
