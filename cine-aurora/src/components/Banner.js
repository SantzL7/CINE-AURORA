export default function Banner() {
  return (
    <header className="banner">
      <div className="banner__content">
        <h1 className="banner__title">Mergulhe na sua galáxia de filmes.</h1>
        <p className="banner__subtitle">
          Destaque lançamentos, clássicos e séries sob a luz da aurora. Tudo em um único catálogo personalizado.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button className="btn primary">Assistir agora</button>
          <button className="btn ghost">Mais informações</button>
        </div>
      </div>
      <div className="banner__fade" />
    </header>
  );
}
