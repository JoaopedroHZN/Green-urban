import { useState, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import './RecomendacaoInteligente.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const iconeCondicao = (categoria, valor) => {
  if (categoria === 'sol') return valor === 'Muito Sol' ? '☀️' : '🌥️';
  if (categoria === 'espaco') return valor === 'Pouco Espaço' ? '🏠' : '🌳';
  if (categoria === 'rega') return valor === 'Regamento Frequente' ? '💧' : '🌵';
  return '🌿';
};

const PlantaCard = ({ planta }) => {
  return (
    <article
      className="planta-card-carrossel flex flex-col h-full bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
    >
      {planta.imagem ? (
        <img
          src={planta.imagem}
          alt={planta.nomePopular}
          className="w-full h-48 object-cover shrink-0"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-stone-100 text-5xl text-stone-300 shrink-0">
          🌿
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 gap-2.5">
        <span className="inline-block self-start text-[0.72rem] font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
          {planta.tipo}
        </span>

        <h3 className="text-lg font-bold text-slate-800 leading-tight">
          {planta.nomePopular}
        </h3>
        <p className="text-sm italic text-slate-400">
          {planta.nomeCientifico}
        </p>
        <p className="text-sm text-slate-500 leading-relaxed flex-1">
          {planta.sinopse}
        </p>

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-stone-100 px-2.5 py-1 rounded-lg">
            {iconeCondicao('sol', planta.condicoesIdeais.sol)} {planta.condicoesIdeais.sol}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-stone-100 px-2.5 py-1 rounded-lg">
            {iconeCondicao('espaco', planta.condicoesIdeais.espaco)} {planta.condicoesIdeais.espaco}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-stone-100 px-2.5 py-1 rounded-lg">
            {iconeCondicao('rega', planta.condicoesIdeais.rega)} {planta.condicoesIdeais.rega}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed pt-2.5 border-t border-stone-100 mt-auto">
          <strong className="text-slate-600">💡 Dica:</strong> {planta.dicasCuidado}
        </p>
      </div>
    </article>
  );
};

const RecomendacaoInteligente = () => {
  const { recarregar } = useUser();
  const [sol, setSol] = useState(null);
  const [espaco, setEspaco] = useState(null);
  const [rega, setRega] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [total, setTotal] = useState(0);
  const [buscou, setBuscou] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const opcoesSol = [
    { valor: 'Muito Sol', label: 'Muito Sol', icone: '☀️', descricao: 'Pleno sol / luz direta' },
    { valor: 'Sombra', label: 'Sombra', icone: '🌥️', descricao: 'Pouca luz / ambiente interno' },
  ];

  const opcoesEspaco = [
    { valor: 'Pouco Espaço', label: 'Pouco Espaço', icone: '🏠', descricao: 'Vasos / Apartamento' },
    { valor: 'Mais Espaço', label: 'Mais Espaço', icone: '🌳', descricao: 'Quintal / Calçada' },
  ];

  const opcoesRega = [
    { valor: 'Regamento Frequente', label: 'Rega Frequente', icone: '💧', descricao: 'Solo sempre úmido' },
    { valor: 'Baixo Regamento', label: 'Pouca Rega', icone: '🌵', descricao: 'Solo seco / esporádico' },
  ];

  const handleBuscar = async () => {
    setBuscou(true);
    setCarregando(true);

    if (!sol || !espaco || !rega) {
      setResultados([]);
      setTotal(0);
      setCarregando(false);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = new URLSearchParams({ sol, espaco, rega });
      const resposta = await fetch(`${API_BASE}/api/plantas?${params.toString()}`, { headers });

      if (!resposta.ok) {
        if (resposta.status === 401) {
          console.error('Acesso negado: faça login para usar o Assistente.');
        }
        setResultados([]);
        setTotal(0);
        setCarregando(false);
        return;
      }

      const data = await resposta.json();
      setResultados(data.plantas);
      setTotal(data.total);
      recarregar();
    } catch {
      setResultados([]);
      setTotal(0);
    } finally {
      setCarregando(false);
    }
  };

  const carrosselRef = useRef(null);

  const scrollCarrossel = (direcao) => {
    if (carrosselRef.current) {
      const scrollAmount = 340; // largura do card + gap
      carrosselRef.current.scrollBy({
        left: direcao === 'direita' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleReset = () => {
    setSol(null);
    setEspaco(null);
    setRega(null);
    setResultados([]);
    setTotal(0);
    setBuscou(false);
  };

  const labelSol = sol || '—';
  const labelEspaco = espaco || '—';
  const labelRega = rega || '—';

  return (
    <main className="recomendacao-page">
      <div className="recomendacao-container">
        <header className="recomendacao-header">
          <span className="recomendacao-badge">🌱 Assistente Inteligente</span>
          <h1 className="recomendacao-title">
            Qual planta combina <span className="highlight-green">com você</span>?
          </h1>
          <p className="recomendacao-subtitle">
            Responda três perguntas rápidas e descubra espécies nativas do Cerrado
            ideais para o seu ambiente. Em poucos segundos você recebe recomendações
            personalizadas do nosso banco de 200 plantas!
          </p>
        </header>

        <form className="recomendacao-form" onSubmit={(e) => { e.preventDefault(); handleBuscar(); }}>
          <fieldset className="form-fieldset">
            <legend className="form-legend">
              <span className="legend-number">1</span>
              Qual a luminosidade do ambiente?
            </legend>
            <div className="opcoes-grid">
              {opcoesSol.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  className={`opcao-btn ${sol === opcao.valor ? 'opcao-btn--active' : ''}`}
                  onClick={() => setSol(opcao.valor)}
                  aria-pressed={sol === opcao.valor}
                >
                  <span className="opcao-icone">{opcao.icone}</span>
                  <span className="opcao-label">{opcao.label}</span>
                  <span className="opcao-desc">{opcao.descricao}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend className="form-legend">
              <span className="legend-number">2</span>
              Quanto espaço você tem disponível?
            </legend>
            <div className="opcoes-grid">
              {opcoesEspaco.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  className={`opcao-btn ${espaco === opcao.valor ? 'opcao-btn--active' : ''}`}
                  onClick={() => setEspaco(opcao.valor)}
                  aria-pressed={espaco === opcao.valor}
                >
                  <span className="opcao-icone">{opcao.icone}</span>
                  <span className="opcao-label">{opcao.label}</span>
                  <span className="opcao-desc">{opcao.descricao}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend className="form-legend">
              <span className="legend-number">3</span>
              Com que frequência você pode regar?
            </legend>
            <div className="opcoes-grid">
              {opcoesRega.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  className={`opcao-btn ${rega === opcao.valor ? 'opcao-btn--active' : ''}`}
                  onClick={() => setRega(opcao.valor)}
                  aria-pressed={rega === opcao.valor}
                >
                  <span className="opcao-icone">{opcao.icone}</span>
                  <span className="opcao-label">{opcao.label}</span>
                  <span className="opcao-desc">{opcao.descricao}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-buscar"
              disabled={!sol || !espaco || !rega}
            >
              {carregando ? '🔍 Buscando...' : '🌿 Buscar Recomendações'}
            </button>
            {(buscou || sol || espaco || rega) && (
              <button type="button" className="btn btn-reset" onClick={handleReset}>
                ↻ Recomeçar
              </button>
            )}
          </div>
        </form>

        {buscou && (
          <section className="resultados-section">
            <div className="resultados-divider" />

            {carregando ? (
              <div className="resultado-vazio">
                <span className="resultado-vazio-icone">⏳</span>
                <p className="resultado-vazio-texto">Buscando as melhores plantas do Cerrado para você...</p>
              </div>
            ) : !sol || !espaco || !rega ? (
              <div className="resultado-vazio">
                <span className="resultado-vazio-icone">👆</span>
                <p className="resultado-vazio-texto">
                  Selecione as três opções e clique em <strong>Buscar Recomendações</strong>.
                </p>
              </div>
            ) : resultados.length === 0 ? (
              <div className="resultado-vazio">
                <span className="resultado-vazio-icone">🔍</span>
                <h2 className="resultado-vazio-titulo">Nenhuma planta encontrada</h2>
                <p className="resultado-vazio-texto">
                  Não encontramos plantas para <strong>{labelSol}</strong> + <strong>{labelEspaco}</strong> + <strong>{labelRega}</strong>.
                </p>
                <button type="button" className="btn btn-secondary btn-tentar" onClick={handleReset}>
                  ↻ Tentar outra combinação
                </button>
              </div>
            ) : (
              <>
                <div className="resultados-header">
                  <h2 className="resultados-titulo">
                    🌱 {total} {total === 1 ? 'planta recomendada' : 'plantas recomendadas'} para você
                  </h2>
                  <p className="resultados-filtro">
                    Filtros: <strong>{labelSol}</strong> + <strong>{labelEspaco}</strong> + <strong>{labelRega}</strong>
                  </p>
                </div>

                {/* CARROSSEL HORIZONTAL */}
                <div className="carrossel-container">
                  <button
                    className="carrossel-btn carrossel-btn--esquerda"
                    onClick={() => scrollCarrossel('esquerda')}
                    aria-label="Rolar para esquerda"
                  >
                    ‹
                  </button>
                  <div className="carrossel-wrapper" ref={carrosselRef}>
                    {resultados.map((planta, index) => (
                      <PlantaCard key={`${planta.nomePopular}-${index}`} planta={planta} />
                    ))}
                  </div>
                  <button
                    className="carrossel-btn carrossel-btn--direita"
                    onClick={() => scrollCarrossel('direita')}
                    aria-label="Rolar para direita"
                  >
                    ›
                  </button>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default RecomendacaoInteligente;