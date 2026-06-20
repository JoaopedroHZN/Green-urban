import { useState, useEffect, useMemo } from 'react';
import './DicionarioVerde.css';

/**
 * =============================================================================
 *  📖 Dicionário Verde — Green Urban
 * =============================================================================
 *
 *  Funcionalidade:
 *    1. Busca todas as 200 plantas nativas do Cerrado via API /api/plantas.
 *    2. Permite busca por nome popular ou científico.
 *    3. Permite filtrar por tipo (Árvore, Frutífera, Ornamental, Arbusto, Palmeira).
 *    4. Paginação com no máximo 21 plantas por página.
 *    5. Renderiza cards com imagem, nome, sinopse, condições ideais e dica.
 *
 *  Acessibilidade:
 *    - Campo de busca com label visível e aria-label.
 *    - Cards com estrutura semântica <article>.
 *    - Foco visível em todos os interativos.
 * =============================================================================
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ITENS_POR_PAGINA = 21;

const TIPOS_DISPONIVEIS = [
  'Todos',
  'Árvore',
  'Frutífera',
  'Ornamental',
  'Arbusto',
  'Palmeira',
];

const iconeCondicao = (categoria, valor) => {
  if (categoria === 'sol') {
    return valor === 'Muito Sol' ? '☀️' : '🌥️';
  }
  if (categoria === 'espaco') {
    return valor === 'Pouco Espaço' ? '🏠' : '🌳';
  }
  if (categoria === 'rega') {
    return valor === 'Regamento Frequente' ? '💧' : '🌵';
  }
  return '🌿';
};

const PlantaCard = ({ planta }) => {
  return (
    <article className="planta-card">
      <div className="planta-img-wrapper">
        {planta.imagemUrl ? (
          <img
            className="planta-img"
            src={planta.imagemUrl}
            alt={planta.nomePopular}
            loading="lazy"
          />
        ) : (
          <div className="planta-img-placeholder">
            🌿
            <span>{planta.nomePopular}</span>
          </div>
        )}
        <span className="planta-selo">🌱</span>
      </div>
      <div className="planta-body">
        <span className="planta-tipo-badge">{planta.tipo}</span>
        <h2 className="planta-nome">{planta.nomePopular}</h2>
        <p className="planta-cientifico">
          <em>{planta.nomeCientifico}</em>
        </p>
        <p className="planta-descricao">{planta.sinopse}</p>

        <div className="planta-condicoes">
          <h3 className="condicoes-title">Condições Ideais</h3>
          <div className="condicoes-grid">
            <div className="condicao-item">
              <span className="condicao-icon">
                {iconeCondicao('sol', planta.condicoesIdeais.sol)}
              </span>
              <div>
                <strong>Sol</strong>
                <p>{planta.condicoesIdeais.sol}</p>
              </div>
            </div>
            <div className="condicao-item">
              <span className="condicao-icon">
                {iconeCondicao('espaco', planta.condicoesIdeais.espaco)}
              </span>
              <div>
                <strong>Espaço</strong>
                <p>{planta.condicoesIdeais.espaco}</p>
              </div>
            </div>
            <div className="condicao-item">
              <span className="condicao-icon">
                {iconeCondicao('rega', planta.condicoesIdeais.rega)}
              </span>
              <div>
                <strong>Rega</strong>
                <p>{planta.condicoesIdeais.rega}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="planta-dica-dicionario">
          <strong>💡 Dica:</strong> {planta.dicasCuidado}
        </div>
      </div>
    </article>
  );
};

const DicionarioVerde = () => {
  const [plantas, setPlantas] = useState([]);
  const [search, setSearch] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState('Todos');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    const buscarPlantas = async () => {
      try {
        const resposta = await fetch(`${API_BASE}/api/plantas`);
        if (!resposta.ok) throw new Error('Erro ao buscar plantas');
        const data = await resposta.json();
        setPlantas(data.plantas);
      } catch (err) {
        console.error('Erro ao carregar dicionário:', err);
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarPlantas();
  }, []);

  const filtered = useMemo(() => {
    return plantas.filter((p) => {
      const matchSearch =
        !search ||
        p.nomePopular.toLowerCase().includes(search.toLowerCase()) ||
        p.nomeCientifico.toLowerCase().includes(search.toLowerCase());

      const matchTipo = tipoSelecionado === 'Todos' || p.tipo === tipoSelecionado;

      return matchSearch && matchTipo;
    });
  }, [plantas, search, tipoSelecionado]);

  /* ---- Paginação ---- */
  const totalPaginas = Math.ceil(filtered.length / ITENS_POR_PAGINA);
  const paginaAtual = Math.min(pagina, Math.max(totalPaginas, 1));

  const plantasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return filtered.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [filtered, paginaAtual]);

  // Reseta a página ao alterar busca ou tipo
  const handleSearchChange = (valor) => {
    setSearch(valor);
    setPagina(1);
  };

  const handleTipoChange = (tipo) => {
    setTipoSelecionado(tipo);
    setPagina(1);
  };

  const handlePaginaMudar = (novaPagina) => {
    setPagina(novaPagina);
    // Scroll suave para o topo da seção
    document.getElementById('dicionario')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="dicionario-section" id="dicionario">
      <div className="dicionario-container">
        {/* Cabeçalho */}
        <div className="dicionario-header">
          <span className="dicionario-badge">📖 Nosso Acervo</span>
          <h1 className="dicionario-title">Dicionário Verde</h1>
          <p className="dicionario-subtitle">
            Explore mais de 200 espécies nativas do Cerrado Brasileiro.
            Encontre a planta ideal para cada espaço da sua cidade.
          </p>
        </div>

        {/* Barra de pesquisa + filtros de tipo */}
        <div className="dicionario-filtros">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nome popular ou científico..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              aria-label="Buscar plantas pelo nome"
            />
            {search && (
              <button
                className="search-clear"
                onClick={() => handleSearchChange('')}
                aria-label="Limpar pesquisa"
              >
                ✕
              </button>
            )}
          </div>

          <div className="tipos-filtro" role="radiogroup" aria-label="Filtrar por tipo de planta">
            {TIPOS_DISPONIVEIS.map((tipo) => (
              <button
                key={tipo}
                className={`tipo-btn ${tipoSelecionado === tipo ? 'tipo-btn--active' : ''}`}
                onClick={() => handleTipoChange(tipo)}
                aria-pressed={tipoSelecionado === tipo}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>

        {/* Estado de carregamento */}
        {carregando && (
          <div className="loading-state">
            <span className="loading-icon">⏳</span>
            <h3>Carregando o acervo...</h3>
            <p>Buscando as 200 plantas nativas do Cerrado</p>
          </div>
        )}

        {/* Estado de erro */}
        {erro && (
          <div className="empty-state">
            <span className="empty-icon">⚠️</span>
            <h3>Erro ao carregar as plantas</h3>
            <p>{erro}</p>
            <p>Verifique se o servidor backend está rodando em {API_BASE}</p>
          </div>
        )}

        {/* Contador de resultados */}
        {!carregando && !erro && (
          <p className="result-count">
            {filtered.length === 1
              ? '1 planta encontrada'
              : `${filtered.length} plantas encontradas`}{' '}
            {tipoSelecionado !== 'Todos' && `do tipo "${tipoSelecionado}"`}
            {totalPaginas > 1 &&
              ` — página ${paginaAtual} de ${totalPaginas}`}
          </p>
        )}

        {/* Grid de cards */}
        {!carregando && !erro && (
          <div className="plantas-grid">
            {plantasPaginadas.map((planta, index) => (
              <PlantaCard key={`${planta.nomePopular}-${paginaAtual}-${index}`} planta={planta} />
            ))}
          </div>
        )}

        {/* Paginação */}
        {!carregando && !erro && totalPaginas > 1 && (
          <nav className="paginacao" aria-label="Paginação de plantas">
            <button
              className="pagina-btn"
              onClick={() => handlePaginaMudar(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              aria-label="Página anterior"
            >
              ← Anterior
            </button>

            <div className="pagina-numeros">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  className={`pagina-numero ${num === paginaAtual ? 'pagina-numero--active' : ''}`}
                  onClick={() => handlePaginaMudar(num)}
                  aria-label={`Página ${num}`}
                  aria-current={num === paginaAtual ? 'page' : undefined}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              className="pagina-btn"
              onClick={() => handlePaginaMudar(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              aria-label="Próxima página"
            >
              Próximo →
            </button>
          </nav>
        )}

        {/* Estado vazio */}
        {!carregando && !erro && filtered.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🌿</span>
            <h3>Nenhuma planta encontrada</h3>
            <p>
              Tente buscar por outro termo, como "Ipê", "Baru" ou altere o filtro
              de tipo.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DicionarioVerde;