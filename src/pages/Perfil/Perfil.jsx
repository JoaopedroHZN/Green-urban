import { useUser } from '../../contexts/UserContext';
import { Link } from 'react-router-dom';
import './Perfil.css';

// ============================================================
//  Página de Perfil (Meu Painel) — Green Urban
//  Exibe nome, nível, XP, conquistas e estatísticas do usuário
//  consumindo dados dinâmicos do UserContext (MongoDB).
// ============================================================

const conquistasDisponiveis = [
  { icone: '🌱', titulo: 'Primeiro Plantio', descricao: 'Inscreva-se no seu 1º mutirão' },
  { icone: '🌳', titulo: 'Eco-Herói', descricao: 'Participe de 3 mutirões' },
  { icone: '📅', titulo: 'Presença em Mutirão', descricao: 'Compareça a 1 evento' },
  { icone: '💚', titulo: 'Coração Verde', descricao: 'Convide 2 amigos' },
  { icone: '🏆', titulo: 'Guardião da Natureza', descricao: 'Plante 50 mudas' },
];

function calcularNivel(pontuacao) {
  if (pontuacao < 100) return { nivel: 1, titulo: 'Semente Iniciante', xp: pontuacao, xpMax: 100 };
  if (pontuacao < 300) return { nivel: 2, titulo: 'Broto Verde', xp: pontuacao - 100, xpMax: 200 };
  if (pontuacao < 600) return { nivel: 3, titulo: 'Cuidador de Mudas', xp: pontuacao - 300, xpMax: 300 };
  if (pontuacao < 1000) return { nivel: 4, titulo: 'Jardineiro Urbano', xp: pontuacao - 600, xpMax: 400 };
  return { nivel: 5, titulo: 'Guardião da Floresta', xp: pontuacao - 1000, xpMax: 500 };
}

const Perfil = () => {
  const { usuario, loading, erro } = useUser();

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
  const role = usuario.role || 'user';
  const { nivel, titulo, xp, xpMax } = calcularNivel(pontuacao);
  const xpPercent = Math.min((xp / xpMax) * 100, 100);

  const conquistasExibicao = conquistasDisponiveis.map((c) => ({
    ...c,
    desbloqueada: conquistasUsuario.includes(c.titulo),
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
          {/* ===== Card de Identidade ===== */}
          <div className="perfil-card perfil-card--principal">
            <div className="perfil-avatar">
              <span className="perfil-avatar-inicial">
                {nome.charAt(0).toUpperCase()}
              </span>
              <span className="perfil-level-badge">{nivel}</span>
            </div>
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
              ⭐ {pontuacao} XP total • {xp} / {xpMax} XP para o nível {nivel + 1}
            </span>
          </div>

          {/* ===== Card de Estatísticas ===== */}
          <div className="perfil-card perfil-card--stats">
            <h3 className="perfil-stats-title">📊 Minhas Estatísticas</h3>
            <div className="perfil-stats-grid">
              <div className="stat-item">
                <span className="stat-icone">⭐</span>
                <strong>{pontuacao}</strong>
                <span>XP Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-icone">🌳</span>
                <strong>{conquistasUsuario.length}</strong>
                <span>Conquistas</span>
              </div>
              <div className="stat-item">
                <span className="stat-icone">📅</span>
                <strong>0</strong>
                <span>Eventos</span>
              </div>
              <div className="stat-item">
                <span className="stat-icone">📢</span>
                <strong>0</strong>
                <span>Postagens</span>
              </div>
            </div>
          </div>

          {/* ===== Card de Conquistas ===== */}
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

          {/* ===== Links Rápidos ===== */}
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