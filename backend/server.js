// ============================================================
//  Green Urban — Backend API
//  Servidor Express com Mongoose para conexão com MongoDB
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ------------------------------------------------------------
//  Configurações
// ------------------------------------------------------------

// Porta do servidor (usa variável de ambiente ou 4000 por padrão)
const PORT = process.env.PORT || 4000;

// String de conexão com o MongoDB
// Altere para a sua string do MongoDB Atlas ou local
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/green-urban';

// ------------------------------------------------------------
//  App Express
// ------------------------------------------------------------

const app = express();

// Middlewares
app.use(cors());              // Libera requisições de origens diferentes
app.use(express.json());      // Permite receber JSON no body das requisições
app.use(express.urlencoded({ extended: true })); // Permite dados de formulários

// ------------------------------------------------------------
//  Rotas
// ------------------------------------------------------------

// Rota inicial — verificação de saúde da API
app.get('/', (req, res) => {
  res.json({
    mensagem: '🌿 Green Urban API rodando!',
    versao: '1.0.0',
    status: 'online',
  });
});

// Rota de teste para conferir se o servidor responde
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    banco: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado',
    timestamp: new Date().toISOString(),
  });
});

// ------------------------------------------------------------
//  Conexão com MongoDB
// ------------------------------------------------------------

async function conectarBanco() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado ao MongoDB com sucesso!');
  } catch (erro) {
    console.error('❌ Erro ao conectar no MongoDB:', erro.message);
    console.log('⚠️  O servidor continuará rodando, mas sem banco de dados.');
  }
}

conectarBanco();

// ------------------------------------------------------------
//  Iniciar servidor
// ------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════╗
  ║     🌿 Green Urban — Backend API               ║
  ║────────────────────────────────────────────────║
  ║  Servidor: http://localhost:${PORT}               ║
  ║  Health:   http://localhost:${PORT}/api/health    ║
  ╚════════════════════════════════════════════════╝
  `);
});