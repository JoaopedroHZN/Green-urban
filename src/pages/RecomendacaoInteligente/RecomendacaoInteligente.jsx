import { useState, useEffect } from 'react';
import './RecomendacaoInteligente.css';

/**
 * =============================================================================
 *  🌿 Assistente de Recomendação Inteligente — Green Urban
 * =============================================================================
 *
 *  Funcionalidade:
 *    1. Exibe um formulário visual com três perguntas (luminosidade, espaço e rega).
 *    2. Ao clicar em "Buscar", consulta a API /api/plantas com os filtros selecionados.
 *    3. Renderiza cards com os resultados (nome, sinopse, condições ideais) e
 *       uma mensagem amigável caso nenhuma planta corresponda.
 *
 *  Acessibilidade:
 *    - Botões grandes com ícones e labels visíveis.
 *    - Atributos `aria-*` para leitores de tela.
 *    - Contraste adequado e foco visível.
 * =============================================================================
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const RecomendacaoInteligente = () => {
  /* ---- Estado do formulário ---- */
  const [sol, setSol] = useState(null);       // "Muito Sol" | "Sombra"
  const [espaco, setEspaco] = useState(null);  // "Pouco Espaço" | "Mais Espaço"
  const [rega, setRega] = useState(null);      // "Regamento Frequente" | "Baixo Regamento"
  const [resultados, setResultados] = useState([]);
  const [total, setTotal] = useState(0);
  const [buscou, setBuscou] = useState(false);
  const [carregando, setCarregando] = useState(false);

  /* ---- Opções para os botões ---- */
  const opcoesSol = [
    { valor: 'Muito Sol', label: 'Muito Sol',    icone: '☀️', descricao: 'Pleno sol / luz direta' },
    { valor: 'Sombra',    label: 'Sombra',        icone: '🌥️', descricao: 'Pouca luz / ambiente interno' },
  ];

  const opcoesEspaco = [
    { valor: 'Pouco Espaço', label: 'Pouco Espaço',  icone: '🏠', descricao: 'Vasos / Apartamento' },
    { valor: 'Mais Espaço',  label: 'Mais Espaço',   icone: '🌳', descricao: 'Quintal / Calçada' },
  ];

  const opcoesRega = [
    { valor: 'Regamento Frequente', label: 'Rega Frequente', icone: '💧', descricao: 'Solo sempre úmido' },
    { valor: 'Baixo Regamento',     label: 'Pouca Rega',     icone: '🌵', descricao: 'Solo seco / esporádico' },
  ];

  /* ---- Lógica de filtragem via API ---- */
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
          console.error('Acesso negado: faça login para usar o Assistente de Recomendação.');
          setResultados([]);
          setTotal(0);
          return;
        }
        throw new Error('Erro ao buscar plantas');
      }

      const data = await resposta.json();
      setResultados(data.plantas);
      setTotal(data.total);
    } catch (erro) {
      console.error('Erro ao buscar plantas:', erro);
      setResultados([]);
      setTotal(0);
    } finally {
      setCarregando(false);
    }
  };

  /* ---- Reset ---- */
  const handleReset = () => {
    setSol(null);
    setEspaco(null);
    setRega(null);
    setResultados([]);
    setTotal(0);
    setBuscou(false);
  };

  /* ---- Helper para label do filtro ---- */
  const labelSol = sol || '—';
  const labelEspaco = espaco || '—';
  const labelRega = rega || '—';

  /* ---- Helper para ícone dos ícones de condição nos cards ---- */
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

  return (
    <main className="recomendacao-page">
      <div className="recomendacao-container">
        {/* ===== Cabeçalho ===== */}
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

        {/* ===== Formulário ===== */}
        <form
          className="recomendacao-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleBuscar();
          }}
          aria-label="Formulário de recomendação de plantas"
        >
          {/* --- Pergunta 1: Luminosidade --- */}
          <fieldset className="form-fieldset">
            <legend className="form-legend">
              <span className="legend-number">1</span>
              Qual a luminosidade do ambiente?
            </legend>
            <div className="opcoes-grid" role="radiogroup" aria-label="Opções de luminosidade">
              {opcoesSol.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  className={`opcao-btn ${sol === opcao.valor ? 'opcao-btn--active' : ''}`}
                  onClick={() => setSol(opcao.valor)}
                  aria-pressed={sol === opcao.valor}
                  aria-label={`${opcao.label} — ${opcao.descricao}`}
                >
                  <span className="opcao-icone" aria-hidden="true">{opcao.icone}</span>
                  <span className="opcao-label">{opcao.label}</span>
                  <span className="opcao-desc">{opcao.descricao}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* --- Pergunta 2: Espaço --- */}
          <fieldset className="form-fieldset">
            <legend className="form-legend">
              <span className="legend-number">2</span>
              Quanto espaço você tem disponível?
            </legend>
            <div className="opcoes-grid" role="radiogroup" aria-label="Opções de espaço">
              {opcoesEspaco.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  className={`opcao-btn ${espaco === opcao.valor ? 'opcao-btn--active' : ''}`}
                  onClick={() => setEspaco(opcao.valor)}
                  aria-pressed={espaco === opcao.valor}
                  aria-label={`${opcao.label} — ${opcao.descricao}`}
                >
                  <span className="opcao-icone" aria-hidden="true">{opcao.icone}</span>
                  <span className="opcao-label">{opcao.label}</span>
                  <span className="opcao-desc">{opcao.descricao}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* --- Pergunta 3: Rega --- */}
          <fieldset className="form-fieldset">
            <legend className="form-legend">
              <span className="legend-number">3</span>
              Com que frequência você pode regar?
            </legend>
            <div className="opcoes-grid" role="radiogroup" aria-label="Opções de rega">
              {opcoesRega.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  className={`opcao-btn ${rega === opcao.valor ? 'opcao-btn--active' : ''}`}
                  onClick={() => setRega(opcao.valor)}
                  aria-pressed={rega === opcao.valor}
                  aria-label={`${opcao.label} — ${opcao.descricao}`}
                >
                  <span className="opcao-icone" aria-hidden="true">{opcao.icone}</span>
                  <span className="opcao-label">{opcao.label}</span>
                  <span className="opcao-desc">{opcao.descricao}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* --- Ações --- */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-buscar"
              disabled={!sol || !espaco || !rega}
              aria-label="Buscar plantas recomendadas"
            >
              {carregando ? '🔍 Buscando...' : '🌿 Buscar Recomendações'}
            </button>
            {(buscou || sol || espaco || rega) && (
              <button
                type="button"
                className="btn btn-reset"
                onClick={handleReset}
                aria-label="Limpar seleções e recomeçar"
              >
                ↻ Recomeçar
              </button>
            )}
          </div>
        </form>

        {/* ===== Seção de Resultados ===== */}
        {buscou && (
          <section className="resultados-section" aria-live="polite">
            <div className="resultados-divider" />

            {carregando ? (
              <div className="resultado-vazio">
                <span className="resultado-vazio-icone" aria-hidden="true">⏳</span>
                <p className="resultado-vazio-texto">
                  Buscando as melhores plantas do Cerrado para você...
                </p>
              </div>
            ) : !sol || !espaco || !rega ? (
              /* --- Faltou selecionar alguma opção --- */
              <div className="resultado-vazio">
                <span className="resultado-vazio-icone" aria-hidden="true">👆</span>
                <p className="resultado-vazio-texto">
                  Selecione as três opções acima e clique em{' '}
                  <strong>Buscar Recomendações</strong> para ver as plantas
                  ideais para você!
                </p>
              </div>
            ) : resultados.length === 0 ? (
              /* --- Nenhuma correspondência --- */
              <div className="resultado-vazio">
                <span className="resultado-vazio-icone" aria-hidden="true">🔍</span>
                <h2 className="resultado-vazio-titulo">
                  Nenhuma planta encontrada
                </h2>
                <p className="resultado-vazio-texto">
                  Não encontramos plantas que correspondam exatamente a{' '}
                  <strong>{labelSol}</strong> +{' '}
                  <strong>{labelEspaco}</strong> +{' '}
                  <strong>{labelRega}</strong>.
                </p>
                <p className="resultado-vazio-texto">
                  Que tal tentar outra combinação ou explorar o{' '}
                  <a href="/dicionario" className="link-dicionario">
                    Dicionário Verde 🌿
                  </a>{' '}
                  completo?
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-tentar"
                  onClick={handleReset}
                >
                  ↻ Tentar outra combinação
                </button>
              </div>
            ) : (
              /* --- Plantas compatíveis --- */
              <>
                <div className="resultados-header">
                  <h2 className="resultados-titulo">
                    🌱 {total}{' '}
                    {total === 1
                      ? 'planta recomendada'
                      : 'plantas recomendadas'}{' '}
                    para você
                  </h2>
                  <p className="resultados-filtro">
                    Filtros: <strong>{labelSol}</strong> +{' '}
                    <strong>{labelEspaco}</strong> +{' '}
                    <strong>{labelRega}</strong>
                  </p>
                </div>

                <div className="resultados-grid">
                  {resultados.map((planta, index) => (
                    <article key={index} className="planta-card">
                      {planta.imagem && (
                        <div className="planta-card-imagem">
                          <img
                            src={planta.imagem}
                            alt={planta.nomePopular}
                            className="planta-imagem"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="planta-card-header">
                        <span className="planta-tipo-badge">{planta.tipo}</span>
                      </div>
                      <h3 className="planta-nome">{planta.nomePopular}</h3>
                      <p className="planta-cientifico">
                        <em>{planta.nomeCientifico}</em>
                      </p>
                      <p className="planta-sinopse">
                        {planta.sinopse}
                      </p>
                      <div className="planta-condicoes">
                        <span className="condicao-tag">
                          {iconeCondicao('sol', planta.condicoesIdeais.sol)}{' '}
                          {planta.condicoesIdeais.sol}
                        </span>
                        <span className="condicao-tag">
                          {iconeCondicao('espaco', planta.condicoesIdeais.espaco)}{' '}
                          {planta.condicoesIdeais.espaco}
                        </span>
                        <span className="condicao-tag">
                          {iconeCondicao('rega', planta.condicoesIdeais.rega)}{' '}
                          {planta.condicoesIdeais.rega}
                        </span>
                      </div>
                      <p className="planta-dica">
                        <strong>💡 Dica:</strong> {planta.dicasCuidado}
                      </p>
                    </article>
                  ))}
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