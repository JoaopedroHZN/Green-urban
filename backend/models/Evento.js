// ============================================================
//  Modelo de Evento — Green Urban
// ============================================================

const mongoose = require('mongoose');

// Subdocumento para cada inscrito
const inscricaoSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    status: {
      type: String,
      enum: ['inscrito', 'pendente', 'aprovado'],
      default: 'inscrito',
    },
    fotoComprovante: {
      type: String,
      default: null,
    },
  },
  { _id: false } // não gera _id para subdocs
);

const eventoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'O título é obrigatório'],
      trim: true,
    },
    data: { type: Date, required: [true, 'A data é obrigatória'] },
    horario: { type: String, default: '' },
    local: { type: String, default: '' },
    descricao: { type: String, default: '' },
    imagemUrl: { type: String, default: '' },
    vagas: { type: Number, default: 0, min: 0 },

    // XP total que o evento concede
    xpTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    // PIN de 6 dígitos para check-in (gerado pelo criador)
    pinCheckin: {
      type: String,
      default: null,
    },

    // Array de objetos de inscrição
    inscritos: {
      type: [inscricaoSchema],
      default: [],
    },

    // Porte: "pequeno/medio", "medio", "grande" ou "larga escala"
    porte: {
      type: String,
      enum: ['pequeno/medio', 'medio', 'grande', 'larga escala'],
      default: 'pequeno/medio',
    },

    criadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'Criador do evento é obrigatório'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Evento', eventoSchema);
