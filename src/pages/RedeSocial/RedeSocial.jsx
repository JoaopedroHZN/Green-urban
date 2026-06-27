import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import Avatar from '../../components/Avatar/Avatar';
import './RedeSocial.css';

const API_BASE = 'http://localhost:4000';

const getIniciais = (nome) => {
  if (!nome) return '?';
  return nome.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
};

const getImagemUrl = (caminho) => {
  if (!caminho) return null;
  if (caminho.startsWith('http')) return caminho;
  return `${API_BASE}${caminho}`;
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

  const scrollCarrossel = (direcao) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth;
    el.scrollBy({
      left: direcao === 'esquerda' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCurrentIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="carrossel-container">
      <button
        className="carrossel-btn carrossel-btn--esquerda"
        onClick={() => scrollCarrossel('esquerda')}
        aria-label="Imagem anterior"
      >
        ‹
      </button>
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
      <button
        className="carrossel-btn carrossel-btn--direita"
        onClick={() => scrollCarrossel('direita')}
        aria-label="Próxima imagem"
      >
        ›
      </button>
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

// ============================================================
//  Componente: NovoPostForm
// ============================================================
const NovoPostForm = ({ onPostCreated, userId }) => {
  const [legenda, setLegenda] = useState('');
  const [arquivos, setArquivos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validas = files.filter((f) => f.type.startsWith('image/'));
    if (validas.length !== files.length) { setErroForm('Apenas imagens.'); return; }
    if (validas.length > 5) { setErroForm('Máx. 5 imagens.'); return; }
    setErroForm('');
    setArquivos(validas);
  };

  const removerArquivo = (idx) => {
    setArquivos((prev) => prev.filter((_, i) => i !== idx));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePostar = async () => {
    if (!legenda.trim() || !userId) return;
    setEnviando(true); setErroForm('');
    try {
      const fd = new FormData();
      fd.append('autorId', userId);
      fd.append('legenda', legenda.trim());
      arquivos.forEach((f) => fd.append('imagens', f));
      const res = await fetch(`${API_BASE}/api/postagens`, { method: 'POST', body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.erro || 'Erro.'); }
      const d = await res.json();
      setLegenda(''); setArquivos([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onPostCreated && d.post) onPostCreated(d.post);
    } catch (err) { setErroForm(err.message); }
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
      {erroForm && <p className="novo-post-erro">{erroForm}</p>}
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
  const { usuario, userId, recarregar } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
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

  const handlePostCreated = (novoPost) => {
    recarregar();
    setPosts((prev) => [novoPost, ...prev]);
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
        <NovoPostForm onPostCreated={handlePostCreated} userId={userId} />

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
            <p>Nenhuma publicação ainda. Seja o primeiro a postar!</p>
          </div>
        )}

        {!loading && !erro && (
          <div className="feed">
            {posts.map((post) => (
              <article className="feed-post" key={post._id}>
                <div className="post-header">
                  <Avatar
                    fotoUrl={post.fotoPerfil}
                    nome={post.autor}
                    tamanho="sm"
                  />
                  <div>
                    <strong className="post-usuario">{post.autor}</strong>
                    <span className="post-tempo">
                      {post.criadoEm
                        ? new Date(post.criadoEm).toLocaleDateString('pt-BR')
                        : 'Agora mesmo'}
                    </span>
                  </div>
                </div>

                <PostCarrossel imagens={post.imagens} legenda={post.legenda} />

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