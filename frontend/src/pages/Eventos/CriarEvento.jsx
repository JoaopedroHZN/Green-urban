import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import './Eventos.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const CriarEvento = () => {
  const navigate = useNavigate();
  const { usuario } = useUser();

  const [formData, setFormData] = useState({
    titulo: '',
    data: '',
    horario: '',
    local: '',
    descricao: '',
    imagemUrl: '',
    vagas: '',
    porte: 'pequeno/medio',
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!formData.titulo || !formData.data) {
      setErro('Título e data são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/eventos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo: formData.titulo,
          data: formData.data,
          horario: formData.horario,
          local: formData.local,
          descricao: formData.descricao,
          imagemUrl: formData.imagemUrl,
          vagas: Number(formData.vagas) || 0,
          porte: formData.porte,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || 'Erro ao criar evento.');
        return;
      }

      // Redireciona para a lista de eventos
      navigate('/eventos');
    } catch {
      setErro('Erro de conexão ao criar evento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="eventos-section" style={{ paddingTop: '140px' }}>
      <div className="eventos-container" style={{ maxWidth: '700px' }}>
        <div className="eventos-header">
          <span className="eventos-badge">🌟 Novo Evento</span>
          <h1 className="eventos-title">Criar Evento</h1>
          <p className="eventos-subtitle">
            Organize um mutirão de plantio, reflorestamento ou ação comunitária.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #eef5db',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Título */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: 600, color: '#37474f', fontSize: '0.9rem' }}>Título *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ex: Mutirão de Plantio na Praça Central"
              required
              style={{
                padding: '12px 16px',
                border: '2px solid #eef5db',
                borderRadius: '10px',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Data */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: 600, color: '#37474f', fontSize: '0.9rem' }}>Data *</label>
            <input
              type="date"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
              style={{
                padding: '12px 16px',
                border: '2px solid #eef5db',
                borderRadius: '10px',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Horário + Local lado a lado */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontWeight: 600, color: '#37474f', fontSize: '0.9rem' }}>Horário</label>
              <input
                type="text"
                name="horario"
                value={formData.horario}
                onChange={handleChange}
                placeholder="Ex: 08h00 — 12h00"
                style={{
                  padding: '12px 16px',
                  border: '2px solid #eef5db',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontWeight: 600, color: '#37474f', fontSize: '0.9rem' }}>Porte</label>
              <select
                name="porte"
                value={formData.porte}
                onChange={handleChange}
                style={{
                  padding: '12px 16px',
                  border: '2px solid #eef5db',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  background: '#fff',
                }}
              >
                <option value="pequeno/medio">🏘️ Pequeno/Médio (100 XP)</option>
                <option value="medio">🏘️ Médio (250 XP)</option>
                <option value="grande">🌍 Grande (500 XP)</option>
              </select>
            </div>
          </div>

          {/* Local */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: 600, color: '#37474f', fontSize: '0.9rem' }}>Local</label>
            <input
              type="text"
              name="local"
              value={formData.local}
              onChange={handleChange}
              placeholder="Ex: Parque Linear do Córrego, Setor Sul"
              style={{
                padding: '12px 16px',
                border: '2px solid #eef5db',
                borderRadius: '10px',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Descrição */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: 600, color: '#37474f', fontSize: '0.9rem' }}>Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva o evento, o que será feito, quem pode participar..."
              rows={4}
              style={{
                padding: '12px 16px',
                border: '2px solid #eef5db',
                borderRadius: '10px',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Vagas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: 600, color: '#37474f', fontSize: '0.9rem' }}>Vagas</label>
            <input
              type="number"
              name="vagas"
              value={formData.vagas}
              onChange={handleChange}
              placeholder="0 = ilimitado"
              min="0"
              style={{
                padding: '12px 16px',
                border: '2px solid #eef5db',
                borderRadius: '10px',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Aviso XP automático */}
          <div style={{
            background: '#eef5db',
            border: '1px solid #7ba320',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '0.88rem',
            color: '#426b00',
            lineHeight: 1.6,
          }}>
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>💡</span>
            <span>
              O <strong>XP</strong> gerado por este evento será calculado e distribuído automaticamente pelo sistema com base no <strong>Porte</strong> selecionado.
            </span>
          </div>

          {/* Imagem URL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: 600, color: '#37474f', fontSize: '0.9rem' }}>URL da Imagem</label>
            <input
              type="url"
              name="imagemUrl"
              value={formData.imagemUrl}
              onChange={handleChange}
              placeholder="https://..."
              style={{
                padding: '12px 16px',
                border: '2px solid #eef5db',
                borderRadius: '10px',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Erro */}
          {erro && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}>
              ❌ {erro}
            </div>
          )}

          {/* Botões */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/eventos')}
              style={{
                padding: '12px 24px',
                borderRadius: '50px',
                border: '2px solid #eef5db',
                background: '#fff',
                color: '#546e7a',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                borderRadius: '50px',
                border: 'none',
                background: 'linear-gradient(135deg, #426b00, #426b00)',
                color: '#fff',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Criando...' : '🌿 Criar Evento'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CriarEvento;