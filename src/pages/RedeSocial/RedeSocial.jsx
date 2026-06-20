import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';
import './RedeSocial.css';

const API_BASE = 'http://localhost:4000';

const RedeSocial = () => {
  const { usuario, userId } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [novoPostTexto, setNovoPostTexto] = useState('');
  const [postando, setPostando] = useState(false);
  const [comentarioInput, setComentarioInput] = useState({});
  const [showComentarios, setShowComentarios] = useState({});

  const nomeUsuario = usuario?.nome || 'Voluntário(a)';

  // Carrega postagens da API
  const carregarPosts = useCallback(async () => {
    try {
      setErro(null);
      const res = await fetch(`${API_BASE}/api/postagens?userId=${userId}`);
      if (!res.ok) throw new Error('Erro ao carregar');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('❌ Erro ao carregar posts:', err.message);
      setErro('Não foi possível carregar o feed. O backend está rodando?');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    carregarPosts();
  }, [carregarPosts]);

  // Criar postagem
  const handlePostar = async () => {
    if (!novoPostTexto.trim()) return;
    setPostando(true);

    try {
      const res = await fetch(`${API_BASE}/api/postagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autorId: userId,
          legenda: novoPostTexto.trim(),
          imagemUrl: '',
        }),
      });

      if (!res.ok) throw new Error('Erro ao postar');
      const data = await res.json();

      setPosts((prev) => [data.post, ...prev]);
      setNovoPostTexto('');
    } catch (err) {
      console.error('❌ Erro ao postar:', err.message);
    } finally {
      setPostando(false);
    }
  };

  // Curtir
  const handleCurtir = async (postId) => {
    try {
      const res = await fetch(`${API_BASE}/api/postagens/${postId}/curtir`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('Erro ao curtir');
      const data = await res.json();

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, curtidas: data.curtidas, curtido: data.curtido } : p
        )
      );
    } catch (err) {
      console.error('❌ Erro ao curtir:', err.message);
    }
  };

  // Comentar
  const handleComentar = async (postId) => {
    const texto = comentarioInput[postId]?.trim();
    if (!texto) return;

    try {
      const res = await fetch(`${API_BASE}/api/postagens/${postId}/comentar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: nomeUsuario, texto }),
      });

      if (!res.ok) throw new Error('Erro ao comentar');
      const data = await res.json();

      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comentarios: data.comentarios } : p))
      );
      setComentarioInput((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('❌ Erro ao comentar:', err.message);
    }
  };

  const toggleComentarios = (postId) => {
    setShowComentarios((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <section className="rede-section" id="rede">
      <div className="rede-container">
        {/* Cabeçalho */}
        <div className="rede-header">
          <span className="rede-badge">🌐 Conecte-se</span>
          <h1 className="rede-title">Rede Social Verde</h1>
          <p className="rede-subtitle">
            Compartilhe suas experiências, fotos de plantios e conquistas
            ambientais. Inspire e seja inspirado pela comunidade Green Urban.
          </p>

          {/* Card rápido do perfil */}
          <div className="rede-perfil-mini">
            <span className="rede-perfil-emoji">🌿</span>
            <div>
              <strong>{nomeUsuario}</strong>
              <span>⭐ {usuario?.pontuacaoTotal ?? 0} pontos</span>
            </div>
          </div>
        </div>

        {/* Nova publicação */}
        <div className="novo-post-card">
          <div className="novo-post-header">
            <span className="novo-post-avatar">🌿</span>
            <h3 className="novo-post-titulo">Compartilhe sua experiência</h3>
          </div>
          <textarea
            className="novo-post-textarea"
            placeholder={`O que você plantou hoje, ${nomeUsuario.split(' ')[0]}? Compartilhe com a comunidade...`}
            value={novoPostTexto}
            onChange={(e) => setNovoPostTexto(e.target.value)}
            rows={3}
          />
          <div className="novo-post-actions">
            <span className="novo-post-hint">
              🌱 Mostre para todos o seu impacto verde!
            </span>
            <button
              className="btn-postar"
              onClick={handlePostar}
              disabled={!novoPostTexto.trim() || postando}
            >
              {postando ? '⏳ Postando...' : '📢 Postar'}
            </button>
          </div>
        </div>

        {/* Feed de posts */}
        {loading && (
          <div className="feed-loading">
            <p>⏳ Carregando publicações...</p>
          </div>
        )}

        {erro && !loading && (
          <div className="feed-erro">
            <p>⚠️ {erro}</p>
          </div>
        )}

        {!loading && !erro && posts.length === 0 && (
          <div className="feed-vazio">
            <p>🌱 Nenhuma publicação ainda. Seja o primeiro a postar!</p>
          </div>
        )}

        {!loading && !erro && (
          <div className="feed">
            {posts.map((post) => (
              <article className="feed-post" key={post._id}>
                <div className="post-header">
                  <div className="post-avatar-placeholder">🌱</div>
                  <div>
                    <strong className="post-usuario">{post.autor}</strong>
                    <span className="post-tempo">
                      {post.criadoEm
                        ? new Date(post.criadoEm).toLocaleDateString('pt-BR')
                        : 'Agora mesmo'}
                    </span>
                  </div>
                </div>

                {post.imagemUrl && (
                  <div className="post-img-wrapper">
                    <img
                      className="post-img"
                      src={post.imagemUrl}
                      alt="Planta do usuário"
                      loading="lazy"
                    />
                  </div>
                )}

                <p className="post-legenda">{post.legenda}</p>

                <div className="post-actions">
                  <button
                    className={`post-btn ${post.curtido ? 'curtido' : ''}`}
                    onClick={() => handleCurtir(post._id)}
                  >
                    {post.curtido ? '❤️' : '🤍'} {post.curtidas}
                  </button>
                  <button
                    className="post-btn"
                    onClick={() => toggleComentarios(post._id)}
                  >
                    💬{' '}
                    {post.comentarios?.length > 0
                      ? `${post.comentarios.length}`
                      : 'Comentar'}
                  </button>
                </div>

                <div
                  className={`post-comentarios ${
                    showComentarios[post._id] || post.comentarios?.length > 0
                      ? 'visible'
                      : ''
                  }`}
                >
                  {post.comentarios?.length > 0 && (
                    <div className="comentarios-lista">
                      <h4 className="comentarios-titulo">
                        Comentários ({post.comentarios.length})
                      </h4>
                      {post.comentarios.map((c, i) => (
                        <div className="comentario" key={c._id || i}>
                          <strong>{c.usuario}</strong>
                          <p>{c.texto}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {showComentarios[post._id] && (
                    <div className="comentar-form">
                      <input
                        type="text"
                        className="comentar-input"
                        placeholder="Escreva um comentário..."
                        value={comentarioInput[post._id] || ''}
                        onChange={(e) =>
                          setComentarioInput((prev) => ({
                            ...prev,
                            [post._id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleComentar(post._id);
                        }}
                      />
                      <button
                        className="comentar-btn"
                        onClick={() => handleComentar(post._id)}
                        disabled={!comentarioInput[post._id]?.trim()}
                      >
                        Enviar
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RedeSocial;