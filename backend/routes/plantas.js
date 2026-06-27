// ============================================================
//  Rotas de Plantas — Green Urban
//  Endpoints para Dicionário Verde e Assistente de Recomendação
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const plantasBase = require('../plantasBase.json');
const { verificarEAtualizarConquistas } = require('../services/conquistas');

// ------------------------------------------------------------
//  GET /api/plantas (Protegida — requer token JWT)
//  Retorna todas as plantas do Cerrado.
//  Query params opcionais: sol, espaco, rega
//  Usado pelo: Dicionário Verde
// ------------------------------------------------------------
router.get('/', authMiddleware, async (req, res) => {
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

  // --- Gamificacao: Conquista por usar o Assistente ---
  let conquistasConcedidas = [];
  const usuarioId = req.usuario?.id || req.usuario?._id;
  // So dispara conquista se o Assistente foi realmente usado (params presentes)
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
});

// ------------------------------------------------------------
//  GET /api/plantas/recomendacao (Protegida — requer token JWT)
//  Busca plantas por sol e espaço (para o Assistente Inteligente).
//  Query params: sol, espaco
//  Mapeia valores simplificados do frontend para buscas no dataset.
// ------------------------------------------------------------
router.get('/recomendacao', authMiddleware, async (req, res) => {
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


  // --- Gamificação: Conquista por usar o Assistente ---
  let conquistasConcedidas = [];
  const usuarioId = req.usuario?.id || req.usuario?._id;
  if (usuarioId) {
    console.log(`🎯 [DEBUG] GET /api/plantas/recomendacao — gatilho conquista para usuario ${usuarioId}`);
    const resultado = await verificarEAtualizarConquistas(usuarioId, 'assistente');
    conquistasConcedidas = resultado.conquistasConcedidas;
    console.log(`✅ [DEBUG] verificarEAtualizarConquistas OK — conquistas=${conquistasConcedidas.length}`);
  }

  res.json({
    sucesso: true,
    total: resultado.length,
    conquistasConcedidas: conquistasConcedidas || [],
    plantas: resultado,
  });
});

module.exports = router;