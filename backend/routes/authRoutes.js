// ============================================================
//  Rotas de Autenticação — Green Urban
//  POST /api/auth/registrar  —  Cadastro de novo usuário
//  POST /api/auth/login      —  Login do usuário
// ============================================================

const express = require('express');
const router = express.Router();
const { registrar, login } = require('../controllers/authController');

router.post('/registrar', registrar);
router.post('/login', login);

module.exports = router;