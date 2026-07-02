// ============================================================
//  Controller de Eventos — Green Urban
//  Gamificação: inscrição, PIN, check-in com foto, aprovação
// ============================================================

const Evento = require('../models/Evento');
const Usuario = require('../models/Usuario');
const upload = require('../config/multer');
const { verificarEAtualizarConquistas } = require('../services/conquistas');

// ============================================================
//  CRUD Básico de Eventos
// ============================================================

// ------------------------------------------------------------
//  criar — POST /api/eventos
// ------------------------------------------------------------
const criar = async (req, res) => {
  try {
    const { titulo, data, horario, local, descricao, imagemUrl, vagas, porte } = req.body;

    if (!titulo || !data) {
      return res.status(400).json({ erro: 'Título e data são obrigatórios.' });
    }

    const numVagas = Number(vagas) || 0;

    let xpTotal = 0;
    if (porte === 'grande' || numVagas > 50) {
      xpTotal = 500;
    } else if (porte === 'medio' || (numVagas >= 16 && numVagas <= 50)) {
      xpTotal = 250;
    } else {
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
};

// ------------------------------------------------------------
//  listar — GET /api/eventos
// ------------------------------------------------------------
const listar = async (req, res) => {
  try {
    const eventos = await Evento.find()
      .populate('criadoPor', 'nome email')
      .sort({ data: -1 });

    res.json({ total: eventos.length, eventos });
  } catch (erro) {
    console.error('Erro ao listar eventos:', erro);
    res.status(500).json({ erro: 'Erro interno ao listar eventos.' });
  }
};

// ------------------------------------------------------------
//  buscarPorId — GET /api/eventos/:id
// ------------------------------------------------------------
const buscarPorId = async (req, res) => {
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
};

// ============================================================
//  Rotas de Gamificação
// ============================================================

// ------------------------------------------------------------
//  inscrever — POST /api/eventos/:id/inscrever
// ------------------------------------------------------------
const inscrever = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({ erro: 'Evento não encontrado.' });
    }

    const jaInscrito = evento.inscritos.some(
      (insc) => String(insc.usuarioId) === String(usuarioId)
    );
    if (jaInscrito) {
      return res.status(409).json({ erro: 'Você já está inscrito neste evento.' });
    }

    if (evento.vagas > 0 && evento.inscritos.length >= evento.vagas) {
      return res.status(400).json({ erro: 'Todas as vagas já foram preenchidas.' });
    }

    evento.inscritos.push({ usuarioId, status: 'inscrito' });
    await evento.save();

    const xpGanho = Math.round(evento.xpTotal * 0.2);
    console.log(`🎯 [DEBUG] POST /api/eventos/:id/inscrever — gatilho conquistas usuario ${usuarioId}`);
    const ri = await verificarEAtualizarConquistas(usuarioId, 'inscricao_evento', { xpGanho });
    console.log(`✅ [DEBUG] OK — xpGanho=${xpGanho} conquistas=${ri.conquistasConcedidas.length}`);

    res.json({
      mensagem: 'Inscrição realizada com sucesso!',
      xpGanho,
      xpTotalEvento: evento.xpTotal,
      conquistasConcedidas: ri.conquistasConcedidas,
    });
  } catch (erro) {
    console.error('Erro ao inscrever:', erro);
    if (erro.name === 'CastError') {
      return res.status(400).json({ erro: 'ID de evento inválido.' });
    }
    res.status(500).json({ erro: 'Erro interno ao realizar inscrição.' });
  }
};

// ------------------------------------------------------------
//  gerarPin — POST /api/eventos/:id/gerar-pin
// ------------------------------------------------------------
const gerarPin = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({ erro: 'Evento não encontrado.' });
    }

    console.log('DEBUG PERMISSÃO GERAR-PIN -> Dono no Banco:', evento.criadoPor, '| Logado:', req.usuario.id);
    if (evento.criadoPor.toString() !== req.usuario.id.toString()) {
      return res.status(403).json({ erro: 'Apenas o organizador deste evento pode gerar o PIN.' });
    }

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
};

// ------------------------------------------------------------
//  checkin — POST /api/eventos/:id/checkin
// ------------------------------------------------------------
const checkin = async (req, res) => {
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

    if (!evento.pinCheckin) {
      return res.status(400).json({ erro: 'O PIN de check-in ainda não foi gerado pelo criador.' });
    }

    if (evento.pinCheckin !== pin.trim()) {
      return res.status(400).json({ erro: 'PIN incorreto. Verifique e tente novamente.' });
    }

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

    const caminhoRelativo = '/uploads/checkins/' + req.file.filename;

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
};

// ------------------------------------------------------------
//  rejeitar — POST /api/eventos/:id/rejeitar/:idInscrito
// ------------------------------------------------------------
const rejeitar = async (req, res) => {
  try {
    const { id, idInscrito } = req.params;
    const criadorId = req.usuario.id;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({ erro: 'Evento não encontrado.' });
    }

    console.log('DEBUG PERMISSÃO REJEITAR -> Dono no Banco:', evento.criadoPor, '| Logado:', req.usuario.id);
    if (evento.criadoPor.toString() !== req.usuario.id.toString()) {
      return res.status(403).json({ erro: 'Apenas o organizador deste evento pode rejeitar check-ins.' });
    }

    const inscricaoRej = evento.inscritos.find(
      (i) => String(i.usuarioId) === String(idInscrito)
    );

    if (!inscricaoRej) {
      return res.status(404).json({ erro: 'Inscrição não encontrada para este usuário.' });
    }

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
};

// ------------------------------------------------------------
//  aprovar — POST /api/eventos/:id/aprovar/:idInscrito
// ------------------------------------------------------------
const aprovar = async (req, res) => {
  try {
    const { id, idInscrito } = req.params;
    const criadorId = req.usuario.id;

    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({ erro: 'Evento não encontrado.' });
    }

    console.log('DEBUG PERMISSÃO APROVAR -> Dono no Banco:', evento.criadoPor, '| Logado:', req.usuario.id);
    if (evento.criadoPor.toString() !== req.usuario.id.toString()) {
      return res.status(403).json({ erro: 'Apenas o organizador deste evento pode aprovar check-ins.' });
    }

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

    inscricaoApr.status = 'aprovado';
    await evento.save();

    const xpRestante = Math.round(evento.xpTotal * 0.8);
    console.log(`🎯 [DEBUG] POST /api/eventos/:id/aprovar — gatilho conquistas usuario ${idInscrito}`);
    const ra = await verificarEAtualizarConquistas(idInscrito, 'aprovacao_evento', { xpGanho: xpRestante });
    console.log(`✅ [DEBUG] OK — xpGanho=${xpRestante} conquistas=${ra.conquistasConcedidas.length}`);

    res.json({
      mensagem: 'Check-in aprovado com sucesso!',
      xpConcedido: xpRestante,
      status: 'aprovado',
      conquistasConcedidas: ra.conquistasConcedidas,
    });
  } catch (erro) {
    console.error('Erro ao aprovar check-in:', erro);
    if (erro.name === 'CastError') {
      return res.status(400).json({ erro: 'ID inválido.' });
    }
    res.status(500).json({ erro: 'Erro interno ao aprovar check-in.' });
  }
};

module.exports = { criar, listar, buscarPorId, inscrever, gerarPin, checkin, rejeitar, aprovar };