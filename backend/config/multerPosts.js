// ============================================================
//  Configuração do Multer + Sharp — Upload de Imagens dos Posts
//  Redimensiona para 1080x1080 e converte para WebP qualidade 80
//  Salva na pasta frontend/public/uploads/posts
// ============================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Garante que a pasta de destino existe
const uploadDir = path.resolve(__dirname, '../../frontend/public/uploads/posts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configura armazenamento em disco (temporário, será processado pelo sharp)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    // Nome temporário; será renomeado após processamento com sharp
    cb(null, 'tmp-' + uniqueSuffix + ext);
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
    fileSize: 10 * 1024 * 1024, // 10 MB máximo por arquivo
    files: 5,                   // máximo 5 arquivos
  },
});

/**
 * Middleware que processa as imagens após o upload com Multer.
 * Redimensiona cada imagem para 1080x1080 (cover), converte para .webp
 * com qualidade 80 e remove os arquivos temporários originais.
 *
 * Os caminhos finais ficam disponíveis em req.processedImages (array de strings).
 */
async function processImages(req, res, next) {
  // Se não houver arquivos, segue em frente
  if (!req.files || req.files.length === 0) {
    req.processedImages = [];
    return next();
  }

  const processedPaths = [];

  try {
    for (const file of req.files) {
      const tempPath = file.path;
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const finalName = 'post-' + uniqueSuffix + '.webp';
      const finalPath = path.join(uploadDir, finalName);

      // Redimensiona e converte com sharp
      await sharp(tempPath)
        .resize(1080, 1080, { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(finalPath);

      // Remove o arquivo temporário original
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {
        // Se não conseguir remover, não bloqueia o fluxo
        console.warn('⚠️ Não foi possível remover arquivo temporário:', tempPath);
      }

      // Caminho relativo para salvar no banco
      const relativePath = '/uploads/posts/' + finalName;
      processedPaths.push(relativePath);
    }

    req.processedImages = processedPaths;
    next();
  } catch (erro) {
    console.error('❌ Erro ao processar imagens com sharp:', erro.message);

    // Tenta limpar arquivos temporários em caso de erro
    for (const file of req.files) {
      try {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch (e) { /* ignora */ }
    }

    return res.status(500).json({
      erro: 'Erro ao processar as imagens enviadas. Tente novamente.',
    });
  }
}

module.exports = { upload, processImages };
