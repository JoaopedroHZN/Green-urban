// ============================================================
//  Modelo de Usuário — Green Urban
// ============================================================

const mongoose = require('mongoose');

// ------------------------------------------------------------
//  Schema do Usuário
// ------------------------------------------------------------

const usuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome é obrigatório'],
      trim: true,
      minlength: [2, 'O nome deve ter pelo menos 2 caracteres'],
      maxlength: [80, 'O nome deve ter no máximo 80 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'O email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Formato de email inválido'],
    },
    senha: {
      type: String,
      required: [true, 'A senha é obrigatória'],
      minlength: [6, 'A senha deve ter pelo menos 6 caracteres'],
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    nivel: {
      type: String,
      enum: ['usuario', 'criador', 'admin'],
      default: 'usuario',
    },
    pontuacaoTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    listaConquistas: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    fotoPerfil: {
      type: String,
      default: '',
    },
  },
  {
    // Adiciona automaticamente createdAt e updatedAt
    timestamps: true,
  }
);

// ------------------------------------------------------------
//  Exportar modelo
// ------------------------------------------------------------

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;