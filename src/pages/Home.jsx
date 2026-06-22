import './Home.css';

const Home = () => {
  return (
    <main className="home">
      {/* ===== Hero Section ===== */}
      <section className="hero-section" id="home">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-badge">Movimento Green Urban</span>
          <h1 className="hero-title">
            Transformando{' '}
            <span className="highlight">concreto</span> em{' '}
            <span className="highlight-green">floresta</span>
          </h1>
          <p className="hero-subtitle">
            Um movimento social que une tecnologia, educação e mobilização
            comunitária para reflorestar áreas urbanas e combater as mudanças
            climáticas nas cidades.
          </p>
          <div className="hero-actions">
            <a href="#problema" className="btn btn-primary">
              Quero saber mais
            </a>
            <a href="#eventos" className="btn btn-secondary">
              Próximos eventos
            </a>
          </div>
        </div>
      </section>

      {/* ===== Problem Section ===== */}
      <section className="problem-section" id="problema">
        <div className="section-container">
          <h2 className="section-title">O problema que enfrentamos</h2>
          <p className="section-description">
            Nossas cidades estão sufocando. O asfalto e o concreto dominam a
            paisagem urbana, criando ambientes hostis tanto para as pessoas
            quanto para a natureza.
          </p>

          <div className="cards-grid">
            <div className="card">
              <div className="card-icon">🌡️</div>
              <h3 className="card-title">Ilhas de Calor</h3>
              <p className="card-text">
                A substituição de áreas verdes por edifícios e asfalto faz com
                que centros urbanos fiquem até 10°C mais quentes que regiões
                arborizadas. Isso aumenta o consumo de energia e agrava
                problemas de saúde.
              </p>
            </div>

            <div className="card">
              <div className="card-icon">💨</div>
              <h3 className="card-title">Ar Impuro</h3>
              <p className="card-text">
                A poluição atmosférica nas grandes cidades ultrapassa níveis
                seguros, causando doenças respiratórias e cardiovasculares. As
                árvores são aliadas essenciais para filtrar poluentes e
                melhorar a qualidade do ar.
              </p>
            </div>

            <div className="card">
              <div className="card-icon">🏙️</div>
              <h3 className="card-title">Impermeabilização do Solo</h3>
              <p className="card-text">
                O excesso de concreto impede a absorção da água da chuva,
                causando enchentes e desperdício de recursos hídricos. Áreas
                verdes ajudam a restaurar o ciclo natural da água.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Solution Section ===== */}
      <section className="solution-section" id="solucao">
        <div className="section-container">
          <h2 className="section-title">Nossa proposta de solução</h2>
          <p className="section-description">
            Acreditamos que a mudança começa com informação, passa pela ação
            coletiva e se consolida através da educação. O Green Urban é um
            ecossistema de transformação urbana.
          </p>

          <div className="cards-grid">
            <div className="card card-green">
              <div className="card-icon">🤝</div>
              <h3 className="card-title">Mobilização Social</h3>
              <p className="card-text">
                Conectamos voluntários, ONGs, escolas e empresas em mutirões de
                plantio e manutenção de áreas verdes. Cada árvore plantada é uma
                vitória coletiva construída por mãos unidas.
              </p>
            </div>

            <div className="card card-green">
              <div className="card-icon">📚</div>
              <h3 className="card-title">Educação Ambiental</h3>
              <p className="card-text">
                Oferecemos oficinas, palestras e conteúdos digitais sobre
                sustentabilidade urbana, arborização, compostagem e consumo
                consciente. Empoderamos cidadãos para serem agentes ativos da
                mudança.
              </p>
            </div>

            <div className="card card-green">
              <div className="card-icon">🗺️</div>
              <h3 className="card-title">Tecnologia Cidadã</h3>
              <p className="card-text">
                Nosso Dicionário Verde e mapa interativo permitem que qualquer
                pessoa identifique espécies nativas, saiba onde plantar e
                acompanhe o impacto das ações em tempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Junte-se ao movimento</h2>
          <p className="cta-text">
            Seja parte da transformação das nossas cidades. Plante uma árvore,
            participe de um evento ou simplesmente compartilhe a ideia. Cada
            ação conta.
          </p>
          <a href="/rede" className="btn btn-primary btn-large">
            Quero fazer parte
          </a>
        </div>
      </section>
    </main>
  );
};

export default Home;