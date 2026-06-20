import { useState, useEffect } from 'react';
import './Eventos.css';

const eventos = [
  {
    id: 1,
    titulo: 'Mutirão de Plantio — Parque Linear',
    data: '15 de Julho de 2026',
    horario: '08h00 — 12h00',
    local: 'Parque Linear do Córrego, Setor Sul',
    imagem: 'https://placehold.co/600x300/1b5e20/a5d6a7?text=Mutir%C3%A3o+Parque+Linear',
    descricao:
      'Vamos plantar 150 mudas de árvores nativas ao longo do parque linear. O evento conta com educação ambiental, distribuição de mudas e um piquenique comunitário ao final.',
    voluntariosInscritos: 34,
    vagas: 60,
  },
  {
    id: 2,
    titulo: 'Reflorestamento Urbano — Escola Municipal',
    data: '22 de Julho de 2026',
    horario: '09h00 — 13h00',
    local: 'Escola Estadual Setor Sul',
    imagem: 'https://placehold.co/600x300/2e7d32/c8e6c9?text=Reflorestamento+Escola',
    descricao:
      'Mutirão para revitalizar o quintal da escola com horta comunitária, jardim de espécies nativas e árvores frutíferas. Alunos e moradores são todos bem-vindos!',
    voluntariosInscritos: 22,
    vagas: 50,
  },
  {
    id: 3,
    titulo: 'Plantio de Nascentes — APA Municipal',
    data: '29 de Julho de 2026',
    horario: '07h30 — 12h30',
    local: 'APA do Ribeirão Verde, Zona Rural',
    imagem: 'https://placehold.co/600x300/388e3c/a5d6a7?text=Plantio+Nascentes',
    descricao:
      'Ação de recuperação de nascentes com plantio de 200 mudas de espécies ciliares. Inclui trilha guiada e oficina de compostagem doméstica.',
    voluntariosInscritos: 45,
    vagas: 80,
  },
];

const conquistasLista = [
  { icone: '🌱', titulo: 'Primeiro Plantio', descricao: 'Inscreva-se no seu 1º mutirão', desbloqueada: true },
  { icone: '🌳', titulo: 'Eco-Herói', descricao: 'Participe de 3 mutirões', desbloqueada: true },
  { icone: '📅', titulo: 'Presença em Mutirão', descricao: 'Compareça a 1 evento', desbloqueada: true },
  { icone: '💚', titulo: 'Coração Verde', descricao: 'Convide 2 amigos', desbloqueada: false },
  { icone: '🏆', titulo: 'Guardião da Natureza', descricao: 'Plante 50 mudas', desbloqueada: false },
];

