<?php
header('Content-Type: application/json');

// Exemple de données simulées
$response = [
    "barChart" => [
        "labels" => ["Jan", "Fév", "Mar", "Avr"],
        "datasets" => [[
            "label" => "Ventes",
            "data" => [100, 150, 125, 180],
            "backgroundColor" => "rgba(75, 192, 192, 0.2)",
            "borderColor" => "rgba(75, 192, 192, 1)",
            "borderWidth" => 1
        ]]
    ],
    "lineChart" => [
        "labels" => ["Semaine 1", "Semaine 2", "Semaine 3", "Semaine 4"],
        "datasets" => [[
            "label" => "Trafic Web",
            "data" => [400, 600, 550, 700],
            "fill" => false,
            "borderColor" => "rgba(255, 99, 132, 1)"
        ]]
    ],
    "pieChart" => [
        "labels" => ["Chrome", "Firefox", "Edge", "Safari"],
        "datasets" => [[
            "label" => "Navigateurs",
            "data" => [60, 20, 10, 10],
            "backgroundColor" => [
                "rgba(255, 99, 132, 0.6)",
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)"
            ]
        ]]
    ]
];

echo json_encode($response);