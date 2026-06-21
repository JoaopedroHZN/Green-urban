// ============================================================
//  Modelo de Postagem — Green Urban (Rede Social)
// ============================================================

const mongoose = require('mongoose');

const postagemSchema = new mongoose.Schema(
  {
    autorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'Autor é obrigatório'],
    },
    legenda: {
      type: String,
      required: [true, 'A legenda é obrigatória'],
      trim: true,
      maxlength: [500, 'Máximo 500 caracteres'],
    },
    imagemUrl: {
      type: String,
      default: '',
    },
    // Array de referências — cada entrada = 1 like de um usuário
    curtidas: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
    }],
    comentarios: [
      {
        usuario: { type: String, required: true },
        texto: { type: String, required: true, maxlength: 200 },
        criadoEm: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Postagem', postagemSchema);