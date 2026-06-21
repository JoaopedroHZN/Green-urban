// ============================================================
//  Rotas de Eventos — Green Urban
//  Gamificação: inscrição, PIN, check-in com foto, aprovação
// ============================================================

const express = require('express');
const router = express.Router();
const Evento = require('../models/Evento');
const Usuario = require('../models/Usuario');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// Todas as rotas são protegidas
router.use(authMiddleware);

// ============================================================
//  CRUD Básico de Eventos
// ============================================================

// ------------------------------------------------------------
//  POST /api/eventos  —  Criar um novo evento
// ------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { titulo, data, horario, local, descricao, imagemUrl, vagas, porte } = req.body;

    if (!titulo || !data) {
      return res.status(400).json({ erro: 'Título e data são obrigatórios.' });
    }

    const numVagas = Number(vagas) || 0;

    // XP automático baseado no porte (regra de negócio fixa)
    let xpTotal = 0;
    if (porte === 'grande' || numVagas > 50) {
      xpTotal = 500;
    } else if (porte === 'medio' || (numVagas >= 16 && numVagas <= 50)) {
      xpTotal = 250;
    } else {
      // pequeno/medio padrão ou até 15 vagas
      xpTotal = 100;
    }

    const novoEvento = await Evento.create({
      titulo: titulo.trim(),
      data,
      horario: horario || '',
      local: local || '',
      descricao: descricao || '',
      imagemUrl: imagemUrl || '',
      vagas: numVagas,
      xpTotal,
      porte: porte || 'pequeno/medio',
      criadoPor: req.usuario.id,
    });

    res.status(201).json({
      mensagem: 'Evento criado com sucesso!',
      evento: novoEvento,
    });
  } catch (erro) {
    console.error('Erro ao criar evento:', erro);
    if (erro.name === 'ValidationError') {
      const mensagens = Object.values(erro.errors).map((e) => e.message);
      return res.status(400).json({ erro: mensagens.join('. ') });
    }
    res.status(500).json({ erro: 'Erro interno ao criar evento.' });
  }
});

// ------------------------------------------------------------
//  GET /api/eventos  —  Listar todos os eventos
// ------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const eventos = await Evento.find()
      .populate('criadoPor', 'nome email')
      .sort({ data: -1 });

    res.json({ total: eventos.length, eventos });
  } catch (erro) {
    console.error('Erro ao listar eventos:', erro);
    res.status(500).json({ erro: 'Erro interno ao listar eventos.' });
  }
});

// ------------------------------------------------------------
//  GET /api/eventos/:id  —  Buscar um evento específico
// ------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id)
      .populate('criadoPor', 'nome email')
      .populate('inscritos.usuarioId', 'nome email');

    if (!evento) {
      return res.status(404).json({ erro: 'Evento não encontrado.' });
    }

    res.json({ evento });
  } catch (erro) {
    console.error('Erro ao buscar evento:', erro);
    if (erro.name === 'CastError') {
      return res.status(400).json({ erro: 'ID de evento inválido.' });
    }
    res.status(500).json({ erro: 'Erro interno ao buscar evento.' });
  }
});

// ============================================================
//  Rotas de Gamificação
// ============================================================

// ------------------------------------------------------------
//  POST /api/eventos/:id/inscrever
//  Adiciona o usuário logado ao array de inscritos (status 'inscrito')
//  e soma 20% do xpTotal no documento do Usuário.
// ------------------------------------------------------------
router.post('/:id/inscrever', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({ erro: 'Evento não encontrado.' });
    }

    // Verifica se o usuário já está inscrito
    const jaInscrito = evento.inscritos.some(
      (insc) => String(insc.usuarioId) === String(usuarioId)
    );
    if (jaInscrito) {
      return res.status(409).json({ erro: 'Você já está inscrito neste evento.' });
    }

    // Verifica se ainda há vagas
    if (evento.vagas > 0 && evento.inscritos.length >= evento.vagas) {
      return res.status(400).json({ erro: 'Todas as vagas já foram preenchidas.' });
    }

    // Cria a inscrição
    evento.inscritos.push({ usuarioId, status: 'inscrito' });
    await evento.save();

    // Soma 20% do xpTotal ao usuário
    const xpGanho = Math.round(evento.xpTotal * 0.2);
    if (xpGanho > 0) {
      await Usuario.findByIdAndUpdate(usuarioId, { $inc: { xp: xpGanho } });
    }

    res.json({
      mensagem: 'Inscrição realizada com sucesso!',
      xpGanho: xpGanho,
      xpTotalEvento: evento.xpTotal,
    });
  } catch (erro) {
    console.error('Erro ao inscrever:', erro);
    if (erro.name === 'CastError') {
      return res.status(400).json({ erro: 'ID de evento inválido.' });
    }
    res.status(500).json({ erro: 'Erro interno ao realizar inscrição.' });
  }
});

