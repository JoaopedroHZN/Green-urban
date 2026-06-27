import { useState } from 'react';
import plantas from '../data/plantas';
import './RecomendacaoInteligente.css';

/**
 * =============================================================================
 *  🌿 Assistente de Recomendação Inteligente — Green Urban
 * =============================================================================
 *
 *  Funcionalidade:
 *    1. Exibe um formulário visual com duas perguntas (luminosidade e espaço).
 *    2. Ao clicar em "Buscar", filtra o array de plantas comparando as
 *       escolhas do usuário com o atributo `condicoesIdeais` de cada planta.
 *    3. Renderiza cards com os resultados ou uma mensagem amigável caso
 *       nenhuma planta corresponda exatamente.
 *
 *  Acessibilidade:
 *    - Botões grandes com ícones e labels visíveis.
 *    - Atributos `aria-*` para leitores de tela.
 *    - Contraste adequado e foco visível.
 * =============================================================================
 */

const RecomendacaoInteligente = () => {
  /* ---- Estado do formulário ---- */
  const [sol, setSol] = useState(null);       // "sol" | "sombra"
  const [espaco, setEspaco] = useState(null);  // "pouco" | "muito"
  const [resultados, setResultados] = useState(null); // null | [] | [...plantas]
  const [buscou, setBuscou] = useState(false);

  /* ---- Opções para os botões ---- */
  const opcoesSol = [
    { valor: 'sol',    label: 'Muito Sol',    icone: '☀️', descricao: 'Pleno sol / luz direta' },
    { valor: 'sombra', label: 'Sombra',        icone: '🌥️', descricao: 'Pouca luz / ambiente interno' },
  ];

  const opcoesEspaco = [
    { valor: 'pouco',  label: 'Pouco Espaço',  icone: '🏠', descricao: 'Vasos / Apartamento' },
    { valor: 'muito',  label: 'Muito Espaço',  icone: '🌳', descricao: 'Quintal / Calçada' },
  ];

  /* ---- Lógica de filtragem (verificarCompatibilidade) ---- */
  const handleBuscar = () => {
    setBuscou(true);

    if (!sol || !espaco) {
      setResultados([]);
      return;
    }

    const compatíveis = plantas.filter(
      (planta) =>
        planta.condicoesIdeais.sol === sol &&
        planta.condicoesIdeais.espaco === espaco
    );

    setResultados(compatíveis);
  };

  /* ---- Reset ---- */
  const handleReset = () => {
    setSol(null);
    setEspaco(null);
    setResultados(null);
    setBuscou(false);
  };

  /* ---- Helper para label do filtro ---- */
  const labelSol = sol === 'sol' ? 'Muito Sol (Pleno)' : 'Sombra / Pouca Luz';
  const labelEspaco = espaco === 'pouco' ? 'Pouco Espaço (Vasos)' : 'Muito Espaço (Quintal)';

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
            Responda duas perguntas rápidas e descubra espécies ideais para o
            seu ambiente. Em poucos segundos você recebe recomendações
            personalizadas!
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

          {/* --- Ações --- */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-buscar"
              disabled={!sol || !espaco}
              aria-label="Buscar plantas recomendadas"
            >
              🌿 Buscar Recomendações
            </button>
            {(buscou || sol || espaco) && (
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

            {/* --- Nenhuma opção selecionada --- */}
            {!sol || !espaco ? (
              <div className="resultado-vazio">
                <span className="resultado-vazio-icone" aria-hidden="true">👆</span>
                <p className="resultado-vazio-texto">
                  Selecione as duas opções acima e clique em{' '}
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
                  <strong>{labelEspaco}</strong>.
                </p>
                <p className="resultado-vazio-texto">
                  Que tal tentar outra combinação ou explorar o{' '}
                  <a href="#dicionario" className="link-dicionario">
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
                    {resultados.length}{' '}
                    {resultados.length === 1
                      ? 'planta recomendada'
                      : 'plantas recomendadas'}{' '}
                    para você
                  </h2>
                  <p className="resultados-filtro">
                    Filtros: <strong>{labelSol}</strong> +{' '}
                    <strong>{labelEspaco}</strong>
                  </p>
                </div>

                <div className="resultados-grid">
                  {resultados.map((planta) => (
                    <article key={planta.id} className="planta-card">
                      <div className="planta-card-header">
                        <span className="planta-tipo-badge">{planta.tipo}</span>
                      </div>
                      <h3 className="planta-nome">{planta.nomePopular}</h3>
                      <p className="planta-cientifico">
                        <em>{planta.nomeCientifico}</em>
                      </p>
                      <div className="planta-condicoes">
                        <span className="condicao-tag">
                          {planta.condicoesIdeais.sol === 'sol' ? '☀️ Sol' : '🌥️ Sombra'}
                        </span>
                        <span className="condicao-tag">
                          {planta.condicoesIdeais.espaco === 'pouco'
                            ? '🏠 Pouco espaço'
                            : '🌳 Muito espaço'}
                        </span>
                        <span className="condicao-tag">
                          💧 {planta.condicoesIdeais.agua === 'baixa'
                            ? 'Pouca água'
                            : planta.condicoesIdeais.agua === 'media'
                            ? 'Água moderada'
                            : 'Muita água'}
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
