// ============================================================
//  Rotas de Usuários — Green Urban
// ============================================================

const express = require('express');
const router = express.Router();
const { upload, cadastrar, buscarPerfil, listar, uploadFoto } = require('../controllers/usuarioController');

router.post('/cadastrar', cadastrar);
router.get('/perfil/:id', buscarPerfil);
router.get('/listar', listar);
router.put('/perfil/foto', upload.single('fotoPerfil'), uploadFoto);

module.exports = router;