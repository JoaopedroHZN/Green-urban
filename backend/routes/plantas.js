// ============================================================
//  Rotas de Plantas — Green Urban
//  Endpoints para Dicionário Verde e Assistente de Recomendação
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { listar, recomendacao } = require('../controllers/plantaController');

router.get('/', authMiddleware, listar);
router.get('/recomendacao', authMiddleware, recomendacao);

module.exports = router;