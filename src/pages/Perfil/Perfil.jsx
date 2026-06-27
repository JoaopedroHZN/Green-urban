import { useRef, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { Link } from 'react-router-dom';
import Avatar from '../../components/Avatar/Avatar';
import './Perfil.css';

// ============================================================
//  Página de Perfil (Meu Painel) — Green Urban
//  Exibe nome, nível, XP, conquistas e estatísticas do usuário
//  consumindo dados dinâmicos do UserContext (MongoDB).
// ============================================================

// IDs devem bater com backend/services/conquistas.js
const conquistasDisponiveis = [
  { id: 'primeiro_broto', icone: '🌱', titulo: 'Primeiro Broto', descricao: 'Faça sua primeira postagem na Rede Social Verde' },
  { id: 'protetor_cerrado', icone: '🌾', titulo: 'Protetor do Cerrado', descricao: 'Participe do seu 1º evento de plantio' },
  { id: 'especialista_biomas', icone: '📚', titulo: 'Especialista em Biomas', descricao: 'Use o Assistente de Recomendação Inteligente' },
  { id: 'guardiao_veterano', icone: '🛡️', titulo: 'Guardião Veterano', descricao: 'Alcance o Nível 5 (500+ XP)' },
];

function calcularNivel(pontuacao) {
  if (pontuacao < 100) return { nivel: 1, titulo: 'Semente Iniciante', xp: pontuacao, xpMax: 100 };
  if (pontuacao < 300) return { nivel: 2, titulo: 'Broto Verde', xp: pontuacao - 100, xpMax: 200 };
  if (pontuacao < 600) return { nivel: 3, titulo: 'Cuidador de Mudas', xp: pontuacao - 300, xpMax: 300 };
  if (pontuacao < 1000) return { nivel: 4, titulo: 'Jardineiro Urbano', xp: pontuacao - 600, xpMax: 400 };
  return { nivel: 5, titulo: 'Guardião da Floresta', xp: pontuacao - 1000, xpMax: 500 };
}

const Perfil = () => {
  const { usuario, loading, erro, userId, recarregar } = useUser();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Upload de foto
  const handleFotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('fotoPerfil', file);
      formData.append('userId', userId);

      const res = await fetch('http://localhost:4000/api/usuarios/perfil/foto', {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) throw new Error('Erro ao enviar foto');

      const data = await res.json();
      // Atualiza o contexto com a nova foto
      recarregar();
    } catch (err) {
      console.error('❌ Erro ao fazer upload:', err.message);
    } finally {
      setUploading(false);
      // Limpa o input para permitir reenvio do mesmo arquivo
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <section className="perfil-section">
        <div className="perfil-container">
          <p className="perfil-loading">⏳ Carregando seu painel...</p>
        </div>
      </section>
    );
  }

  if (erro || !usuario) {
    return (
      <section className="perfil-section">
        <div className="perfil-container">
          <div className="perfil-erro">
            <span>⚠️</span>
            <p>Não foi possível carregar seu perfil. Tente novamente.</p>
            <Link to="/login" className="perfil-link-login">Ir para Login</Link>
          </div>
        </div>
      </section>
    );
  }

  const nome = usuario.nome;
  const pontuacao = usuario.xp ?? usuario.pontuacaoTotal ?? 0;
  const conquistasUsuario = usuario.listaConquistas || [];
  const estatisticas = usuario._estatisticas || { postagens: 0, eventos: 0 };
  const role = usuario.role || 'user';
  const { nivel, titulo, xp, xpMax } = calcularNivel(pontuacao);
  const xpPercent = Math.min((xp / xpMax) * 100, 100);

  const conquistasExibicao = conquistasDisponiveis.map((c) => ({
    ...c,
    desbloqueada: conquistasUsuario.includes(c.id),
  }));

  return (
    <section className="perfil-section">
      <div className="perfil-container">
        {/* ===== Cabeçalho ===== */}
        <header className="perfil-header-page">
          <span className="perfil-badge">👤 Meu Painel</span>
          <h1 className="perfil-title">Olá, {nome.split(' ')[0]}!</h1>
          <p className="perfil-subtitle">
            Acompanhe seu progresso, conquistas e impacto verde na comunidade.
          </p>
        </header>

        <div className="perfil-grid">
          {/* ===== Linha 1: Identidade + Estatísticas ===== */}
          <div className="perfil-topo">
            {/* Card de Identidade */}
            <div className="perfil-card perfil-card--identidade">
              {/* Avatar + câmera */}
              <div className="perfil-avatar-wrapper">
                <Avatar
                  fotoUrl={usuario.fotoPerfil}
                  nome={nome}
                  tamanho="lg"
                />

                {/* Input oculto para upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="perfil-file-input"
                />

                {/* Botão de câmera sobre o avatar */}
                <button
                  type="button"
                  className="perfil-camera-btn"
                  onClick={handleFotoClick}
                  disabled={uploading}
                  title="Trocar foto de perfil"
                  aria-label="Trocar foto de perfil"
                >
                  📷
                </button>
              </div>

              {uploading && (
                <p className="perfil-upload-msg">⏳ Enviando foto...</p>
              )}

              <h2 className="perfil-nome">{nome}</h2>

              {role === 'admin' && (
                <span className="perfil-admin-tag">🛡️ Admin</span>
              )}

              <div className="perfil-nivel">
                <span className="perfil-nivel-label">Nível</span>
                <strong className="perfil-nivel-valor">
                  {nivel} — {titulo}
                </strong>
              </div>

              <div className="perfil-xp-bar">
                <div className="perfil-xp-fill" style={{ width: `${xpPercent}%` }} />
              </div>
              <span className="perfil-xp-text">
                ⭐ {pontuacao} XP total • {xp} / {xpMax} XP
              </span>
            </div>

            {/* Card de Estatísticas */}
            <div className="perfil-card perfil-card--stats">
              <h3 className="perfil-stats-title">📊 Minhas Estatísticas</h3>
              <div className="perfil-stats-grid">
                <div className="stat-item">
                  <span className="stat-icone">⭐</span>
                  <strong>{pontuacao}</strong>
                  <span>XP Total</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icone">🏅</span>
                  <strong>{conquistasUsuario.length}</strong>
                  <span>Conquistas</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icone">📅</span>
                  <strong>{estatisticas.eventos}</strong>
                  <span>Eventos</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icone">📢</span>
                  <strong>{estatisticas.postagens}</strong>
                  <span>Postagens</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Linha 2: Conquistas ===== */}
          <div className="perfil-card perfil-card--conquistas">
            <h3 className="conquistas-titulo">🏅 Conquistas</h3>
            <ul className="conquistas-lista">
              {conquistasExibicao.map((c, i) => (
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

          {/* ===== Linha 3: Links Rápidos ===== */}
          <div className="perfil-card perfil-card--links">
            <h3 className="perfil-links-title">🔗 Links Rápidos</h3>
            <div className="perfil-links-grid">
              <Link to="/eventos" className="perfil-link-btn">
                🌳 Ver Eventos
              </Link>
              <Link to="/rede" className="perfil-link-btn">
                🌐 Rede Social
              </Link>
              <Link to="/assistente" className="perfil-link-btn">
                🌱 Assistente
              </Link>
              <Link to="/dicionario" className="perfil-link-btn">
                📖 Dicionário
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Perfil;