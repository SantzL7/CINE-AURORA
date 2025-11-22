import { useNavigate } from "react-router-dom";
import Row from "../components/Row";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header
        className="landing-hero"
        style={{
          padding: "48px 24px 40px",
          background:
            "radial-gradient(circle at 10% 0%, rgba(84,242,156,0.35) 0, transparent 45%)," +
            "radial-gradient(circle at 90% 10%, rgba(58,200,255,0.3) 0, transparent 50%)," +
            "linear-gradient(135deg, #020813, #050b1a)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: 32,
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: 42, margin: "0 0 12px" }}>Filmes, series e muito mais sob a luz da Aurora.</h1>
            <p className="muted" style={{ maxWidth: 520, margin: "0 0 20px" }}>
              Um ambiente de streaming inspirado na aurora boreal para voce apresentar e destacar o seu catalogo de
              filmes e series com uma experiencia imersiva.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
              <button className="btn primary" onClick={() => navigate("/login")}>
                Entrar
              </button>
              <button className="btn ghost" onClick={() => navigate("/login")}>
                Criar conta gratuita
              </button>
            </div>
            <p className="muted" style={{ fontSize: 13 }}>
              Acesse o painel administrador, cadastre titulos e veja tudo como se fosse um servico de streaming
              profissional.
            </p>
          </div>

          <div
            style={{
              borderRadius: 18,
              padding: 14,
              background: "rgba(2,8,19,0.9)",
              border: "1px solid var(--border)",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gridAutoRows: 90,
              gap: 10,
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  borderRadius: 10,
                  background:
                    i % 2 === 0
                      ? "linear-gradient(145deg, #1b3b5a, #0b1526)"
                      : "linear-gradient(145deg, #264b3f, #0b1526)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.6)",
                }}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="content" style={{ maxWidth: 1160, margin: "0 auto" }}>
        <section style={{ paddingTop: 24 }}>
          <h2 style={{ marginBottom: 8 }}>Em alta no Cine Aurora</h2>
          <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
            Quando estiver logado, voce vera aqui os destaques reais do seu catalogo.
          </p>
          <Row title="Ae7e3o" genre="Acao" locked />
        </section>
      </main>
    </div>
  );
}
