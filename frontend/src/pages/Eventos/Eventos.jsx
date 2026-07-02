import { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import './Eventos.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Eventos = () => {
  const navigate = useNavigate();
  const { usuario } = useUser();

  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [inscritosIds, setInscritosIds] = useState([]);
  const [inscrevendo, setInscrevendo] = useState({});

  // Busca eventos da API real
  useEffect(() => {
    const buscarEventos = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`${API_BASE}/api/eventos`, { headers });

        if (!res.ok) {
          throw new Error('Erro ao carregar eventos');
        }

        const data = await res.json();
        setEventos(data.eventos);

        // Marca eventos em que o usuário já está inscrito
        const userId = usuario?._id || usuario?.id;
        if (userId) {
          const ids = data.eventos
            .filter((ev) =>
              ev.inscritos?.some(
                (insc) => insc.usuarioId?.toString
                  ? insc.usuarioId.toString() === userId
                  : insc.usuarioId === userId
              )
            )
            .map((ev) => ev._id);
          setInscritosIds(ids);
        }
      } catch (err) {
        console.error('Erro ao carregar eventos:', err);
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    buscarEventos();
  }, [usuario]);

  // Inscrever em um evento (chama API real)
  const handleVoluntariar = async (eventoId) => {
    setInscrevendo((prev) => ({ ...prev, [eventoId]: true }));
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/eventos/${eventoId}/inscrever`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.erro || 'Erro ao se inscrever');
        return;
      }

      // Marca como inscrito localmente
      setInscritosIds((prev) => [...prev, eventoId]);

      // Dispara recarga do perfil (UserContext)
      window.dispatchEvent(new Event('auth-change'));
    } catch (err) {
      alert('Erro de conexão ao se inscrever.');
    } finally {
      setInscrevendo((prev) => ({ ...prev, [eventoId]: false }));
    }
  };

  // Criar evento — redireciona para página de criação
  const handleCriarEvento = () => {
    navigate('/eventos/criar');
  };

  // Calcula nível do usuário com base no XP
  const pontuacao = usuario?.xp ?? 0;
  const nivel = Math.floor(pontuacao / 100) + 1;
  const role = usuario?.role || 'user';
  const podeCriar = role === 'admin' || nivel >= 5;
  const usuarioNovato = !podeCriar;

  // Formata data para exibição
  const formatarData = (dataISO) => {
    try {
      const data = new Date(dataISO);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return dataISO;
    }
  };

  const formatarMesDia = (dataISO) => {
    try {
      const data = new Date(dataISO);
      const dia = data.getUTCDate();
      const mes = data.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' });
      return { dia, mes };
    } catch {
      return { dia: '?', mes: '?' };
    }
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
                <span className="stat-icone">⭐</span>
                <strong className="stat-valor">{pontuacao}</strong>
                <span className="stat-rotulo">XP Total</span>
              </div>
              <div className="stat-card">
                <span className="stat-icone">🎯</span>
                <strong className="stat-valor">{nivel}</strong>
                <span className="stat-rotulo">Nível</span>
              </div>
              <div className="stat-card">
                <span className="stat-icone">📅</span>
                <strong className="stat-valor">{inscritosIds.length}</strong>
                <span className="stat-rotulo">Inscrições</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Conteúdo principal ===== */}
        <div className="eventos-conteudo-principal">
          <div className="eventos-header">
            <span className="eventos-badge">🌳 Ações Coletivas</span>
            <h1 className="eventos-title">Eventos Comunitários</h1>
            <p className="eventos-subtitle">
              Participe dos mutirões de plantio e reflorestamento urbano. Junte-se a
              voluntários, ONGs e escolas para transformar a cidade com mais verde.
            </p>
          </div>

          {/* Botão de criar evento */}
          <div className="eventos-criar-area">
            {usuarioNovato ? (
              <p className="eventos-bloqueio-msg">
                🔒 Alcance o <strong>Nível 5</strong> ({5 * 100} XP) para criar eventos.
                Você está no <strong>Nível {nivel}</strong> com {pontuacao} XP.
              </p>
            ) : (
              <button className="btn-criar-evento" onClick={handleCriarEvento}>
                🌟 Criar Novo Evento
                {role === 'admin' ? ' (Admin)' : ' (Nível 5+)'}
              </button>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
              <span>⏳</span>
              <p>Carregando eventos...</p>
            </div>
          )}

          {/* Erro */}
          {erro && !loading && (
            <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
              <span>⚠️</span>
              <p>Não foi possível carregar os eventos. Tente novamente.</p>
            </div>
          )}

          {/* Grid de eventos */}
          {!loading && !erro && (
            <div className="eventos-grid">
              {eventos.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                  <span>🌿</span>
                  <h3>Nenhum evento ainda</h3>
                  <p>Seja o primeiro a criar um evento comunitário!</p>
                </div>
              ) : (
                eventos.map((evento) => {
                  const { dia, mes } = formatarMesDia(evento.data);
                  const jaInscrito = inscritosIds.includes(evento._id);
                  const vagasPreenchidas = evento.inscritos?.length || 0;

                  return (
                    <article
                      className="evento-card"
                      key={evento._id}
                      onClick={() => navigate(`/eventos/${evento._id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="evento-img-wrapper" onClick={(e) => e.stopPropagation()}>
                        <img
                          className="evento-img"
                          src={
                            evento.imagemUrl ||
                            `https://placehold.co/600x300/2e7d32/c8e6c9?text=${encodeURIComponent(evento.titulo?.substring(0, 20) || 'Evento')}`
                          }
                          alt={evento.titulo}
                          loading="lazy"
                        />
                        <div className="evento-data-badge">
                          <span className="evento-data-dia">{dia}</span>
                          <span className="evento-data-mes">{mes}</span>
                        </div>
                      </div>

                      <div className="evento-body">
                        <div className="evento-header-top">
                          <h2 className="evento-titulo">{evento.titulo}</h2>
                          <span className="evento-porte-badge">
                            {evento.porte === 'larga escala' ? '🌍 Larga Escala' : '🏘️ Pequeno/Médio'}
                          </span>
                        </div>

                        <div className="evento-info">
                          <div className="evento-info-item">
                            <span className="evento-info-icon">📅</span>
                            <div>
                              <strong>Data e Horário</strong>
                              <p>{formatarData(evento.data)} • {evento.horario || 'A definir'}</p>
                            </div>
                          </div>
                          <div className="evento-info-item">
                            <span className="evento-info-icon">📍</span>
                            <div>
                              <strong>Local</strong>
                              <p>{evento.local || 'A definir'}</p>
                            </div>
                          </div>
                        </div>

                        <p className="evento-descricao">{evento.descricao}</p>

                        {/* XP do evento */}
                        {evento.xpTotal > 0 && (
                          <div style={{
                            marginBottom: 12,
                            fontSize: '0.82rem',
                            color: '#426b00',
                            fontWeight: 600,
                          }}>
                            ⭐ +{evento.xpTotal} XP ao concluir
                          </div>
                        )}

                        <div className="evento-footer">
                          <div className="evento-vagas">
                            <div className="vagas-bar">
                              <div
                                className="vagas-bar-fill"
                                style={{
                                  width: `${evento.vagas > 0
                                    ? Math.min((vagasPreenchidas / evento.vagas) * 100, 100)
                                    : 0}%`,
                                }}
                              />
                            </div>
                            <span className="vagas-text">
                              {vagasPreenchidas} de {evento.vagas || '∞'} vagas preenchidas
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {jaInscrito ? (
                              <button className="btn-voluntario btn-inscrito" disabled>
                                ✅ Inscrito
                              </button>
                            ) : (
                              <button
                                className="btn-voluntario"
                                onClick={(e) => { e.stopPropagation(); handleVoluntariar(evento._id); }}
                                disabled={inscrevendo[evento._id]}
                              >
                                {inscrevendo[evento._id] ? '⏳ Inscrevendo...' : '🌿 Quero ser Voluntário'}
                              </button>
                            )}

                            {/* Botão Gerenciar Check-ins (apenas dono do evento) */}
                            {usuario && evento.criadoPor && String(usuario._id || usuario.id) === String(evento.criadoPor._id || evento.criadoPor) && (
                              <button
                                className="btn-voluntario"
                                onClick={(e) => { e.stopPropagation(); navigate(`/eventos/gerenciar/${evento._id}`); }}
                                style={{
                                  background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                                  border: 'none',
                                }}
                              >
                                ⚙️ Gerenciar Check-ins
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Eventos;