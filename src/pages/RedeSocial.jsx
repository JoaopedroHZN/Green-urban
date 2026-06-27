import { useState, useEffect, useRef } from 'react';
import './RedeSocial.css';

const API_URL = 'http://localhost:4000';

const getIniciais = (nome) => {
  if (!nome) return '?';
  return nome.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
};

const getImagemUrl = (caminho) => {
  if (!caminho) return null;
  if (caminho.startsWith('http')) return caminho;
  return `${API_URL}${caminho}`;
};

// ============================================================
//  Componente: PostCarrossel (Carrossel estilo Instagram)
// ============================================================
const PostCarrossel = ({ imagens, legenda }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  if (!imagens || imagens.length === 0) {
    return (
      <div className="post-img-wrapper post-img-placeholder">
        <span>🌿</span><p>Sem imagem</p>
      </div>
    );
  }

  if (imagens.length === 1) {
    return (
      <div className="post-img-wrapper">
        <img className="post-img" src={getImagemUrl(imagens[0])}
          alt={legenda || 'Imagem do post'} loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.classList.add('post-img-error');
          }} />
      </div>
    );
  }

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCurrentIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="carrossel-container">
      <div className="carrossel-scroll" ref={scrollRef} onScroll={handleScroll}>
        {imagens.map((img, idx) => (
          <div className="carrossel-item" key={idx}>
            <img src={getImagemUrl(img)}
              alt={`${legenda || 'Imagem'} ${idx + 1}`}
              loading="lazy" draggable={false}
              onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
        ))}
      </div>
      <div className="carrossel-indicators">
        {imagens.map((_, idx) => (
          <button key={idx}
            className={`carrossel-dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => {
              const el = scrollRef.current;
              if (el) el.scrollTo({ left: el.clientWidth * idx, behavior: 'smooth' });
            }}
            aria-label={`Imagem ${idx + 1} de ${imagens.length}`} />
        ))}
      </div>
    </div>
  );
};

const NovoPostForm = ({ onPostCreated, userId }) => {
  const [legenda, setLegenda] = useState('');
  const [arquivos, setArquivos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validas = files.filter((f) => f.type.startsWith('image/'));
    if (validas.length !== files.length) { setErro('Apenas imagens.'); return; }
    if (validas.length > 5) { setErro('Máx. 5 imagens.'); return; }
    setErro('');
    setArquivos(validas);
  };

  const removerArquivo = (idx) => {
    setArquivos((prev) => prev.filter((_, i) => i !== idx));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePostar = async () => {
    if (!legenda.trim() || !userId) return;
    setEnviando(true); setErro('');
    try {
      const fd = new FormData();
      fd.append('autorId', userId);
      fd.append('legenda', legenda.trim());
      arquivos.forEach((f) => fd.append('imagens', f));
      const res = await fetch(`${API_URL}/api/postagens`, { method: 'POST', body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.erro || 'Erro.'); }
      const d = await res.json();
      setLegenda(''); setArquivos([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onPostCreated && d.post) onPostCreated(d.post);
    } catch (err) { setErro(err.message); }
    finally { setEnviando(false); }
  };

  return (
    <div className="novo-post-card">
      <div className="novo-post-header">
        <h3 className="novo-post-titulo">Nova publicação</h3>
      </div>
      <textarea className="novo-post-textarea"
        placeholder="O que você plantou hoje? 🌳"
        value={legenda} onChange={(e) => setLegenda(e.target.value)} maxLength={500} />
      {arquivos.length > 0 && (
        <div className="novo-post-previews">
          {arquivos.map((f, i) => (
            <div className="novo-post-preview-item" key={i}>
              <img src={URL.createObjectURL(f)} alt={`Preview ${i + 1}`} />
              <button className="novo-post-preview-remove"
                onClick={() => removerArquivo(i)} type="button">✕</button>
            </div>
          ))}
        </div>
      )}
      <div className="novo-post-file-area">
        <input ref={fileInputRef} type="file" multiple accept="image/*"
          name="imagens" id="post-imagens-input"
          className="novo-post-file-input" onChange={handleFileChange} />
        <label htmlFor="post-imagens-input" className="novo-post-file-label">
          📷 {arquivos.length > 0 ? `${arquivos.length} foto(s)` : 'Adicionar fotos'}
        </label>
        <span className="novo-post-file-hint">Máx. 5 imagens</span>
      </div>
      {erro && <p className="novo-post-erro">{erro}</p>}
      <div className="novo-post-actions">
        <span className="novo-post-hint">{legenda.length}/500</span>
        <button className="btn-postar" onClick={handlePostar}
          disabled={!legenda.trim() || enviando}>
          {enviando ? '⏳ Publicando...' : '🌿 Publicar'}
        </button>
      </div>
    </div>
  );
};

const RedeSocial = () => {
  const [posts, setPosts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroFeed, setErroFeed] = useState('');
  const [comentarioInput, setComentarioInput] = useState({});
  const [showComentarios, setShowComentarios] = useState({});

  const getUserId = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    if (token.startsWith('token-simples-')) return token.replace('token-simples-', '');
    return null;
  };
  const userId = getUserId();

  const fetchPosts = async () => {
    try {
      setCarregando(true);
      const q = userId ? `?userId=${userId}` : '';
      const res = await fetch(`${API_URL}/api/postagens${q}`);
      if (!res.ok) throw new Error('Erro ao carregar.');
      const data = await res.json();
      if (data.sucesso) setPosts(data.posts);
    } catch (err) {
      setErroFeed('Servidor offline? Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePostCreated = (novoPost) => { setPosts((prev) => [novoPost, ...prev]); };

  const handleCurtir = async (postId) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/postagens/${postId}/curtir`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('Erro ao curtir.');
      const data = await res.json();
      setPosts((prev) => prev.map((p) =>
        p._id === postId ? { ...p, curtidas: data.curtidas, curtido: data.curtido } : p));
    } catch (err) { /* silencioso */ }
  };

  const handleComentar = async (postId) => {
    if (!userId) return;
    const texto = comentarioInput[postId]?.trim();
    if (!texto) return;
    try {
      const res = await fetch(`${API_URL}/api/postagens/${postId}/comentar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: 'Você', texto }),
      });
      if (!res.ok) throw new Error('Erro ao comentar.');
      const data = await res.json();
      setPosts((prev) => prev.map((p) =>
        p._id === postId ? { ...p, comentarios: data.comentarios } : p));
      setComentarioInput((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) { /* silencioso */ }
  };

  const toggleComentarios = (postId) => {
    setShowComentarios((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const formatarTempo = (dataISO) => {
    if (!dataISO) return '';
    const diffMin = Math.floor((new Date() - new Date(dataISO)) / 60000);
    if (diffMin < 1) return 'Agora mesmo';
    if (diffMin < 60) return `Há ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Há ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `Há ${diffD}d`;
    return new Date(dataISO).toLocaleDateString('pt-BR');
  };

  return (
    <section className="rede-section">
      <div className="rede-container">
        <header className="rede-header">
          <span className="rede-badge">🌿 Comunidade</span>
          <h2 className="rede-title">Rede Social</h2>
          <p className="rede-subtitle">
            Compartilhe suas experiências de plantio urbano e inspire outras pessoas a
            transformar a cidade em um lugar mais verde!
          </p>
        </header>

        {/* Formulário ou mensagem de login */}
        {userId ? (
          <NovoPostForm onPostCreated={handlePostCreated} userId={userId} />
        ) : (
          <div className="novo-post-card" style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#78909c' }}>🔒 Faça login para publicar.</p>
          </div>
        )}

        {/* Carregando */}
        {carregando && (
          <div className="feed-loading">
            <div className="feed-loading-spinner" />
            <p>Carregando publicações...</p>
          </div>
        )}

        {/* Erro */}
        {erroFeed && !carregando && (
          <div className="feed-error">
            <p>{erroFeed}</p>
            <button onClick={fetchPosts}>🔄 Tentar novamente</button>
          </div>
        )}

        {/* Feed */}
        {!carregando && !erroFeed && (
          <div className="feed">
            {posts.length === 0 ? (
              <div className="feed-empty">
                <span>🌿</span>
                <p>Nenhuma publicação ainda. Seja o primeiro a compartilhar!</p>
              </div>
            ) : (
              posts.map((post) => (
                <article className="feed-post" key={post._id}>
                  <div className="post-header">
                    <div className="post-avatar-fallback">
                      {getIniciais(post.autor)}
                    </div>
                    <div>
                      <strong className="post-usuario">{post.autor}</strong>
                      <span className="post-tempo">{formatarTempo(post.criadoEm)}</span>
                    </div>
                  </div>

                  <PostCarrossel imagens={post.imagens} legenda={post.legenda} />

                  <p className="post-legenda">{post.legenda}</p>

                  <div className="post-actions">
                    <button
                      className={`post-btn ${post.curtido ? 'curtido' : ''}`}
                      onClick={() => handleCurtir(post._id)}
                      disabled={!userId}
                    >
                      {post.curtido ? '❤️' : '🤍'} {post.curtidas}
                    </button>
                    <button
                      className="post-btn"
                      onClick={() => toggleComentarios(post._id)}
                    >
                      💬{' '}
                      {post.comentarios && post.comentarios.length > 0
                        ? post.comentarios.length
                        : 'Comentar'}
                    </button>
                  </div>

                  <div
                    className={`post-comentarios ${
                      showComentarios[post._id] || (post.comentarios && post.comentarios.length > 0)
                        ? 'visible' : ''
                    }`}
                  >
                    {post.comentarios && post.comentarios.length > 0 && (
                      <div className="comentarios-lista">
                        <h4 className="comentarios-titulo">
                          Comentários ({post.comentarios.length})
                        </h4>
                        {post.comentarios.map((c, idx) => (
                          <div className="comentario" key={c._id || idx}>
                            <strong>{c.usuario}</strong>
                            <p>{c.texto}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {showComentarios[post._id] && userId && (
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
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default RedeSocial;