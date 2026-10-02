const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PHOTOS_DIR = path.join(__dirname, '..', 'photos');

async function optimizePhotos() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    console.error('Diretório de fotos não encontrado:', PHOTOS_DIR);
    return;
  }

  const files = fs.readdirSync(PHOTOS_DIR);
  let totalBeforeBytes = 0;
  let totalAfterBytes = 0;
  let processedCount = 0;

  console.log(`[FinOps] Iniciando otimização em lote de ${files.length} arquivos em ${PHOTOS_DIR}...`);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      continue;
    }

    const filePath = path.join(PHOTOS_DIR, file);
    const statBefore = fs.statSync(filePath);
    totalBeforeBytes += statBefore.size;

    const tmpPath = path.join(PHOTOS_DIR, `__tmp_${file}`);

    try {
      let pipeline = sharp(filePath).rotate(); // Preserva orientação EXIF

      pipeline = pipeline.resize(500, 500, {
        fit: 'inside',
        withoutEnlargement: true
      });

      if (ext === '.png') {
        pipeline = pipeline.png({ quality: 80, compressionLevel: 8 });
      } else {
        pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
      }

      await pipeline.toFile(tmpPath);

      // Substitui o arquivo original pelo otimizado
      fs.unlinkSync(filePath);
      fs.renameSync(tmpPath, filePath);

      const statAfter = fs.statSync(filePath);
      totalAfterBytes += statAfter.size;
      processedCount++;
    } catch (err) {
      console.error(`Erro ao otimizar foto ${file}:`, err.message);
      if (fs.existsSync(tmpPath)) {
        fs.unlinkSync(tmpPath);
      }
      totalAfterBytes += statBefore.size;
    }
  }

  const beforeMB = (totalBeforeBytes / (1024 * 1024)).toFixed(2);
  const afterMB = (totalAfterBytes / (1024 * 1024)).toFixed(2);
  const reduction = (((totalBeforeBytes - totalAfterBytes) / totalBeforeBytes) * 100).toFixed(1);

  console.log('====================================================');
  console.log(`✅ Otimização concluída com sucesso!`);
  console.log(`📸 Fotos processadas: ${processedCount}`);
  console.log(`📦 Tamanho anterior: ${beforeMB} MB`);
  console.log(`⚡ Novo tamanho total: ${afterMB} MB`);
  console.log(`📉 Redução de tráfego (Egress): ${reduction}%`);
  console.log('====================================================');
}

if (require.main === module) {
  optimizePhotos().catch(console.error);
}

module.exports = { optimizePhotos };