// ------------------------------------------------------------
//  POST /api/eventos/:id/gerar-pin
//  Apenas para o criador do evento.
//  Gera um número aleatório de 6 dígitos e salva no pinCheckin.
// ------------------------------------------------------------
router.post('/:id/gerar-pin', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({ erro: 'Evento não encontrado.' });
    }

    // Apenas o criador pode gerar o PIN
    console.log('DEBUG PERMISSÃO GERAR-PIN -> Dono no Banco:', evento.criadoPor, '| Logado:', req.usuario.id);
    if (evento.criadoPor.toString() !== req.usuario.id.toString()) {
      return res.status(403).json({ erro: 'Apenas o organizador deste evento pode gerar o PIN.' });
    }

    // Gera PIN de 6 dígitos (100000 a 999999)
    const pin = String(Math.floor(100000 + Math.random() * 900000));

    evento.pinCheckin = pin;
    await evento.save();

    res.json({
      mensagem: 'PIN de check-in gerado com sucesso!',
      pin: pin,
      evento: evento.titulo,
    });
  } catch (erro) {
    console.error('Erro ao gerar PIN:', erro);
    if (erro.name === 'CastError') {
      return res.status(400).json({ erro: 'ID de evento inválido.' });
    }
    res.status(500).json({ erro: 'Erro interno ao gerar PIN.' });
  }
});

// ------------------------------------------------------------
//  POST /api/eventos/:id/checkin
//  Recebe o "pin" digitado e o arquivo da foto (multipart/form-data).
//  Verifica se o PIN bate. Se bater, salva o caminho da foto e
//  muda o status para 'pendente'.
//  Campos esperados: pin (texto) + foto (arquivo campo "foto")
// ------------------------------------------------------------
router.post('/:id/checkin', upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;
    const usuarioId = req.usuario.id;

    if (!pin) {
      return res.status(400).json({ erro: 'O PIN de check-in é obrigatório.' });
    }

    if (!req.file) {
      return res.status(400).json({ erro: 'A foto comprovante é obrigatória.' });
    }

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({ erro: 'Evento não encontrado.' });
    }

    // Verifica se o PIN foi gerado
    if (!evento.pinCheckin) {
      return res.status(400).json({ erro: 'O PIN de check-in ainda não foi gerado pelo criador.' });
    }

    // Verifica se o PIN bate
    if (evento.pinCheckin !== pin.trim()) {
      return res.status(400).json({ erro: 'PIN incorreto. Verifique e tente novamente.' });
    }

    // Localiza a inscrição do usuário
    const indexInscrito = evento.inscritos.findIndex(
      (i) => String(i.usuarioId) === String(req.usuario.id)
    );

    if (indexInscrito === -1) {
      return res.status(400).json({ erro: 'Você não está inscrito neste evento.' });
    }

    const inscricao = evento.inscritos[indexInscrito];

    if (inscricao.status === 'aprovado') {
      return res.status(400).json({ erro: 'Seu check-in já foi aprovado.' });
    }

    // Monta o caminho relativo da foto para o frontend
    const caminhoRelativo = '/uploads/checkins/' + req.file.filename;

    // Atualiza a inscrição
    inscricao.status = 'pendente';
    inscricao.fotoComprovante = caminhoRelativo;
    await evento.save();

    res.json({
      mensagem: 'Check-in realizado com sucesso! Aguardando aprovação do criador.',
      status: 'pendente',
      foto: caminhoRelativo,
    });
  } catch (erro) {
    console.error('Erro ao fazer check-in:', erro);
    if (erro.name === 'CastError') {
      return res.status(400).json({ erro: 'ID de evento inválido.' });
    }
    if (erro.message && erro.message.includes('Formato de imagem')) {
      return res.status(400).json({ erro: erro.message });
    }
    res.status(500).json({ erro: 'Erro interno ao realizar check-in.' });
  }
});

