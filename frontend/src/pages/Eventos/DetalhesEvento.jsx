import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import './Eventos.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const DetalhesEvento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario: usuarioLogado } = useUser();
  const fileInputRef = useRef(null);

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Estados de ação
  const [inscrevendo, setInscrevendo] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erroCheckin, setErroCheckin] = useState('');

  // Carregar evento
  useEffect(() => {
    const carregar = async () => {
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

    carregar();
  }, [id]);

  // --- HELPERS ---
  const formatarData = (dataISO) => {
    try {
      return new Date(dataISO).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return dataISO;
    }
  };

  // Identificação do usuário
  const userId = usuarioLogado?._id || usuarioLogado?.id;
  const isDonoDoEvento = userId && evento?.criadoPor
    ? String(userId) === String(evento.criadoPor._id || evento.criadoPor)
    : false;

  const minhaInscricao = evento?.inscritos?.find(
    (i) => String(i.usuarioId?._id || i.usuarioId) === String(userId)
  );

  // --- AÇÕES ---
  // Cenário B: Inscrever-se
  const handleInscrever = async () => {
    setInscrevendo(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/eventos/${id}/inscrever`, {
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

      window.location.reload();
    } catch {
      alert('Erro de conexão ao se inscrever.');
    } finally {
      setInscrevendo(false);
    }
  };

  // Cenário D: Enviar Check-in (FormData + PIN + foto)
  const handleCheckin = async (e) => {
    e.preventDefault();
    setErroCheckin('');

    if (!pinInput.trim() || pinInput.trim().length !== 6) {
      setErroCheckin('Digite o PIN de 6 dígitos.');
      return;
    }

    if (!arquivo) {
      setErroCheckin('Selecione uma foto comprovante.');
      return;
    }

    setEnviando(true);
    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('pin', pinInput.trim());
      formData.append('foto', arquivo);

      const res = await fetch(`${API_BASE}/api/eventos/${id}/checkin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErroCheckin(data.erro || 'Erro ao enviar check-in');
        return;
      }

      window.location.reload();
    } catch {
      setErroCheckin('Erro de conexão ao enviar check-in.');
    } finally {
      setEnviando(false);
    }
  };

  // --- LOADING / ERRO ---
  if (loading) {
    return (
      <section className="eventos-section" style={{ paddingTop: '140px' }}>
        <div className="eventos-container" style={{ textAlign: 'center' }}>
          <p>⏳ Carregando evento...</p>
        </div>
      </section>
    );
  }

  if (erro || !evento) {
    return (
      <section className="eventos-section" style={{ paddingTop: '140px' }}>
        <div className="eventos-container" style={{ textAlign: 'center' }}>
          <p>⚠️ {erro || 'Evento não encontrado.'}</p>
          <Link to="/eventos" style={{ color: '#426b00', fontWeight: 600 }}>
            ← Voltar para Eventos
          </Link>
        </div>
      </section>
    );
  }

  const vagasPreenchidas = evento.inscritos?.length || 0;

  return (
    <section className="eventos-section" style={{ paddingTop: '140px' }}>
      <div className="eventos-container" style={{ maxWidth: '900px' }}>
        {/* Cabeçalho do Evento */}
        <div style={{ marginBottom: '32px' }}>
          <Link
            to="/eventos"
            style={{ color: '#426b00', fontWeight: 600, fontSize: '0.9rem' }}
          >
            ← Voltar para Eventos
          </Link>
          <div
            style={{
              display: 'flex',
              gap: '28px',
              marginTop: '16px',
              flexWrap: 'wrap',
            }}
          >
            {/* Imagem */}
            <div
              style={{
                width: '300px',
                height: '200px',
                borderRadius: '16px',
                overflow: 'hidden',
                flexShrink: 0,
                background: '#eef5db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={
                  evento.imagemUrl ||
                  `https://placehold.co/600x300/2e7d32/c8e6c9?text=${encodeURIComponent(
                    evento.titulo?.substring(0, 20) || 'Evento'
                  )}`
                }
                alt={evento.titulo}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <span
                className="eventos-badge"
                style={{ marginBottom: '8px', display: 'inline-block' }}
              >
                🌳 Evento
              </span>
              <h1
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#426b00',
                  margin: '8px 0',
                }}
              >
                {evento.titulo}
              </h1>
              <div style={{ color: '#546e7a', fontSize: '0.95rem', lineHeight: 1.7 }}>
                <p style={{ margin: '4px 0' }}>
                  📅 {formatarData(evento.data)} • {evento.horario || 'A definir'}
                </p>
                <p style={{ margin: '4px 0' }}>📍 {evento.local || 'A definir'}</p>
                <p style={{ margin: '4px 0' }}>
                  👥 {vagasPreenchidas} de {evento.vagas || '∞'} inscritos
                  {evento.porte
                    ? ` • ${
                        evento.porte === 'grande'
                          ? '🌍 Grande'
                          : evento.porte === 'medio'
                          ? '🏘️ Médio'
                          : '🏘️ Pequeno/Médio'
                      }`
                    : ''}
                </p>
                {evento.xpTotal > 0 && (
                  <p style={{ margin: '4px 0', color: '#426b00', fontWeight: 600 }}>
                    ⭐ +{evento.xpTotal} XP ao concluir
                  </p>
                )}
              </div>
            </div>
          </div>
          <p
            style={{
              color: '#546e7a',
              lineHeight: 1.7,
              marginTop: '20px',
              fontSize: '0.95rem',
            }}
          >
            {evento.descricao}
          </p>
        </div>

        {/* ===== ÁREA DE AÇÕES (6 cenários) ===== */}
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #eef5db',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            padding: '28px',
          }}
        >
          <h2
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#426b00',
              margin: '0 0 20px',
            }}
          >
            📋 Minha Situação
          </h2>

          {/* CENÁRIO A: Dono do evento */}
          {isDonoDoEvento && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: '#546e7a', marginBottom: '16px' }}>
                Você é o organizador deste evento.
              </p>
              <button
                className="btn-voluntario"
                onClick={() => navigate(`/eventos/gerenciar/${evento._id}`)}
                style={{
                  background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                  border: 'none',
                  padding: '14px 32px',
                }}
              >
                ⚙️ Gerenciar Check-ins
              </button>
            </div>
          )}

          {/* CENÁRIO B: Não inscrito */}
          {!isDonoDoEvento && !minhaInscricao && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: '#546e7a', marginBottom: '16px' }}>
                Participe deste evento e ganhe XP!
              </p>
              <button
                className="btn-voluntario"
                onClick={handleInscrever}
                disabled={inscrevendo}
                style={{ padding: '14px 32px' }}
              >
                {inscrevendo ? '⏳ Inscrevendo...' : '🌿 Quero me Inscrever'}
              </button>
            </div>
          )}

          {/* CENÁRIO C: Inscrito, PIN ainda não gerado */}
          {minhaInscricao?.status === 'inscrito' &&
            !evento.pinCheckin &&
            !isDonoDoEvento && (
              <div
                style={{
                  background: '#eef5db',
                  border: '1px solid #7ba320',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  color: '#426b00',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                }}
              >
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>✅</span>
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>
                    Inscrição confirmada!
                  </strong>
                  Você já garantiu {Math.round(evento.xpTotal * 0.2)} XP (20%). No dia e horário
                  do evento, o organizador liberará o PIN de presença aqui nesta tela.
                </div>
              </div>
            )}

          {/* CENÁRIO D: Check-in — PIN gerado */}
          {minhaInscricao?.status === 'inscrito' &&
            evento.pinCheckin &&
            !isDonoDoEvento && (
              <div>
                <div
                  style={{
                    background: '#e3f2fd',
                    border: '1px solid #90caf9',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    fontSize: '0.92rem',
                    color: '#1565c0',
                    lineHeight: 1.6,
                  }}
                >
                  <strong>🔑 Falta pouco!</strong> Digite o PIN falado pelo organizador e envie uma
                  foto do local para resgatar os {Math.round(evento.xpTotal * 0.8)} XP restantes (80%).
                </div>

                <form
                  onSubmit={handleCheckin}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  {/* Input PIN */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      style={{ fontWeight: 600, color: '#37474f', fontSize: '0.9rem' }}
                    >
                      PIN de 6 dígitos
                    </label>
                    <input
                      type="text"
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setErroCheckin('');
                      }}
                      placeholder="000000"
                      maxLength={6}
                      style={{
                        width: '200px',
                        padding: '14px 16px',
                        border: '2px solid #eef5db',
                        borderRadius: '12px',
                        fontSize: '1.6rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        letterSpacing: '8px',
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Input Foto */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      style={{ fontWeight: 600, color: '#37474f', fontSize: '0.9rem' }}
                    >
                      Foto do local
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setArquivo(e.target.files[0]);
                        setErroCheckin('');
                      }}
                      style={{
                        padding: '10px',
                        border: '2px solid #eef5db',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit',
                      }}
                    />
                    {arquivo && (
                      <span style={{ fontSize: '0.8rem', color: '#426b00', fontWeight: 500 }}>
                        📎 {arquivo.name}
                      </span>
                    )}
                  </div>

                  {erroCheckin && (
                    <div
                      style={{
                        background: '#ffebee',
                        color: '#c62828',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '0.88rem',
                      }}
                    >
                      ❌ {erroCheckin}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-voluntario"
                    disabled={enviando}
                    style={{ padding: '14px 32px', alignSelf: 'flex-start' }}
                  >
                    {enviando ? '⏳ Enviando...' : '📸 Enviar Check-in'}
                  </button>
                </form>
              </div>
            )}

          {/* CENÁRIO E: Pendente de aprovação */}
          {minhaInscricao?.status === 'pendente' && !isDonoDoEvento && (
            <div
              style={{
                background: '#fff8e1',
                border: '1px solid #ffe082',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                color: '#e65100',
                fontSize: '0.95rem',
                lineHeight: 1.7,
              }}
            >
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>⏳</span>
              <div>
                <strong style={{ display: 'block', marginBottom: '4px', color: '#bf360c' }}>
                  Comprovante enviado!
                </strong>
                O organizador está analisando sua foto. Assim que aprovado, os{' '}
                {Math.round(evento.xpTotal * 0.8)} XP restantes serão liberados.
              </div>
            </div>
          )}

          {/* CENÁRIO F: Aprovado */}
          {minhaInscricao?.status === 'aprovado' && !isDonoDoEvento && (
            <div
              style={{
                background: 'linear-gradient(135deg, #426b00, #426b00)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                color: '#ffffff',
              }}
            >
              <span
                style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}
              >
                🎉
              </span>
              <strong style={{ fontSize: '1.2rem', display: 'block', marginBottom: '6px' }}>
                Check-in Validado!
              </strong>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
                Você compareceu a este evento e resgatou 100% do XP!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DetalhesEvento;