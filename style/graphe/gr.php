<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Graphe PHP + jQuery</title>
    <script src="jquery 3.7.1.js"></script>
    <script src="chart.js"></script>
</head>
<body>

<canvas id="monGraphe" width="400" height="200"></canvas>

<script>
$(document).ready(function() {
    $.ajax({
        url: 'graphe.php',
        method: 'GET',
        success: function(response) {
            const ctx = document.getElementById('#barchar').getContext('2d');
            new Chart(ctx, {
                type: 'bar', // ou 'line', 'pie', etc.
                data: response,
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    });
});
</script>

</body>
</html>