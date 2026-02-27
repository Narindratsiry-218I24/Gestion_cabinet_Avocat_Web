$(document).ready(function() {
$('#champ').on('keypress', function(e) {
  if (e.which >= 48 && e.which <= 57) { // Codes ASCII des chiffres (0 à 9)
    e.preventDefault();
    $('#erreur').fadeIn();

    setTimeout(function() {
      $('#erreur').fadeOut();
    }, 2000); // Masquer après 2 secondes
  }
});

});