// ------------------------------------------------------------
//  POST /api/eventos/:id/rejeitar/:idInscrito
//  Apenas para o criador do evento.
//  Reseta o status do inscrito para 'inscrito' e limpa a foto comprovante.
// ------------------------------------------------------------
router.post('/:id/rejeitar/:idInscrito', async (req, res) => {
  try {
    const { id, idInscrito } = req.params;
    const criadorId = req.usuario.id;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({ erro: 'Evento não encontrado.' });
    }

    // Apenas o criador pode rejeitar
    console.log('DEBUG PERMISSÃO REJEITAR -> Dono no Banco:', evento.criadoPor, '| Logado:', req.usuario.id);
    if (evento.criadoPor.toString() !== req.usuario.id.toString()) {
      return res.status(403).json({ erro: 'Apenas o organizador deste evento pode rejeitar check-ins.' });
    }

    // Localiza a inscrição pelo usuarioId
    const inscricaoRej = evento.inscritos.find(
      (i) => String(i.usuarioId) === String(idInscrito)
    );

    if (!inscricaoRej) {
      return res.status(404).json({ erro: 'Inscrição não encontrada para este usuário.' });
    }

    // Reseta para 'inscrito' e limpa a foto
    inscricaoRej.status = 'inscrito';
    inscricaoRej.fotoComprovante = null;
    await evento.save();

    res.json({
      mensagem: 'Check-in recusado. O inscrito pode tentar novamente.',
      status: 'inscrito',
    });
  } catch (erro) {
    console.error('Erro ao rejeitar check-in:', erro);
    if (erro.name === 'CastError') {
      return res.status(400).json({ erro: 'ID inválido.' });
    }
    res.status(500).json({ erro: 'Erro interno ao rejeitar check-in.' });
  }
});

// ------------------------------------------------------------
//  POST /api/eventos/:id/aprovar/:idInscrito
//  Apenas para o criador do evento.
//  Muda o status do inscrito para 'aprovado' e soma os 80% restantes
//  do xpTotal no documento do Usuário.
// ------------------------------------------------------------
router.post('/:id/aprovar/:idInscrito', async (req, res) => {
  try {
    const { id, idInscrito } = req.params;
    const criadorId = req.usuario.id;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({ erro: 'Evento não encontrado.' });
    }

    // Apenas o criador pode aprovar
    console.log('DEBUG PERMISSÃO APROVAR -> Dono no Banco:', evento.criadoPor, '| Logado:', req.usuario.id);
    if (evento.criadoPor.toString() !== req.usuario.id.toString()) {
      return res.status(403).json({ erro: 'Apenas o organizador deste evento pode aprovar check-ins.' });
    }

    // Localiza a inscrição pelo usuarioId
    const inscricaoApr = evento.inscritos.find(
      (i) => String(i.usuarioId) === String(idInscrito)
    );

    if (!inscricaoApr) {
      return res.status(404).json({ erro: 'Inscrição não encontrada para este usuário.' });
    }

    if (inscricaoApr.status === 'aprovado') {
      return res.status(400).json({ erro: 'Este check-in já foi aprovado.' });
    }

    if (inscricaoApr.status !== 'pendente') {
      return res.status(400).json({ erro: 'O check-in precisa estar pendente para ser aprovado.' });
    }

    // Aprova
    inscricaoApr.status = 'aprovado';
    await evento.save();

    // Soma 80% restantes do xpTotal ao usuário
    const xpRestante = Math.round(evento.xpTotal * 0.8);
    if (xpRestante > 0) {
      await Usuario.findByIdAndUpdate(idInscrito, { $inc: { xp: xpRestante } });
    }

    res.json({
      mensagem: 'Check-in aprovado com sucesso!',
      xpConcedido: xpRestante,
      status: 'aprovado',
    });
  } catch (erro) {
    console.error('Erro ao aprovar check-in:', erro);
    if (erro.name === 'CastError') {
      return res.status(400).json({ erro: 'ID inválido.' });
    }
    res.status(500).json({ erro: 'Erro interno ao aprovar check-in.' });
  }
});

module.exports = router;