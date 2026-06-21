const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ─── Caminhos ───────────────────────────────────────────────
const FOTOS_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'fotos-plantas');
const PLANTAS_INPUT = path.join(__dirname, '..', 'plantas_tropical.json');
const PLANTAS_OUTPUT = path.join(__dirname, '..', 'plantasBase.json');
const DELAY_MS = 1500;

// ─── Helpers ────────────────────────────────────────────────

/** Aguarda N milissegundos */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Transforma nome em slug seguro: "Espada de São Jorge" → "espada-de-sao-jorge" */
function slugify(nome) {
  return nome
    .normalize('NFD')                     // decompõe acentos
    .replace(/[\u0300-\u036f]/g, '')      // remove marcas de acento
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')          // substitui caracteres especiais por hífen
    .replace(/^-+|-+$/g, '');             // remove hífens das pontas
}

// ─── Core ───────────────────────────────────────────────────

/**
 * Faz download da foto de UMA planta via iNaturalist.
 * @returns {Promise<void>}
 */
async function baixarFoto(planta, index, total) {
  const slug = slugify(planta.nomePopular);
  const arquivoDestino = path.join(FOTOS_DIR, `${slug}.jpg`);
  const nomeBusca = planta.nomeCientifico || planta.nomePopular;

  // Se já tiver imagem local marcada, pula (otimização para re-runs)
  if (planta.imagem && planta.imagem.startsWith('/fotos-plantas/')) {
    console.log(
      `\x1b[90m[${index + 1}/${total}] Já local: ${slug}.jpg\x1b[0m`
    );
    return;
  }

  try {
    // 4B – Buscar na API do iNaturalist
    const urlBusca = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(nomeBusca)}&rank=species`;
    const resposta = await axios.get(urlBusca);

    // 4C – Capturar URL da foto
    const fotoUrl = resposta.data.results[0]?.default_photo?.medium_url;

    if (!fotoUrl) {
      console.log(
        `\x1b[33m[${index + 1}/${total}] Sem foto no iNaturalist: ${slug}.jpg — mantendo imagem atual\x1b[0m`
      );
      return;
    }

    // 4D – Download com stream e salvamento em disco
    const respostaFoto = await axios({
      method: 'GET',
      url: fotoUrl,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(arquivoDestino);
    respostaFoto.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // 4E – Atualizar a propriedade no objeto
    planta.imagem = `/fotos-plantas/${slug}.jpg`;

    console.log(
      `\x1b[32m[${index + 1}/${total}] Baixado: ${slug}.jpg\x1b[0m`
    );
  } catch (erro) {
    // 6 – Resiliência: loga o erro e segue em frente
    console.log(
      `\x1b[33m[${index + 1}/${total}] Erro ao baixar "${slug}.jpg" — ${erro.message} — mantendo imagem atual\x1b[0m`
    );
  }
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  console.log('\n🌿 🤖  Robô de Download Botânico — Green Urban  🌿\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 2 – Criar pasta de destino se não existir
  if (!fs.existsSync(FOTOS_DIR)) {
    fs.mkdirSync(FOTOS_DIR, { recursive: true });
    console.log(`📁 Pasta criada: ${FOTOS_DIR}\n`);
  }

  // 3 – Ler o arquivo de plantas
  const plantas = JSON.parse(fs.readFileSync(PLANTAS_INPUT, 'utf-8'));
  const total = plantas.length;
  console.log(`📋 ${total} plantas carregadas de plantas_tropical.json\n`);
  console.log('⏳ Iniciando downloads (delay de 1,5s entre requisições)...\n');

  // 4 – Loop assíncrono com delay
  for (let i = 0; i < total; i++) {
    await baixarFoto(plantas[i], i, total);

    // 5 – Delay de 1500ms entre requisições (exceto na última)
    if (i < total - 1) {
      await sleep(DELAY_MS);
    }
  }

  // 7 – Reescrever o arquivo de saída
  fs.writeFileSync(PLANTAS_OUTPUT, JSON.stringify(plantas, null, 2), 'utf-8');

  const baixadas = plantas.filter((p) => p.imagem && p.imagem.startsWith('/fotos-plantas/')).length;
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n✅ FINALIZADO! ${baixadas}/${total} fotos baixadas com sucesso.`);
  console.log(`📁 Fotos salvas em: ${FOTOS_DIR}`);
  console.log(`📄 Arquivo atualizado: ${PLANTAS_OUTPUT}\n`);
}

main().catch((err) => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});