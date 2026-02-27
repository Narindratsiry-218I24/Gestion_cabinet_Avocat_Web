<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Plusieurs Graphes avec Chart.js</title>
    <script src="jquery 3.7.1.js"></script>
    <script src="chart.js"></script>
    <style>
        canvas {
            margin: 20px;
            max-width: 600px;
        }
    </style>
</head>
<body>

<h2>Graphe en Barres</h2>
<canvas id="barChart"></canvas>

<h2>Graphe en Lignes</h2>
<canvas id="lineChart"></canvas>

<h2>Diagramme Camembert</h2>
<canvas id="pieChart"></canvas>

<script>
$(document).ready(function() {
    $.ajax({
        url: 'graphe.php',
        method: 'GET',
        success: function(response) {
            const barCtx = document.getElementById('barChart').getContext('2d');
            new Chart(barCtx, {
                type: 'bar',
                ata: response.barChart,
                options: { responsive: true }
            });

            const lineCtx = document.getElementById('lineChart').getContext('2d');
            new Chart(lineCtx, {
                type: 'line',
                data: response.lineChart,
                options: { responsive: true }
            });

            const pieCtx = document.getElementById('pieChart').getContext('2d');
            new Chart(pieCtx, {
                type: 'pie',
                data: response.pieChart,
                options: { responsive: true }
            });
        }
    });
});
</script>

</body>
</html>