const Eventos = () => {
  const [voluntarioStatus, setVoluntarioStatus] = useState({});

  const handleVoluntariar = (id) => {
    setVoluntarioStatus((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  return (
    <section className="eventos-section" id="eventos">
      <div className="eventos-container">
        {/* ===== Painel do Voluntário (Hero/Banner) ===== */}
        <div className="painel-voluntario">
          <div className="painel-voluntario-content">
            <div className="painel-voluntario-texto">
              <span className="painel-voluntario-badge">🤝 Voluntariado</span>
              <h2 className="painel-voluntario-title">Faça Parte da Mudança!</h2>
              <p className="painel-voluntario-descricao">
                O voluntariado é a força que transforma cidades cinzentas em florestas urbanas.
                Cada muda plantada combate as <strong>ilhas de calor</strong>, reduz o
                <strong> desmatamento urbano</strong> e devolve qualidade de vida à nossa
                comunidade. Sua mão na terra é o primeiro passo para um futuro mais verde e justo.
              </p>
            </div>

            <div className="painel-estatisticas">
              <div className="stat-card">
                <span className="stat-icone">🌳</span>
                <strong className="stat-valor">+500</strong>
                <span className="stat-rotulo">Árvores Plantadas</span>
              </div>
              <div className="stat-card">
                <span className="stat-icone">👥</span>
                <strong className="stat-valor">120</strong>
                <span className="stat-rotulo">Voluntários Ativos</span>
              </div>
              <div className="stat-card">
                <span className="stat-icone">📍</span>
                <strong className="stat-valor">5</strong>
                <span className="stat-rotulo">Bairros Atendidos</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Layout Principal: Sidebar + Conteúdo ===== */}
        <div className="eventos-layout-duas-colunas">
          {/* ===== Sidebar — Perfil & Conquistas ===== */}
          <aside className="sidebar-conquistas">
            {/* Perfil do Voluntário */}
            <div className="perfil-voluntario-card">
              <div className="perfil-avatar">
                <span className="perfil-avatar-inicial">M</span>
                <span className="perfil-level-badge">3</span>
              </div>
              <h3 className="perfil-nome">Maria Silva</h3>
              <div className="perfil-nivel">
                <span className="perfil-nivel-label">Nível</span>
                <strong className="perfil-nivel-valor">3 — Cuidador de Mudas</strong>
              </div>
              <div className="perfil-xp-bar">
                <div className="perfil-xp-fill" style={{ width: '65%' }} />
              </div>
              <span className="perfil-xp-text">650 / 1000 XP para o próximo nível</span>
            </div>

            {/* Conquistas / Medalhas */}
            <div className="conquistas-card">
              <h4 className="conquistas-titulo">🏅 Conquistas</h4>
              <ul className="conquistas-lista">
                {conquistasLista.map((c, i) => (
                  <li
                    key={i}
                    className={`conquista-item ${c.desbloqueada ? '' : 'conquista-bloqueada'}`}
                  >
                    <span className="conquista-icone">{c.icone}</span>
                    <div className="conquista-info">
                      <strong className="conquista-nome">{c.titulo}</strong>
                      <span className="conquista-desc">{c.descricao}</span>
                    </div>
                    <span className="conquista-status">
                      {c.desbloqueada ? '✅' : '🔒'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ===== Conteúdo principal ===== */}
          <div className="eventos-conteudo-principal">
            {/* Cabeçalho */}
            <div className="eventos-header">
              <span className="eventos-badge">🌳 Ações Coletivas</span>
              <h1 className="eventos-title">Eventos Comunitários</h1>
              <p className="eventos-subtitle">
                Participe dos mutirões de plantio e reflorestamento urbano. Junte-se a
                voluntários, ONGs e escolas para transformar a cidade com mais verde.
              </p>
            </div>

            {/* Grid de eventos */}
            <div className="eventos-grid">
              {eventos.map((evento) => (
                <article className="evento-card" key={evento.id}>
                  <div className="evento-img-wrapper">
                    <img
                      className="evento-img"
                      src={evento.imagem}
                      alt={evento.titulo}
                      loading="lazy"
                    />
                    <div className="evento-data-badge">
                      <span className="evento-data-dia">
                        {evento.data.split(' ')[0]}
                      </span>
                      <span className="evento-data-mes">
                        {evento.data.split(' ')[2]?.replace(',', '') || ''} {evento.data.split(' ')[1]}
                      </span>
                    </div>
                  </div>

                  <div className="evento-body">
                    <h2 className="evento-titulo">{evento.titulo}</h2>

                    <div className="evento-info">
                      <div className="evento-info-item">
                        <span className="evento-info-icon">📅</span>
                        <div>
                          <strong>Data e Horário</strong>
                          <p>
                            {evento.data} • {evento.horario}
                          </p>
                        </div>
                      </div>
                      <div className="evento-info-item">
                        <span className="evento-info-icon">📍</span>
                        <div>
                          <strong>Local</strong>
                          <p>{evento.local}</p>
                        </div>
                      </div>
                    </div>

                    <p className="evento-descricao">{evento.descricao}</p>

                    <div className="evento-footer">
                      <div className="evento-vagas">
                        <div className="vagas-bar">
                          <div
                            className="vagas-bar-fill"
                            style={{
                              width: `${Math.min(
                                (evento.voluntariosInscritos / evento.vagas) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="vagas-text">
                          {evento.voluntariosInscritos} de {evento.vagas} vagas preenchidas
                        </span>
                      </div>

                      {voluntarioStatus[evento.id] ? (
                        <button className="btn-voluntario btn-inscrito" disabled>
                          ✅ Você está inscrito!
                        </button>
                      ) : (
                        <button
                          className="btn-voluntario"
                          onClick={() => handleVoluntariar(evento.id)}
                        >
                          🌿 Quero ser Voluntário
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Eventos;