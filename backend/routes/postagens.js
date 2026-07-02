// ============================================================
//  Rotas de Postagens — Green Urban (Rede Social)
// ============================================================

const express = require('express');
const router = express.Router();
const { listar, criar, curtir, comentar } = require('../controllers/postagemController');

router.get('/', listar);
router.post('/', criar);
router.patch('/:id/curtir', curtir);
router.post('/:id/comentar', comentar);

module.exports = router;