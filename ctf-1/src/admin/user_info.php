<?php
ob_start();
session_start();
require_once '../config.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

// Get user_id parameter
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : '';

// Function to check if MD5 hash corresponds to a number between 0-10
function isValidMD5($hash)
{
    for ($i = 0; $i <= 10; $i++) {
        if (md5($i) === $hash) {
            return $i;
        }
    }
    return false;
}

$is_admin = false;

// Check if the MD5 hash is valid
$numeric_id = isValidMD5($user_id);
if ($numeric_id !== false) {
    // If user_id is 1, show FLAG2 from .env file
    if ($numeric_id == 1) {
        $env_file = file_get_contents('../.env');
        $lines = explode("}", $env_file);
        if (isset($lines[1])) {
            $is_admin = true;
            echo $lines[1] . "}";
        }
    }

    // Get user information from database
    $query = "SELECT * FROM users WHERE id = $numeric_id";
    $result = mysqli_query($conn, $query);

    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
?>
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Information</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background-color: #f0f0f0;
                }

                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background-color: white;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }

                .user-info {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }

                .nav-links {
                    margin-bottom: 20px;
                }

                .nav-links a {
                    color: #007bff;
                    text-decoration: none;
                    margin-right: 15px;
                }

                .nav-links a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>

        <body>
            <div class="container">
                <div class="nav-links">
                    <a href="dashboard.php">Dashboard</a>
                    <a href="logout.php">Logout</a>
                </div>

                <div class="user-info">
                    <h3>User Information</h3>
                    <p><strong>Username:</strong> <?php echo htmlspecialchars($user['username']); ?></p>
                    <p><strong>User ID:</strong> <?php echo htmlspecialchars($user['id']); ?></p>
                    <p><strong>Registration Date:</strong> <?php echo htmlspecialchars($user['created_at']); ?></p>
                </div>
                <?php if ($is_admin) { ?>
                    Welcome Admin!
                    Go to upload file page
                    <a href="secret-file-upload-123.php">Upload File</a>
                <?php } ?>
            </div>
        </body>

        </html>
<?php
    } else {
        echo "User not found";
    }
} else {
    echo "Invalid user ID";
}
?>