<?php 
$use = "Tsiry";
$pawd = "tsiririmlay";
$server ="localhost";
$base ="gestion_cabinet";
//$connect = new PDO('mysql:host=localhost;dbname=gestion_cabinet',$use,$pawd);
$conx = mysqli_connect($server,$use,$pawd,$base);
if (!$conx){
    die("". mysqli_connect_error());   
}

?> 