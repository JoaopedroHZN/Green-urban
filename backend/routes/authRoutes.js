// ============================================================
//  Rotas de Autenticação — Green Urban
//  POST /api/auth/registrar  —  Cadastro de novo usuário
//  POST /api/auth/login      —  Login do usuário
//  (Autenticação simplificada — senha em texto plano)
// ============================================================

const express = require('express');
const Usuario = require('../models/Usuario');

const router = express.Router();

// ------------------------------------------------------------
//  POST /api/auth/registrar
//  Body: { nome, email, senha }
// ------------------------------------------------------------
router.post('/registrar', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Validações básicas
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    // Verifica se o email já está cadastrado
    const usuarioExistente = await Usuario.findOne({ email: email.toLowerCase().trim() });
    if (usuarioExistente) {
      return res.status(409).json({ erro: 'Este email já está cadastrado.' });
    }

    // Salva a senha exatamente como o usuário digitou (texto plano)
    const novoUsuario = await Usuario.create({
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha: senha,
    });

    // Token simples baseado no ID do usuário
    const token = 'token-simples-' + novoUsuario._id;

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      token,
      usuario: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
      },
    });
  } catch (erro) {
    console.error('Erro ao registrar usuário:', erro);

    // Trata erro de validação do Mongoose (ex: email duplicado por índice unique)
    if (erro.code === 11000) {
      return res.status(409).json({ erro: 'Este email já está cadastrado.' });
    }

    // Erro de validação do schema
    if (erro.name === 'ValidationError') {
      const mensagens = Object.values(erro.errors).map((e) => e.message);
      return res.status(400).json({ erro: mensagens.join('. ') });
    }

    res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' });
  }
});

// ------------------------------------------------------------
//  POST /api/auth/login
//  Body: { email, senha }
// ------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    // Busca o usuário pelo email
    const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });
    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

    // Comparação direta da senha (texto plano)
    if (usuario.senha !== senha) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

    // Token simples baseado no ID do usuário
    const token = 'token-simples-' + usuario._id;

    res.json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (erro) {
    console.error('Erro ao fazer login:', erro);
    res.status(500).json({ erro: 'Erro interno ao realizar login.' });
  }
});

module.exports = router;
