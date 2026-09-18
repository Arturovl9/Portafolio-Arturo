// script.js — Exportar el CV a PDF
// Usa html2pdf.js (cargado por CDN en index.html) para convertir el
// contenedor .wrap en un PDF descargable, ocultando el propio botón
// durante la captura para que no aparezca en el documento final.

document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('export-pdf-btn');
  const target = document.querySelector('.wrap');

  if (!btn || !target) return;

  btn.addEventListener('click', function () {
    if (typeof html2pdf === 'undefined') {
      alert('No se pudo cargar la librería de exportación. Revisa tu conexión a internet e inténtalo de nuevo.');
      return;
    }

    const originalLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Generando PDF…';
    btn.classList.add('is-exporting');

    const opciones = {
      margin: 0,
      filename: 'Arturo_Vega_CV.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
      // Evita que html2pdf corte estos bloques justo por la mitad al
      // repartirlos entre páginas: cada uno saltará entero a la
      // siguiente página si no cabe entero en la actual.
      pagebreak: {
        mode: ['css', 'legacy'],
        avoid: ['.entry', '.info-card', '.pkg-group', '.lang-row', 'header', 'h2']
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
        btn.disabled = false;
        btn.textContent = originalLabel;
        btn.classList.remove('is-exporting');
      });
  });
});
