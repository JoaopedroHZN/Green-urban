// ============================================================
//  Controller de Plantas — Green Urban
//  Endpoints para Dicionário Verde e Assistente de Recomendação
// ============================================================

const plantasBase = require('../plantasBase.json');
const { verificarEAtualizarConquistas } = require('../services/conquistas');

// ------------------------------------------------------------
//  listar — GET /api/plantas (protegida — requer token JWT)
// ------------------------------------------------------------
const listar = async (req, res) => {
  const { sol, espaco, rega } = req.query;

  let resultado = plantasBase;

  if (sol) {
    resultado = resultado.filter((p) => p.condicoesIdeais.sol === sol);
  }
  if (espaco) {
    resultado = resultado.filter((p) => p.condicoesIdeais.espaco === espaco);
  }
  if (rega) {
    resultado = resultado.filter((p) => p.condicoesIdeais.rega === rega);
  }

  let conquistasConcedidas = [];
  const usuarioId = req.usuario?.id || req.usuario?._id;
  if (usuarioId && sol && espaco && rega) {
    console.log('🎯 [DEBUG] GET /api/plantas — conquista usuario ' + usuarioId);
    const rc = await verificarEAtualizarConquistas(usuarioId, 'assistente');
    conquistasConcedidas = rc.conquistasConcedidas;
    console.log('✅ [DEBUG] OK — conquistas=' + conquistasConcedidas.length);
  }

  res.json({
    conquistasConcedidas,
    total: resultado.length,
    plantas: resultado,
  });
};

// ------------------------------------------------------------
//  recomendacao — GET /api/plantas/recomendacao (protegida)
// ------------------------------------------------------------
const recomendacao = async (req, res) => {
  const { sol, espaco } = req.query;

  const solMap = {
    sol: ['Muito Sol', 'Sol Direto', 'Sol Pleno', 'Luz Média'],
    sombra: ['Sombra', 'Meia Sombra', 'Pouca Luz', 'Luz Indireta'],
  };

  const espacoMap = {
    pouco: ['Pequeno (vaso suspenso)', 'Médio (vaso de chão)'],
    muito: ['Grande (ambiente amplo)', 'Médio (vaso de chão)'],
  };

  let resultado = plantasBase;

  if (sol && solMap[sol]) {
    resultado = resultado.filter((p) => solMap[sol].includes(p.condicoesIdeais.sol));
  }

  if (espaco && espacoMap[espaco]) {
    resultado = resultado.filter((p) => espacoMap[espaco].includes(p.condicoesIdeais.espaco));
  }

  let conquistasConcedidas = [];
  const usuarioId = req.usuario?.id || req.usuario?._id;
  if (usuarioId) {
    console.log(`🎯 [DEBUG] GET /api/plantas/recomendacao — gatilho conquista para usuario ${usuarioId}`);
    const resultadoC = await verificarEAtualizarConquistas(usuarioId, 'assistente');
    conquistasConcedidas = resultadoC.conquistasConcedidas;
    console.log(`✅ [DEBUG] verificarEAtualizarConquistas OK — conquistas=${conquistasConcedidas.length}`);
  }

  res.json({
    sucesso: true,
    total: resultado.length,
    conquistasConcedidas: conquistasConcedidas || [],
    plantas: resultado,
  });
};

module.exports = { listar, recomendacao };