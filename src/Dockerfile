FROM php:8.2-apache

# Install mysqli extension
RUN docker-php-ext-install mysqli

# Create uploads directory and set permissions
RUN mkdir -p /var/www/html/admin/uploads && \
    chown -R www-data:www-data /var/www/html/admin/uploads && \
    chmod -R 777 /var/www/html/admin/uploads

# Copy application files
COPY . /var/www/html/

# Set proper permissions for all files
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

# Enable Apache modules
RUN a2enmod rewrite
