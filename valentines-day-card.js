$(document).ready(function () {
  const envelope = $('#envelope');
  const envelopeWrapper = $('#envelope-wrapper');
  const nextPageBtn = $('#next-page-btn');

  // Al hacer clic en el sobre, simplemente se añade o quita la clase 'open'.
  // El CSS se encarga del resto de la animación.
  envelopeWrapper.on('click', function (event) {
    envelope.toggleClass('open');
    event.stopPropagation(); // Detener la propagación para evitar problemas en anidaciones.
  });

  // Evitar que el clic en la carta cierre el sobre.
  $('#envelope-card').on('click', function (event) {
    event.stopPropagation();
  });

  // Botón para la siguiente página
  nextPageBtn.on('click', function () {
    // Aquí puedes redirigir a la siguiente página o mostrar otro contenido.
    window.location.href = "pagina2.html";
  });
});