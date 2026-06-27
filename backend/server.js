// ============================================================
//  Green Urban — Backend API
//  Servidor Express com Mongoose para conexão com MongoDB
// ============================================================

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// ------------------------------------------------------------
//  Configurações
// ------------------------------------------------------------

// Porta do servidor (usa variável de ambiente ou 4000 por padrão)
const PORT = process.env.PORT || 4000;

// String de conexão com o MongoDB
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/green-urban';

// ------------------------------------------------------------
//  App Express
// ------------------------------------------------------------

const app = express();

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    const permitidas = [
      'http://localhost:5173', 'http://127.0.0.1:5173',
      'http://localhost:5174', 'http://127.0.0.1:5174',
      'http://localhost:5175', 'http://127.0.0.1:5175',
      'http://localhost:3000', 'http://127.0.0.1:3000',
    ];
    if (!origin || permitidas.includes(origin)) {
      callback(null, true);
    } else if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads de perfil)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'frontend', 'public', 'uploads')));

// ------------------------------------------------------------
//  Rotas
// ------------------------------------------------------------

const usuariosRouter = require('./routes/usuarios');
const authRoutes = require('./routes/authRoutes');
const postagensRouter = require('./routes/postagens');
const eventosRouter = require('./routes/eventos');
const plantasRouter = require('./routes/plantas');

// Log de requisições
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} — Origin: ${req.get('origin') || 'sem origin'}`);
  next();
});

// Rota inicial
app.get('/', (req, res) => {
  res.json({ mensagem: '🌿 Green Urban API rodando!', versao: '1.0.0', status: 'online' });
});

// Health check
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
app.use('/api/eventos', eventosRouter);
app.use('/api/plantas', plantasRouter);

// ------------------------------------------------------------
//  Conexão com MongoDB
// ------------------------------------------------------------

async function conectarBanco() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado ao MongoDB com sucesso!');
  } catch (erro) {
    console.error('❌ Erro ao conectar no MongoDB:', erro.message);
  }
}

conectarBanco();

// ------------------------------------------------------------
//  Iniciar servidor
// ------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`🌿 Green Urban API — http://localhost:${PORT}`);
});