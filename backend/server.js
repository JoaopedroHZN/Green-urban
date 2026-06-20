// ============================================================
//  Green Urban — Backend API
//  Servidor Express com Mongoose para conexão com MongoDB
// ============================================================

require('dotenv').config();

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
app.use(cors({
  origin: function (origin, callback) {
    // Em desenvolvimento, permite qualquer origem local (Vite pode mudar de porta)
    const permitidas = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5175',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
    // Se não houver origin (ex: Postman) ou estiver na lista, permite
    if (!origin || permitidas.includes(origin)) {
      callback(null, true);
    } else {
      // Em dev, para qualquer outra porta local, também permite
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        callback(new Error('Origem não permitida pelo CORS'));
      }
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());      // Permite receber JSON no body das requisições
app.use(express.urlencoded({ extended: true })); // Permite dados de formulários

// ------------------------------------------------------------
//  Rotas
// ------------------------------------------------------------

// Importar rotas da aplicação
const usuariosRouter = require('./routes/usuarios');
const authRoutes = require('./routes/authRoutes');
const postagensRouter = require('./routes/postagens');
const authMiddleware = require('./middleware/authMiddleware');

// ------------------------------------------------------------
//  Rota de Plantas do Cerrado — busca do dataset plantas_tropical.json
//  PROTEGIDA: Requer token JWT válido (Authorization: Bearer <TOKEN>)
// ------------------------------------------------------------
const plantasBase = require('./plantasBase.json');

// Log de todas as requisições para debug
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} — Origin: ${req.get('origin') || 'sem origin'} — Auth: ${req.get('authorization') ? 'SIM' : 'NÃO'}`);
  next();
});

app.get('/api/plantas', authMiddleware, (req, res) => {
  const { sol, espaco, rega } = req.query;

  let resultado = plantasBase;

  // Filtros opcionais via query string
  if (sol) {
    resultado = resultado.filter(p => p.condicoesIdeais.sol === sol);
  }
  if (espaco) {
    resultado = resultado.filter(p => p.condicoesIdeais.espaco === espaco);
  }
  if (rega) {
    resultado = resultado.filter(p => p.condicoesIdeais.rega === rega);
  }

  res.json({
    total: resultado.length,
    plantas: resultado,
  });
});

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

// Rotas da aplicação
app.use('/api/usuarios', usuariosRouter);
app.use('/api/auth', authRoutes);
app.use('/api/postagens', postagensRouter);

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