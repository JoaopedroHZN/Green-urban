// ============================================================
//  Rotas de Eventos — Green Urban
//  Gamificação: inscrição, PIN, check-in com foto, aprovação
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');
const {
  criar, listar, buscarPorId,
  inscrever, gerarPin, checkin, rejeitar, aprovar
} = require('../controllers/eventoController');

// Todas as rotas são protegidas
router.use(authMiddleware);

// CRUD Básico
router.post('/', criar);
router.get('/', listar);
router.get('/:id', buscarPorId);

// Gamificação
router.post('/:id/inscrever', inscrever);
router.post('/:id/gerar-pin', gerarPin);
router.post('/:id/checkin', upload.single('foto'), checkin);
router.post('/:id/rejeitar/:idInscrito', rejeitar);
router.post('/:id/aprovar/:idInscrito', aprovar);

module.exports = router;