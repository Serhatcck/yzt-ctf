<?php
$host = getenv('MYSQL_HOST') ?: 'localhost';
$user = getenv('MYSQL_USER') ?: 'ctf_user';
$pass = getenv('MYSQL_PASSWORD') ?: 'ctf_password';
$db   = getenv('MYSQL_DATABASE') ?: 'ctf_db';

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?> 