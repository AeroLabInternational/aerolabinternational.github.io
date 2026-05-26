/**
 * pdf-viewer.js
 * Reusable PDF.js page-by-page viewer.
 *
 * Usage:
 *   initPdfViewer({
 *     pdfUrl:    '/assets/some/file.pdf',   // required
 *     canvasId:  'pdf-canvas',              // required
 *     prevBtnId: 'pdf-prev',               // required
 *     nextBtnId: 'pdf-next',               // required
 *     currentId: 'pdf-current',            // optional — span showing current page
 *     totalId:   'pdf-total',              // optional — span showing total pages
 *     scale:     0.5                       // optional — fraction of container width (default 0.5)
 *   });
 */
function initPdfViewer(options) {
  var pdfUrl          = options.pdfUrl;
  var canvas          = document.getElementById(options.canvasId);
  var ctx             = canvas.getContext('2d');
  var btnPrev         = document.getElementById(options.prevBtnId);
  var btnNext         = document.getElementById(options.nextBtnId);
  var currentSpan     = options.currentId ? document.getElementById(options.currentId) : null;
  var totalSpan       = options.totalId   ? document.getElementById(options.totalId)   : null;
  var scaleMultiplier = options.scale !== undefined ? options.scale : 0.5;

  var pdfDoc      = null;
  var currentPage = 1;

  function updateButtons() {
    btnPrev.disabled = currentPage <= 1;
    btnNext.disabled = currentPage >= pdfDoc.numPages;
  }

  function renderPage(num) {
    pdfDoc.getPage(num).then(function (page) {
      var dpr           = window.devicePixelRatio || 1;
      var padding       = parseFloat(getComputedStyle(canvas.parentElement).paddingLeft) * 2;
      var availableWidth = canvas.parentElement.clientWidth - padding;
      var maxHeight     = window.innerHeight * 0.95;
      var viewport      = page.getViewport({ scale: 1 });
      var scaleByWidth  = (availableWidth * scaleMultiplier) / viewport.width;
      var scaleByHeight = maxHeight / viewport.height;
      var scale         = Math.min(scaleByWidth, scaleByHeight);
      var scaledViewport = page.getViewport({ scale: scale });
      canvas.width  = scaledViewport.width  * dpr;
      canvas.height = scaledViewport.height * dpr;
      canvas.style.width  = scaledViewport.width  + 'px';
      canvas.style.height = scaledViewport.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      page.render({ canvasContext: ctx, viewport: scaledViewport });
      if (currentSpan) currentSpan.textContent = num;
      updateButtons();
    });
  }

  pdfjsLib.getDocument(pdfUrl).promise.then(function (doc) {
    pdfDoc = doc;
    if (totalSpan) totalSpan.textContent = doc.numPages;
    renderPage(currentPage);
  });

  btnPrev.addEventListener('click', function () {
    if (currentPage <= 1) return;
    currentPage--;
    renderPage(currentPage);
  });

  btnNext.addEventListener('click', function () {
    if (currentPage >= pdfDoc.numPages) return;
    currentPage++;
    renderPage(currentPage);
  });
}
