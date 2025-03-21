<?php
require_once 'config.php';

// Function to decode base64 and get search query
function getSearchQuery() {
    if (isset($_GET['q'])) {
        $encoded = $_GET['q'];
        $decoded = base64_decode($encoded);
        $data = json_decode($decoded, true);
        return isset($data['query']) ? $data['query'] : '';
    }
    return '';
}

$search_query = getSearchQuery();
$products = [];

// SQL Injection vulnerability
if ($search_query) {
    $query = "SELECT * FROM products WHERE name LIKE '%$search_query%' OR description LIKE '%$search_query%' OR category LIKE '%$search_query%'";
    $result = mysqli_query($conn, $query);
} else {
    $query = "SELECT * FROM products";
    $result = mysqli_query($conn, $query);
}

while ($row = mysqli_fetch_assoc($result)) {
    $products[] = $row;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YZT Products Challenge</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f0f0f0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .search-form {
            margin: 20px 0;
            text-align: center;
        }
        .search-input {
            width: 50%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        .search-button {
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        .search-button:hover {
            background-color: #0056b3;
        }
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .product-card {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            background-color: white;
        }
        .product-card h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .product-card p {
            margin: 5px 0;
            color: #666;
        }
        .product-price {
            font-weight: bold;
            color: #28a745;
        }
        .product-category {
            color: #6c757d;
            font-size: 0.9em;
        }
        .nav-links {
            text-align: center;
            margin-top: 20px;
        }
        .nav-links a {
            color: #007bff;
            text-decoration: none;
            margin: 0 10px;
        }
        .nav-links a:hover {
            text-decoration: underline;
        }
    </style>
    <script>
        function encodeSearchQuery() {
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value;
            const data = { query: query };
            const encoded = btoa(JSON.stringify(data));
            window.location.href = '?q=' + encoded;
            return false;
        }
    </script>
</head>
<body>
    <div class="container">
        <h1>Welcome to YZT Products Challenge</h1>
        
        <div class="search-form">
            <form onsubmit="return encodeSearchQuery()">
                <input type="text" id="search-input" class="search-input" placeholder="Search products..." value="<?php echo htmlspecialchars($search_query); ?>">
                <button type="submit" class="search-button">Search</button>
            </form>
        </div>

        <div class="products-grid">
            <?php foreach ($products as $product): ?>
                <div class="product-card">
                    <h3><?php echo htmlspecialchars($product['name']); ?></h3>
                    <p><?php echo htmlspecialchars($product['description']); ?></p>
                    <p class="product-price">$<?php echo number_format($product['price'], 2); ?></p>
                    <p class="product-category"><?php echo htmlspecialchars($product['category']); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</body>
</html> 