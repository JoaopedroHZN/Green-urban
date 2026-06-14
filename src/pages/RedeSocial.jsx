import { useState } from 'react';
import './RedeSocial.css';

const mockPosts = [
  {
    id: 1,
    usuario: 'Ana Oliveira',
    fotoPerfil: 'https://placehold.co/100x100/1b5e20/a5d6a7?text=AO',
    fotoPlanta: 'https://placehold.co/600x400/2e7d32/c8e6c9?text=Meu+Ip%C3%AA+Amarelo',
    legenda:
      'Acabei de plantar meu primeiro Ipê Amarelo aqui na praça do bairro! 🌳💚 #GreenUrban #Reflorestamento',
    curtidas: 24,
    comentarios: [
      { id: 101, usuario: 'Carlos Lima', texto: 'Que lindo! Vou plantar um também 🌱' },
      { id: 102, usuario: 'Juliana Castro', texto: 'Parabéns pela iniciativa!' },
    ],
  },
  {
    id: 2,
    usuario: 'Rafael Martins',
    fotoPerfil: 'https://placehold.co/100x100/2e7d32/c8e6c9?text=RM',
    fotoPlanta: 'https://placehold.co/600x400/388e3c/a5d6a7?text=Mutir%C3%A3o+Escola',
    legenda:
      'Mutirão de plantio na Escola Municipal foi um sucesso! 50 mudas plantadas em uma manhã. 🌿📚 #EducaçãoAmbiental',
    curtidas: 42,
    comentarios: [
      { id: 201, usuario: 'Ana Oliveira', texto: 'Que demais! Estou ansiosa para o próximo 🙌' },
    ],
  },
  {
    id: 3,
    usuario: 'Luciana Souza',
    fotoPerfil: 'https://placehold.co/100x100/388e3c/a5d6a7?text=LS',
    fotoPlanta: 'https://placehold.co/600x400/43a047/a5d6a7?text=Jabuticabeira',
    legenda:
      'Minha jabuticabeira já está dando frutos! 2 anos de cuidado e agora colhendo os resultados 🍇💚 #PlanteUmaÁrvore',
    curtidas: 56,
    comentarios: [
      { id: 301, usuario: 'Rafael Martins', texto: 'Que maravilha! Jabuticaba é vida ❤️' },
      { id: 302, usuario: 'Pedro Alves', texto: 'Qual o segredo para crescer tão rápido?' },
    ],
  },
  {
    id: 4,
    usuario: 'Pedro Alves',
    fotoPerfil: 'https://placehold.co/100x100/1b5e20/a5d6a7?text=PA',
    fotoPlanta: 'https://placehold.co/600x400/2e7d32/c8e6c9?text=Horta+Comunit%C3%A1ria',
    legenda:
      'Horta comunitária do bairro está linda! Alfaces, tomates e ervas frescas para toda a vizinhança 🌿🥬 #Sustentabilidade',
    curtidas: 31,
    comentarios: [],
  },
];

const RedeSocial = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [novoPostTexto, setNovoPostTexto] = useState('');
  const [comentarioInput, setComentarioInput] = useState({});
  const [showComentarios, setShowComentarios] = useState({});

  const handlePostar = () => {
    if (!novoPostTexto.trim()) return;

    const novoPost = {
      id: Date.now(),
      usuario: 'Você',
      fotoPerfil: 'https://placehold.co/100x100/43a047/a5d6a7?text=EU',
      fotoPlanta: 'https://placehold.co/600x400/1b5e20/a5d6a7?text=Meu+Plantio',
      legenda: novoPostTexto.trim(),
      curtidas: 0,
      comentarios: [],
    };

    setPosts([novoPost, ...posts]);
    setNovoPostTexto('');
  };

  const handleCurtir = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, curtidas: p.curtidas + 1, curtido: true } : p
      )
    );
  };

  const handleComentar = (postId) => {
    const texto = comentarioInput[postId]?.trim();
    if (!texto) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comentarios: [
                ...p.comentarios,
                { id: Date.now(), usuario: 'Você', texto },
              ],
            }
          : p
      )
    );
    setComentarioInput((prev) => ({ ...prev, [postId]: '' }));
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
          <h1 className="rede-title">Rede Social</h1>
          <p className="rede-subtitle">
            Compartilhe suas experiências, fotos de plantios e conquistas
            ambientais. Inspire e seja inspirado pela comunidade Green Urban.
          </p>
        </div>

        {/* Nova publicação */}
        <div className="novo-post-card">
          <div className="novo-post-header">
            <span className="novo-post-avatar">🌿</span>
            <h3 className="novo-post-titulo">Compartilhe sua experiência</h3>
          </div>
          <textarea
            className="novo-post-textarea"
            placeholder="O que você plantou hoje? Compartilhe com a comunidade..."
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
              disabled={!novoPostTexto.trim()}
            >
              📢 Postar
            </button>
          </div>
        </div>

        {/* Feed de posts */}
        <div className="feed">
          {posts.map((post) => (
            <article className="feed-post" key={post.id}>
              {/* Cabeçalho do post */}
              <div className="post-header">
                <img
                  className="post-avatar"
                  src={post.fotoPerfil}
                  alt={post.usuario}
                />
                <div>
                  <strong className="post-usuario">{post.usuario}</strong>
                  <span className="post-tempo">Agora mesmo</span>
                </div>
              </div>

              {/* Imagem da planta */}
              <div className="post-img-wrapper">
                <img
                  className="post-img"
                  src={post.fotoPlanta}
                  alt="Planta do usuário"
                  loading="lazy"
                />
              </div>

              {/* Legenda */}
              <p className="post-legenda">{post.legenda}</p>

              {/* Ações: Curtir e Comentar */}
              <div className="post-actions">
                <button
                  className={`post-btn ${post.curtido ? 'curtido' : ''}`}
                  onClick={() => handleCurtir(post.id)}
                >
                  {post.curtido ? '❤️' : '🤍'} {post.curtidas}
                </button>
                <button
                  className="post-btn"
                  onClick={() => toggleComentarios(post.id)}
                >
                  💬{' '}
                  {post.comentarios.length > 0
                    ? `${post.comentarios.length}`
                    : 'Comentar'}
                </button>
              </div>

              {/* Seção de comentários */}
              <div
                className={`post-comentarios ${
                  showComentarios[post.id] || post.comentarios.length > 0
                    ? 'visible'
                    : ''
                }`}
              >
                {post.comentarios.length > 0 && (
                  <div className="comentarios-lista">
                    <h4 className="comentarios-titulo">
                      Comentários ({post.comentarios.length})
                    </h4>
                    {post.comentarios.map((c) => (
                      <div className="comentario" key={c.id}>
                        <strong>{c.usuario}</strong>
                        <p>{c.texto}</p>
                      </div>
                    ))}
                  </div>
                )}

                {showComentarios[post.id] && (
                  <div className="comentar-form">
                    <input
                      type="text"
                      className="comentar-input"
                      placeholder="Escreva um comentário..."
                      value={comentarioInput[post.id] || ''}
                      onChange={(e) =>
                        setComentarioInput((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleComentar(post.id);
                      }}
                    />
                    <button
                      className="comentar-btn"
                      onClick={() => handleComentar(post.id)}
                      disabled={!comentarioInput[post.id]?.trim()}
                    >
                      Enviar
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RedeSocial;