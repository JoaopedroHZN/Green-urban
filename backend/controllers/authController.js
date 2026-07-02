// ============================================================
//  Controller de Autenticação — Green Urban
//  POST /api/auth/registrar  —  Cadastro de novo usuário
//  POST /api/auth/login      —  Login do usuário
// ============================================================

const Usuario = require('../models/Usuario');

// ------------------------------------------------------------
//  registrar — POST /api/auth/registrar
// ------------------------------------------------------------
const registrar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const usuarioExistente = await Usuario.findOne({ email: email.toLowerCase().trim() });
    if (usuarioExistente) {
      return res.status(409).json({ erro: 'Este email já está cadastrado.' });
    }

    const novoUsuario = await Usuario.create({
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha: senha,
    });

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

    if (erro.code === 11000) {
      return res.status(409).json({ erro: 'Este email já está cadastrado.' });
    }

    if (erro.name === 'ValidationError') {
      const mensagens = Object.values(erro.errors).map((e) => e.message);
      return res.status(400).json({ erro: mensagens.join('. ') });
    }

    res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' });
  }
};

// ------------------------------------------------------------
//  login — POST /api/auth/login
// ------------------------------------------------------------
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });
    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

    if (usuario.senha !== senha) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

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
};

module.exports = { registrar, login };