// ============================================================
//  Rotas de Usuários — Green Urban
// ============================================================

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Usuario = require('../models/Usuario');
const Postagem = require('../models/Postagem');
const Evento = require('../models/Evento');

const router = express.Router();


// ------------------------------------------------------------
//  Configuracao do Multer (upload de foto de perfil)
// ------------------------------------------------------------
const uploadDir = path.join(__dirname, '..', 'uploads', 'perfil');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nome = 'perfil-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, nome);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const permitidos = /jpeg|jpg|png|gif|webp/;
    const extOk = permitidos.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = permitidos.test(file.mimetype.split('/')[1]);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error('Apenas imagens (JPG, PNG, GIF, WEBP) sao permitidas.'));
  },
});
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

    // Conta postagens e eventos do usuario para estatisticas
    const [totalPostagens, totalEventos] = await Promise.all([
      Postagem.countDocuments({ autorId: req.params.id }),
      Evento.countDocuments({ criadoPor: req.params.id }),
    ]);

    res.json({
      sucesso: true,
      usuario,
      estatisticas: {
        postagens: totalPostagens,
        eventos: totalEventos,
      },
    });
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


// ------------------------------------------------------------
//  PUT /perfil/foto
//  Faz upload da foto de perfil via multer e salva no usuario
// ------------------------------------------------------------
router.put('/perfil/foto', upload.single('fotoPerfil'), async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ erro: 'userId e obrigatorio.' });
    }

    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }

    const fotoPerfil = '/uploads/perfil/' + req.file.filename;

    const usuario = await Usuario.findByIdAndUpdate(
      userId,
      { fotoPerfil },
      { new: true, select: '-senha -__v' }
    );

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    }

    res.json({ sucesso: true, fotoPerfil: usuario.fotoPerfil, usuario });
  } catch (erro) {
    console.error('Erro ao fazer upload:', erro.message);
    res.status(500).json({ erro: 'Erro interno ao fazer upload.' });
  }
});
module.exports = router;