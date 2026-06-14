import { useState } from 'react';
import './DicionarioVerde.css';

const plantas = [
  {
    id: 1,
    nomePopular: 'Ipê Amarelo',
    nomeCientifico: 'Handroanthus albus',
    imagem: 'https://placehold.co/600x400/1b5e20/a5d6a7?text=Ip%C3%AA+Amarelo',
    condicoes: {
      sol: 'Sol pleno',
      agua: 'Moderada — 2x por semana',
      espaco: 'Grande — raízes profundas',
    },
    descricao:
      'Árvore nativa brasileira de grande porte, famosa por sua floração amarela exuberante. Ideal para praças e calçadas amplas.',
  },
  {
    id: 2,
    nomePopular: 'Pitanga',
    nomeCientifico: 'Eugenia uniflora',
    imagem: 'https://placehold.co/600x400/2e7d32/c8e6c9?text=Pitanga',
    condicoes: {
      sol: 'Sol pleno ou meia-sombra',
      agua: 'Regular — 3x por semana',
      espaco: 'Médio — até 6 m de altura',
    },
    descricao:
      'Árvore frutífera nativa da Mata Atlântica. Produz frutos vermelhos ricos em vitamina C e atrai pássaros.',
  },
  {
    id: 3,
    nomePopular: 'Jabuticabeira',
    nomeCientifico: 'Plinia cauliflora',
    imagem: 'https://placehold.co/600x400/388e3c/a5d6a7?text=Jabuticabeira',
    condicoes: {
      sol: 'Sol pleno',
      agua: 'Frequente — manter solo úmido',
      espaco: 'Médio — crescimento lento',
    },
    descricao:
      'Árvore símbolo da Mata Atlântica. Seus frutos crescem diretamente no tronco e são deliciosos in natura.',
  },
  {
    id: 4,
    nomePopular: 'Quaresmeira',
    nomeCientifico: 'Tibouchina granulosa',
    imagem: 'https://placehold.co/600x400/43a047/a5d6a7?text=Quaresmeira',
    condicoes: {
      sol: 'Sol pleno',
      agua: 'Moderada — 2x por semana',
      espaco: 'Médio a grande — até 10 m',
    },
    descricao:
      'Árvore ornamental de floração roxa intensa. Muito utilizada na arborização urbana por sua beleza e adaptabilidade.',
  },
  {
    id: 5,
    nomePopular: 'Aroeira Salsa',
    nomeCientifico: 'Schinus molle',
    imagem: 'https://placehold.co/600x400/1b5e20/a5d6a7?text=Aroeira+Salsa',
    condicoes: {
      sol: 'Sol pleno',
      agua: 'Baixa — resistente à seca',
      espaco: 'Grande — copa ampla',
    },
    descricao:
      'Árvore de crescimento rápido e copa densa. Excelente para sombra e recuperação de áreas degradadas.',
  },
  {
    id: 6,
    nomePopular: 'Manacá da Serra',
    nomeCientifico: 'Tibouchina mutabilis',
    imagem: 'https://placehold.co/600x400/2e7d32/c8e6c9?text=Manac%C3%A1+da+Serra',
    condicoes: {
      sol: 'Sol pleno ou meia-sombra',
      agua: 'Moderada — 2x por semana',
      espaco: 'Médio — até 7 m',
    },
    descricao:
      'Árvore de flores que mudam de cor (branco, rosa, roxo). Muito ornamental e perfeita para jardins urbanos.',
  },
];

const PlantaCard = ({ planta }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="planta-card">
      <div className="planta-img-wrapper">
        {imgError ? (
          <div className="planta-img-placeholder">
            🌿
            <span>{planta.nomePopular}</span>
          </div>
        ) : (
          <img
            className="planta-img"
            src={planta.imagem}
            alt={planta.nomePopular}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        <span className="planta-selo">🌱</span>
      </div>
      <div className="planta-body">
        <h2 className="planta-nome">{planta.nomePopular}</h2>
        <p className="planta-cientifico">
          <em>{planta.nomeCientifico}</em>
        </p>
        <p className="planta-descricao">{planta.descricao}</p>

        <div className="planta-condicoes">
          <h3 className="condicoes-title">Condições Ideais</h3>
          <div className="condicoes-grid">
            <div className="condicao-item">
              <span className="condicao-icon">☀️</span>
              <div>
                <strong>Sol</strong>
                <p>{planta.condicoes.sol}</p>
              </div>
            </div>
            <div className="condicao-item">
              <span className="condicao-icon">💧</span>
              <div>
                <strong>Água</strong>
                <p>{planta.condicoes.agua}</p>
              </div>
            </div>
            <div className="condicao-item">
              <span className="condicao-icon">📐</span>
              <div>
                <strong>Espaço</strong>
                <p>{planta.condicoes.espaco}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

const DicionarioVerde = () => {
  const [search, setSearch] = useState('');

  const filtered = plantas.filter(
    (p) =>
      p.nomePopular.toLowerCase().includes(search.toLowerCase()) ||
      p.nomeCientifico.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="dicionario-section" id="dicionario">
      <div className="dicionario-container">
        {/* Cabeçalho */}
        <div className="dicionario-header">
          <span className="dicionario-badge">📖 Nosso Acervo</span>
          <h1 className="dicionario-title">Dicionário Verde</h1>
          <p className="dicionario-subtitle">
            Explore espécies nativas e adaptadas para o reflorestamento urbano.
            Encontre a planta ideal para cada espaço da sua cidade.
          </p>
        </div>

        {/* Barra de pesquisa */}
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nome popular ou científico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch('')}
              aria-label="Limpar pesquisa"
            >
              ✕
            </button>
          )}
        </div>

        {/* Contador de resultados */}
        <p className="result-count">
          {filtered.length === 1
            ? '1 planta encontrada'
            : `${filtered.length} plantas encontradas`}
        </p>

        {/* Grid de cards */}
        <div className="plantas-grid">
          {filtered.map((planta) => (
            <PlantaCard key={planta.id} planta={planta} />
          ))}
        </div>

        {/* Estado vazio */}
        {filtered.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🌿</span>
            <h3>Nenhuma planta encontrada</h3>
            <p>
              Tente buscar por outro termo, como "Ipê", "pitanga" ou "sol
              pleno".
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DicionarioVerde;