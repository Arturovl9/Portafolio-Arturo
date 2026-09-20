// script.js — Exportar el CV a PDF
// Usa html2pdf.js (cargado por CDN en index.html) para convertir el
// contenedor .wrap en un PDF descargable, ocultando el propio botón
// durante la captura para que no aparezca en el documento final.

// html2canvas (la librería que usa html2pdf por debajo) NO soporta la
// propiedad CSS `object-fit: cover`, así que estira la foto para llenar
// el círculo y se ve aplastada por los lados. Para evitarlo, recortamos
// la imagen a un cuadrado (centrado, como haría `cover`) antes de capturar.
function recortarCuadrada(img, lado) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) return null;

  const corte = Math.min(w, h);        // lado del cuadrado a recortar
  const sx = (w - corte) / 2;          // recorte centrado en horizontal
  const sy = (h - corte) / 2;          // recorte centrado en vertical

  const canvas = document.createElement('canvas');
  canvas.width = lado;
  canvas.height = lado;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, corte, corte, 0, 0, lado, lado);
  return canvas.toDataURL('image/png');
}

document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('export-pdf-btn');
  const target = document.querySelector('.wrap');
  const avatar = document.querySelector('.avatar');

  if (!btn || !target) return;

  btn.addEventListener('click', async function () {
    if (typeof html2pdf === 'undefined') {
      alert('No se pudo cargar la librería de exportación. Revisa tu conexión a internet e inténtalo de nuevo.');
      return;
    }

    const originalLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Generando PDF…';
    btn.classList.add('is-exporting');

    // Sustituimos temporalmente la foto por su versión cuadrada.
    const srcOriginal = avatar ? avatar.src : null;
    if (avatar) {
      try {
        const cuadrada = recortarCuadrada(avatar, 400);
        if (cuadrada) {
          avatar.src = cuadrada;
          if (avatar.decode) await avatar.decode();
        }
      } catch (e) {
        console.warn('No se pudo recortar la foto, se usará la original:', e);
      }
    }

    const opciones = {
      // Márgenes de página en mm: [arriba, izquierda, abajo, derecha].
      // Dejan un margen real de impresión en cada hoja A4 en vez de
      // pegar el contenido al borde del PDF.
      margin: [15, 12, 17, 12],
      filename: 'Arturo_Vega_CV.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      // Evita que html2pdf corte estos bloques justo por la mitad al
      // repartirlos entre páginas: cada uno saltará entero a la
      // siguiente página si no cabe entero en la actual.
      pagebreak: {
        mode: ['css', 'legacy'],
        avoid: ['.entry', '.info-card', '.pkg-group', '.lang-row', 'header', 'footer', 'h2']
      }
    };

    html2pdf()
      .set(opciones)
      .from(target)
      .save()
      .catch(function (err) {
        console.error('Error al generar el PDF:', err);
        alert('Ha ocurrido un error al generar el PDF. Inténtalo de nuevo.');
      })
      .finally(function () {
        // Restauramos la foto original y el botón.
        if (avatar && srcOriginal) avatar.src = srcOriginal;
        btn.disabled = false;
        btn.textContent = originalLabel;
        btn.classList.remove('is-exporting');
      });
  });
});
