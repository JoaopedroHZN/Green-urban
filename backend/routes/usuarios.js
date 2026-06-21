// ============================================================
//  Rotas de Usuários — Green Urban
// ============================================================

const express = require('express');
const Usuario = require('../models/Usuario');

const router = express.Router();

// ------------------------------------------------------------
//  POST /cadastrar
//  Cria um novo usuário no banco de dados
// ------------------------------------------------------------

router.post('/cadastrar', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // --- Validação básica dos campos ---
    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: 'Todos os campos são obrigatórios: nome, email e senha.',
      });
    }

    // --- Verificar se o email já está cadastrado ---
    const usuarioExistente = await Usuario.findOne({ email: email.toLowerCase() });

    if (usuarioExistente) {
      return res.status(409).json({
        erro: 'Este email já está cadastrado. Tente fazer login.',
      });
    }

    // --- Criar o novo usuário ---
    const novoUsuario = await Usuario.create({
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha, // Em produção, a senha deve ser hashada com bcrypt
      pontuacaoTotal: 0,
      listaConquistas: [],
    });

    // --- Resposta de sucesso (sem expor a senha) ---
    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        pontuacaoTotal: novoUsuario.pontuacaoTotal,
        listaConquistas: novoUsuario.listaConquistas,
        criadoEm: novoUsuario.createdAt,
      },
    });
  } catch (erro) {
    // --- Tratar erro de validação do Mongoose ---
    if (erro.name === 'ValidationError') {
      const mensagens = Object.values(erro.errors).map((e) => e.message);
      return res.status(400).json({ erro: 'Dados inválidos.', detalhes: mensagens });
    }

    // --- Erro genérico do servidor ---
    console.error('Erro ao cadastrar usuário:', erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// ------------------------------------------------------------
//  GET /perfil/:id
//  Retorna perfil completo do usuário (nome, pontuação, conquistas)
// ------------------------------------------------------------
router.get('/perfil/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id, '-senha -__v').lean();

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json({ sucesso: true, usuario });
  } catch (erro) {
    console.error('❌ Erro ao buscar perfil:', erro.message);

    if (erro.name === 'CastError') {
      return res.status(400).json({ erro: 'ID de usuário inválido.' });
    }

    res.status(500).json({ erro: 'Erro interno ao buscar perfil.' });
  }
});

// ------------------------------------------------------------
//  GET /listar (rota auxiliar para testes)
//  Retorna todos os usuários cadastrados
// ------------------------------------------------------------

router.get('/listar', async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, '-senha -__v').sort({ criadoEm: -1 });
    return res.json(usuarios);
  } catch (erro) {
    console.error('Erro ao listar usuários:', erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

module.exports = router;