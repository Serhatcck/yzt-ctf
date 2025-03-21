#!/bin/bash
touch .env
export FLAG1="YZT_FLAG1{$(head -c 8 /dev/urandom | md5sum | cut -d ' ' -f1)}"
export FLAG2="YZT_FLAG2{$(head -c 8 /dev/urandom | md5sum | cut -d ' ' -f1)}"
export FLAG3="YZT_FLAG3{$(head -c 8 /dev/urandom | md5sum | cut -d ' ' -f1)}"

echo "$FLAG1 \n" > .env
echo "$FLAG2 \n " >> .env
echo "$FLAG3 \n" >> .env


mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" << EOF
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default users
INSERT INTO users (username, password) VALUES
('admin', '$2y$10$nWfotf5xzlRE5uQ3jJu6i.86SW52viqcpsHykWXrGl1.UIzb0AZdi'),
('user-1', '$2y$10$nWfotf5xzlRE5uQ3jJu6i.86SW52viqcpsHykWXrGl1.UIzb0AZdi'),
('user-2', '$2y$10$nWfotf5xzlRE5uQ3jJu6i.86SW52viqcpsHykWXrGl1.UIzb0AZdi');

-- Create flags table
CREATE TABLE IF NOT EXISTS flags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flag_name VARCHAR(50) NOT NULL UNIQUE,
    flag_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert flags from environment variables
INSERT INTO flags (flag_name, flag_value) VALUES
('flag1', '$FLAG1')
ON DUPLICATE KEY UPDATE flag_value = VALUES(flag_value);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dummy products
INSERT INTO products (name, description, price, category) VALUES
('Laptop Pro X', 'High-performance laptop with latest specs', 1299.99, 'Electronics'),
('Smartphone Y', 'Latest smartphone with advanced features', 899.99, 'Electronics'),
('Wireless Headphones', 'Premium wireless headphones with noise cancellation', 199.99, 'Accessories'),
('Smart Watch Z', 'Fitness tracking smartwatch with heart rate monitor', 299.99, 'Wearables'),
('Tablet Plus', '10-inch tablet with retina display', 499.99, 'Electronics'),
('Gaming Mouse', 'RGB gaming mouse with programmable buttons', 79.99, 'Gaming'),
('Mechanical Keyboard', 'RGB mechanical keyboard with Cherry MX switches', 129.99, 'Gaming'),
('External SSD', '1TB external SSD with USB 3.0', 159.99, 'Storage'),
('Webcam HD', '1080p HD webcam with noise-canceling mic', 49.99, 'Accessories'),
('Power Bank', '20000mAh power bank with fast charging', 39.99, 'Accessories');
EOF 