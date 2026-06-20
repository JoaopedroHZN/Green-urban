// ============================================================
//  Modelo de Evento — Green Urban
// ============================================================

const mongoose = require('mongoose');

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
    voluntarios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],

    // Porte: "pequeno/medio" ou "larga escala"
    porte: {
      type: String,
      enum: ['pequeno/medio', 'larga escala'],
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