// ============================================================
//  Serviço de Conquistas — Green Urban
//  Regras de negócio para desbloqueio automático de medalhas
// ============================================================

const Usuario = require('../models/Usuario');

// ------------------------------------------------------------
//  Catálogo de Conquistas
//  Cada conquista tem:
//    - id: chave única (string) usada no array listaConquistas
//    - icone, titulo, descricao: exibição no frontend
// ------------------------------------------------------------
const CATALOGO = [
  {
    id: 'primeiro_broto',
    icone: '🌱',
    titulo: 'Primeiro Broto',
    descricao: 'Faça sua primeira postagem na Rede Social Verde',
  },
  {
    id: 'protetor_cerrado',
    icone: '🌾',
    titulo: 'Protetor do Cerrado',
    descricao: 'Participe do seu 1º evento de plantio',
  },
  {
    id: 'especialista_biomas',
    icone: '📚',
    titulo: 'Especialista em Biomas',
    descricao: 'Use o Assistente de Recomendação Inteligente',
  },
  {
    id: 'guardiao_veterano',
    icone: '🛡️',
    titulo: 'Guardião Veterano',
    descricao: 'Alcance o Nível 5 (500+ XP)',
  },
];

// Mapa para acesso rápido pelo id
const CONQUISTAS_POR_ID = Object.fromEntries(
  CATALOGO.map((c) => [c.id, c])
);

// ------------------------------------------------------------
//  getCatalogo()
//  Retorna o catálogo completo (para o frontend montar a UI)
// ------------------------------------------------------------
function getCatalogo() {
  return CATALOGO;
}

// ------------------------------------------------------------
//  verificarEConceder(usuarioId, conquistaId)
//  - Busca o usuário no banco
//  - Verifica se a conquista já existe no array listaConquistas
//  - Se não existir, adiciona e persiste com .save()
//  - Retorna { concedida, conquista } indicando se foi novidade
// ------------------------------------------------------------
async function verificarEConceder(usuarioId, conquistaId) {
  // Valida se a conquista existe no catálogo
  const conquista = CONQUISTAS_POR_ID[conquistaId];
  if (!conquista) {
    console.warn(`⚠️ Conquista desconhecida: "${conquistaId}"`);
    return { concedida: false, conquista: null };
  }

  // Busca o usuário (precisa do documento real para usar .save())
  const usuario = await Usuario.findById(usuarioId);
  if (!usuario) {
    console.warn(`⚠️ Usuário ${usuarioId} não encontrado para conquista "${conquistaId}"`);
    return { concedida: false, conquista: null };
  }

  // Garante que listaConquistas é um array
  if (!Array.isArray(usuario.listaConquistas)) {
    usuario.listaConquistas = [];
  }

  // Verifica se já possui (compara strings diretamente)
  const jaPossui = usuario.listaConquistas.includes(conquista.id);
  if (jaPossui) {
    return { concedida: false, conquista: null, jaPossui: true };
  }

  // Concede a conquista
  usuario.listaConquistas.push(conquista.id);
  await usuario.save(); // ⬅️ PERSISTE no MongoDB

  console.log(`🏅 Conquista "${conquista.titulo}" concedida ao usuário ${usuarioId}`);
  return { concedida: true, conquista };
}

// ------------------------------------------------------------
//  verificarConquistasPorXP(usuarioId, xpAtual)
//  Verifica conquistas baseadas em XP (ex: Guardião Veterano)
//  Chame após qualquer incremento de XP.
// ------------------------------------------------------------
async function verificarConquistasPorXP(usuarioId, xpAtual) {
  const concedidas = [];

  // Guardião Veterano: 500+ XP (Nível 5)
  if (xpAtual >= 500) {
    const resultado = await verificarEConceder(usuarioId, 'guardiao_veterano');
    if (resultado.concedida) concedidas.push(resultado.conquista);
  }

  return concedidas;
}

// ------------------------------------------------------------
//  verificarEAtualizarConquistas(usuarioId, motivo, opts = {})
//  Função CENTRALIZADA chamada por todos os controllers.
//
//  Parâmetros:
//    - usuarioId: ID do usuário
//    - motivo: 'postagem' | 'inscricao_evento' | 'aprovacao_evento' | 'assistente'
//    - opts.xpGanho: XP a conceder (opcional, 0 se não informado)
//
//  Retorna: { xpGanho, xpTotal, conquistasConcedidas }
// ------------------------------------------------------------
async function verificarEAtualizarConquistas(usuarioId, motivo, opts = {}) {
  const xpGanho = opts.xpGanho || 0;
  const conquistasConcedidas = [];

  // 1. Concede XP se houver ganho
  let xpTotal = 0;
  if (xpGanho > 0) {
    const usuarioAtualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      { $inc: { xp: xpGanho } },
      { new: true, select: 'xp' }
    );
    xpTotal = usuarioAtualizado ? usuarioAtualizado.xp : 0;
    console.log(`⭐ +${xpGanho} XP concedido ao usuário ${usuarioId} (motivo: ${motivo}) — Total: ${xpTotal} XP`);
  } else {
    // Busca XP atual mesmo sem ganho
    const usuario = await Usuario.findById(usuarioId, 'xp');
    xpTotal = usuario ? usuario.xp : 0;
  }

  // 2. Verifica conquistas conforme o motivo
  switch (motivo) {
    case 'postagem': {
      const resultado = await verificarEConceder(usuarioId, 'primeiro_broto');
      if (resultado.concedida) conquistasConcedidas.push(resultado.conquista);
      break;
    }
    case 'inscricao_evento':
    case 'aprovacao_evento': {
      const resultado = await verificarEConceder(usuarioId, 'protetor_cerrado');
      if (resultado.concedida) conquistasConcedidas.push(resultado.conquista);
      break;
    }
    case 'assistente': {
      const resultado = await verificarEConceder(usuarioId, 'especialista_biomas');
      if (resultado.concedida) conquistasConcedidas.push(resultado.conquista);
      break;
    }
    default:
      console.warn(`⚠️ Motivo de conquista desconhecido: "${motivo}"`);
  }

  // 3. Verifica conquistas baseadas em XP (sempre)
  const xpConquistas = await verificarConquistasPorXP(usuarioId, xpTotal);
  conquistasConcedidas.push(...xpConquistas);

  if (conquistasConcedidas.length > 0) {
    console.log(`🏅 ${conquistasConcedidas.length} conquista(s) concedida(s) ao usuário ${usuarioId}:`, conquistasConcedidas.map(c => c.titulo));
  }

  return { xpGanho, xpTotal, conquistasConcedidas };
}

module.exports = {
  getCatalogo,
  verificarEConceder,
  verificarConquistasPorXP,
  verificarEAtualizarConquistas,
  CATALOGO,
  CONQUISTAS_POR_ID,
};
