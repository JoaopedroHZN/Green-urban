import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Eventos.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Função auxiliar para montar URL absoluta das fotos de check-in
// O backend Express (porta 4000) serve a pasta uploads via express.static
const montarUrlFoto = (caminho) => {
  if (!caminho) return '';
  const base = API_BASE; // http://localhost:4000
  // Garante que o caminho comece com /uploads/
  if (caminho.startsWith('/uploads/')) return `${base}${caminho}`;
  if (caminho.startsWith('uploads/')) return `${base}/${caminho}`;
  // Fallback: extrai o trecho uploads/... se estiver no meio do caminho
  const match = caminho.match(/(uploads\/.*)/);
  return match ? `${base}/${match[1]}` : `${base}/${caminho}`;
};

const GerenciarEvento = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [gerandoPin, setGerandoPin] = useState(false);
  const [aprovando, setAprovando] = useState({});
  const [abaAtiva, setAbaAtiva] = useState('pendentes'); // 'pendentes' | 'aprovados'
  const [modalFoto, setModalFoto] = useState(null);

  // Busca evento pelo ID
  const carregarEvento = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/eventos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.erro || 'Evento não encontrado');
      }

      setEvento(data.evento);
    } catch (err) {
      console.error('Erro ao carregar evento:', err);
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEvento();
  }, [id]);

  // Gerar PIN
  const handleGerarPin = async () => {
    setGerandoPin(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/eventos/${id}/gerar-pin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.erro || 'Erro ao gerar PIN');
        return;
      }

      // Atualiza o evento localmente
      setEvento((prev) => ({ ...prev, pinCheckin: data.pin }));
    } catch {
      alert('Erro de conexão ao gerar PIN.');
    } finally {
      setGerandoPin(false);
    }
  };

  // Aprovar check-in
  const handleAprovar = async (idInscrito) => {
    setAprovando((prev) => ({ ...prev, [idInscrito]: true }));
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/eventos/${id}/aprovar/${idInscrito}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.erro || 'Erro ao aprovar');
        return;
      }

      // Recarrega o evento
      carregarEvento();
    } catch {
      alert('Erro de conexão ao aprovar.');
    } finally {
      setAprovando((prev) => ({ ...prev, [idInscrito]: false }));
    }
  };

  // Recusar check-in (reseta status para 'inscrito' e limpa foto)
  const handleRecusar = async (idInscrito) => {
    if (!confirm('Tem certeza que deseja recusar este comprovante? O inscrito precisará enviar novamente.')) return;

    try {
      const token = localStorage.getItem('auth_token');
      // Usa um endpoint simples de rejeição (PATCH no próprio array de inscritos)
      const res = await fetch(`${API_BASE}/api/eventos/${id}/rejeitar/${idInscrito}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.erro || 'Erro ao recusar');
        return;
      }

      carregarEvento();
    } catch {
      alert('Erro de conexão ao recusar.');
    }
  };

  // Agrupa inscritos por status
  const pendentes = evento?.inscritos?.filter((i) => i.status === 'pendente') || [];
  const aprovados = evento?.inscritos?.filter((i) => i.status === 'aprovado') || [];
  const inscritos = evento?.inscritos?.filter((i) => i.status === 'inscrito') || [];

  if (loading) {
    return (
      <section className="eventos-section" style={{ paddingTop: '140px' }}>
        <div className="eventos-container" style={{ textAlign: 'center' }}>
          <p>⏳ Carregando painel de gestão...</p>
        </div>
      </section>
    );
  }

  if (erro || !evento) {
    return (
      <section className="eventos-section" style={{ paddingTop: '140px' }}>
        <div className="eventos-container" style={{ textAlign: 'center' }}>
          <p>⚠️ {erro || 'Evento não encontrado.'}</p>
          <button
            onClick={() => navigate('/eventos')}
            style={{
              marginTop: '12px',
              padding: '10px 24px',
              borderRadius: '50px',
              border: '2px solid #2e7d32',
              background: '#fff',
              color: '#2e7d32',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            ← Voltar para Eventos
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="eventos-section" style={{ paddingTop: '140px' }}>
      <div className="eventos-container" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <span className="eventos-badge">⚙️ Gestão</span>
            <h1 className="eventos-title" style={{ fontSize: '1.8rem', margin: '8px 0' }}>{evento.titulo}</h1>
            <p style={{ color: '#546e7a', margin: 0 }}>
              {evento.data ? new Date(evento.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}
              {evento.horario ? ` • ${evento.horario}` : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/eventos')}
            style={{
              padding: '10px 20px',
              borderRadius: '50px',
              border: '2px solid #c8e6c9',
              background: '#fff',
              color: '#546e7a',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            ← Voltar
          </button>
        </div>

        {/* ===== PAINEL SUPERIOR: O PIN ===== */}
        <div style={{
          background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '28px',
          textAlign: 'center',
          color: '#fff',
        }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 600, opacity: 0.9 }}>
            🔑 Código de Presença (PIN)
          </h2>
          {evento.pinCheckin ? (
            <div style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              letterSpacing: '8px',
              fontFamily: 'monospace',
              margin: '12px 0',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}>
              {evento.pinCheckin}
            </div>
          ) : (
            <button
              onClick={handleGerarPin}
              disabled={gerandoPin}
              style={{
                padding: '16px 32px',
                borderRadius: '50px',
                border: '2px solid rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontWeight: 700,
                cursor: gerandoPin ? 'not-allowed' : 'pointer',
                fontSize: '1.1rem',
                margin: '12px 0',
                opacity: gerandoPin ? 0.7 : 1,
              }}
            >
              {gerandoPin ? '⏳ Gerando...' : '🔑 Gerar PIN de Presença'}
            </button>
          )}
          <p style={{ margin: '8px 0 0', fontSize: '0.85rem', opacity: 0.75 }}>
            Compartilhe este código com os participantes para validar presença no dia do evento.
          </p>
        </div>

        {/* ===== PAINEL INFERIOR: Fila de Validação ===== */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e8f5e9',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e8f5e9',
          }}>
            <button
              onClick={() => setAbaAtiva('pendentes')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                background: abaAtiva === 'pendentes' ? '#e8f5e9' : '#fff',
                color: abaAtiva === 'pendentes' ? '#1b5e20' : '#546e7a',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                borderBottom: abaAtiva === 'pendentes' ? '3px solid #2e7d32' : '3px solid transparent',
                fontFamily: 'inherit',
              }}
            >
              ⏳ Pendentes ({pendentes.length})
            </button>
            <button
              onClick={() => setAbaAtiva('aprovados')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                background: abaAtiva === 'aprovados' ? '#e8f5e9' : '#fff',
                color: abaAtiva === 'aprovados' ? '#1b5e20' : '#546e7a',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                borderBottom: abaAtiva === 'aprovados' ? '3px solid #2e7d32' : '3px solid transparent',
                fontFamily: 'inherit',
              }}
            >
              ✅ Aprovados ({aprovados.length})
            </button>
            <button
              onClick={() => setAbaAtiva('inscritos')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                background: abaAtiva === 'inscritos' ? '#e8f5e9' : '#fff',
                color: abaAtiva === 'inscritos' ? '#1b5e20' : '#546e7a',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                borderBottom: abaAtiva === 'inscritos' ? '3px solid #2e7d32' : '3px solid transparent',
                fontFamily: 'inherit',
              }}
            >
              📋 Inscritos ({inscritos.length})
            </button>
          </div>

          {/* Conteúdo da aba */}
          <div style={{ padding: '24px' }}>
            {/* Aba Pendentes */}
            {abaAtiva === 'pendentes' && (
              pendentes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#78909c' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>📭</span>
                  <p>Nenhum check-in pendente de validação.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {pendentes.map((inscricao) => {
                    const usuario = inscricao.usuarioId;
                    const nome = usuario?.nome || 'Usuário';
                    return (
                      <div
                        key={inscricao.usuarioId?._id || inscricao.usuarioId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '16px',
                          borderRadius: '12px',
                          background: '#fafffa',
                          border: '1px solid #e8f5e9',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2e7d32, #43a047)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '1.2rem',
                          flexShrink: 0,
                        }}>
                          {nome.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: '150px' }}>
                          <strong style={{ color: '#1b5e20', display: 'block' }}>{nome}</strong>
                          <span style={{ fontSize: '0.82rem', color: '#78909c' }}>Check-in pendente</span>
                        </div>

                        {/* Miniatura da foto */}
                        {inscricao.fotoComprovante && (
                          <div
                            onClick={() => setModalFoto(montarUrlFoto(inscricao.fotoComprovante))}
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: '2px solid #c8e6c9',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={montarUrlFoto(inscricao.fotoComprovante)}
                              alt="Comprovante"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                console.error('Falha ao carregar imagem no caminho:', e.target.src);
                                e.target.src = 'https://placehold.co/80?text=Sem+Foto';
                              }}
                            />
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button
                            onClick={() => handleAprovar(inscricao.usuarioId?._id || inscricao.usuarioId)}
                            disabled={aprovando[inscricao.usuarioId?._id || inscricao.usuarioId]}
                            style={{
                              padding: '10px 20px',
                              borderRadius: '50px',
                              border: 'none',
                              background: '#2e7d32',
                              color: '#fff',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              opacity: aprovando[inscricao.usuarioId?._id || inscricao.usuarioId] ? 0.7 : 1,
                            }}
                          >
                            {aprovando[inscricao.usuarioId?._id || inscricao.usuarioId] ? '⏳' : '✅'} Aprovar
                          </button>
                          <button
                            onClick={() => handleRecusar(inscricao.usuarioId?._id || inscricao.usuarioId)}
                            style={{
                              padding: '10px 20px',
                              borderRadius: '50px',
                              border: '2px solid #ef9a9a',
                              background: '#fff',
                              color: '#c62828',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                            }}
                          >
                            ❌ Recusar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Aba Aprovados */}
            {abaAtiva === 'aprovados' && (
              aprovados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#78909c' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>🏆</span>
                  <p>Nenhum check-in aprovado ainda.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {aprovados.map((inscricao) => {
                    const usuario = inscricao.usuarioId;
                    const nome = usuario?.nome || 'Usuário';
                    return (
                      <div
                        key={inscricao.usuarioId?._id || inscricao.usuarioId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '14px',
                          borderRadius: '12px',
                          background: '#e8f5e9',
                          border: '1px solid #a5d6a7',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #ffb300, #ffc107)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#1b5e20',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          flexShrink: 0,
                        }}>
                          {nome.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <strong style={{ color: '#1b5e20' }}>{nome}</strong>
                          <span style={{ display: 'block', fontSize: '0.82rem', color: '#2e7d32' }}>
                            ✅ Presença confirmada • +{Math.round(evento.xpTotal * 0.8)} XP
                          </span>
                        </div>
                        {inscricao.fotoComprovante && (
                          <div
                            onClick={() => setModalFoto(montarUrlFoto(inscricao.fotoComprovante))}
                            style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: '2px solid #a5d6a7',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={montarUrlFoto(inscricao.fotoComprovante)}
                              alt="Comprovante"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                console.error('Falha ao carregar imagem no caminho:', e.target.src);
                                e.target.src = 'https://placehold.co/80?text=Sem+Foto';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Aba Inscritos */}
            {abaAtiva === 'inscritos' && (
              inscritos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#78909c' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>📋</span>
                  <p>Nenhum inscrito.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {inscritos.map((inscricao) => {
                    const usuario = inscricao.usuarioId;
                    const nome = usuario?.nome || 'Usuário';
                    return (
                      <div
                        key={inscricao.usuarioId?._id || inscricao.usuarioId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: '#f5f5f5',
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>👤</span>
                        <span style={{ color: '#37474f', fontWeight: 500 }}>{nome}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#78909c' }}>
                          Aguardando check-in
                        </span>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Modal de foto ampliada */}
      {modalFoto && (
        <div
          onClick={() => setModalFoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '24px',
          }}
        >
          <img
            src={modalFoto}
            alt="Comprovante ampliado"
            style={{
              maxWidth: '90%',
              maxHeight: '85vh',
              borderRadius: '12px',
              objectFit: 'contain',
            }}
          />
          <button
            onClick={() => setModalFoto(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              fontSize: '1.5rem',
              cursor: 'pointer',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
};

export default GerenciarEvento;