// ============================================================
//  Middleware de Autenticação — Green Urban
//  Protege rotas que exigem token (formato simplificado)
// ============================================================

const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');

/**
 * Middleware que verifica se o token de autenticação é válido.
 * Espera o header: Authorization: Bearer <TOKEN>
 * Token no formato: token-simples-<MONGO_ID>
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido. Faça login para acessar.' });
  }

  const partes = authHeader.split(' ');

  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ erro: 'Formato do token inválido. Use: Bearer <TOKEN>' });
  }

  const token = partes[1];

  // Valida o formato do token: token-simples-<MONGO_ID>
  if (!token.startsWith('token-simples-')) {
    return res.status(401).json({ erro: 'Token inválido. Faça login novamente.' });
  }

  const id = token.replace('token-simples-', '');

  // Verifica se o ID é um ObjectId válido do MongoDB
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(401).json({ erro: 'Token inválido. Faça login novamente.' });
  }

  try {
    // Busca o usuário no banco para confirmar que existe
    const usuario = await Usuario.findById(id).select('-senha');
    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado. Faça login novamente.' });
    }

    // Injeta os dados do usuário na requisição para uso nas rotas
    // Garante que id seja sempre uma string pura para evitar problemas de comparação com ObjectId
    req.usuario = { id: usuario._id.toString(), nome: usuario.nome, email: usuario.email };
    next();
  } catch (erro) {
    console.error('Erro no authMiddleware:', erro);
    return res.status(500).json({ erro: 'Erro interno ao validar autenticação.' });
  }
};

module.exports = authMiddleware;
