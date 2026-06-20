// ============================================================
//  Rotas de Postagens — Green Urban (Rede Social)
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const Postagem = require('../models/Postagem');

const router = express.Router();

// ------------------------------------------------------------
//  GET /api/postagens
//  Retorna todas as postagens, com populate do autor.
//  Inclui flag "curtidoPorMim" se userId for passado via query.
// ------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    const postagens = await Postagem.find()
      .populate('autorId', 'nome')
      .sort({ createdAt: -1 })
      .lean();

    const posts = postagens.map((p) => {
      const curtidasCount = Array.isArray(p.curtidas) ? p.curtidas.length : 0;
      let curtido = false;

      if (userId && Array.isArray(p.curtidas)) {
        curtido = p.curtidas.some(
          (id) => id.toString() === userId
        );
      }

      return {
        _id: p._id,
        autor: p.autorId?.nome || 'Usuário anônimo',
        legenda: p.legenda,
        imagemUrl: p.imagemUrl,
        curtidas: curtidasCount,
        curtido,
        comentarios: p.comentarios,
        criadoEm: p.createdAt,
      };
    });

    res.json({ sucesso: true, total: posts.length, posts });
  } catch (erro) {
    console.error('❌ Erro ao listar postagens:', erro.message);
    res.status(500).json({ sucesso: false, erro: 'Erro interno ao buscar postagens.' });
  }
});

// ------------------------------------------------------------
//  POST /api/postagens
//  Body: { autorId, legenda, imagemUrl (opcional) }
// ------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { autorId, legenda, imagemUrl } = req.body;

    if (!autorId || !legenda) {
      return res.status(400).json({ erro: 'autorId e legenda são obrigatórios.' });
    }

    const novaPostagem = await Postagem.create({
      autorId,
      legenda: legenda.trim(),
      imagemUrl: imagemUrl || '',
    });

    const populada = await Postagem.findById(novaPostagem._id)
      .populate('autorId', 'nome')
      .lean();

    res.status(201).json({
      sucesso: true,
      post: {
        _id: populada._id,
        autor: populada.autorId?.nome || 'Usuário anônimo',
        legenda: populada.legenda,
        imagemUrl: populada.imagemUrl,
        curtidas: 0,
        curtido: false,
        comentarios: populada.comentarios,
        criadoEm: populada.createdAt,
      },
    });
  } catch (erro) {
    console.error('❌ Erro ao criar postagem:', erro.message);
    if (erro.name === 'ValidationError') {
      const mensagens = Object.values(erro.errors).map((e) => e.message);
      return res.status(400).json({ erro: mensagens.join('. ') });
    }
    res.status(500).json({ erro: 'Erro interno ao criar postagem.' });
  }
});

// ------------------------------------------------------------
//  PATCH /api/postagens/:id/curtir
//  Body: { userId }
//  Lógica Toggle: adiciona userId ao array se não estiver;
//  remove se já estiver (descurtir).
// ------------------------------------------------------------
router.patch('/:id/curtir', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ erro: 'userId válido é obrigatório.' });
    }

    const postagem = await Postagem.findById(req.params.id);
    if (!postagem) {
      return res.status(404).json({ erro: 'Postagem não encontrada.' });
    }

    const jaCurtiu = postagem.curtidas.some((id) => id.toString() === userId);

    if (jaCurtiu) {
      // Remove o like (toggle off)
      postagem.curtidas = postagem.curtidas.filter((id) => id.toString() !== userId);
    } else {
      // Adiciona o like (toggle on)
      postagem.curtidas.push(userId);
    }

    await postagem.save();

    res.json({
      sucesso: true,
      curtidas: postagem.curtidas.length,
      curtido: !jaCurtiu,
    });
  } catch (erro) {
    console.error('❌ Erro ao curtir:', erro.message);
    res.status(500).json({ erro: 'Erro interno.' });
  }
});

// ------------------------------------------------------------
//  POST /api/postagens/:id/comentar
//  Body: { usuario, texto }
// ------------------------------------------------------------
router.post('/:id/comentar', async (req, res) => {
  try {
    const { usuario, texto } = req.body;

    if (!usuario || !texto) {
      return res.status(400).json({ erro: 'usuario e texto são obrigatórios.' });
    }

    const postagem = await Postagem.findById(req.params.id);
    if (!postagem) {
      return res.status(404).json({ erro: 'Postagem não encontrada.' });
    }

    postagem.comentarios.push({ usuario, texto });
    await postagem.save();

    res.json({ sucesso: true, comentarios: postagem.comentarios });
  } catch (erro) {
    console.error('❌ Erro ao comentar:', erro.message);
    res.status(500).json({ erro: 'Erro interno.' });
  }
});

module.exports = router;