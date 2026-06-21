// ============================================================
//  Configuração do Multer — Upload de Comprovantes
//  Salva na pasta frontend/public/uploads/checkins
// ============================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que a pasta de destino existe
const uploadDir = path.resolve(__dirname, '../../frontend/public/uploads/checkins');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configura armazenamento em disco
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Nome único: timestamp + número aleatório + extensão original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'checkin-' + uniqueSuffix + ext);
  },
});

// Filtro: aceita apenas imagens
const imageFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagem inválido. Envie JPEG, PNG, GIF ou WebP.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB máximo
  },
});

module.exports = upload;