# Use Node.js alpine as base image
FROM node:alpine

# Set working directory
WORKDIR /app

# Install Nginx
RUN apk add --no-cache nginx && mkdir -p /run/nginx

# Copy and install backend dependencies
COPY ./backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source
COPY ./backend ./backend

# Copy and install frontend dependencies
COPY ./client/package*.json ./frontend/
RUN cd frontend && npm install

# Copy frontend source
COPY ./client ./frontend

# Build frontend
RUN cd frontend && npm run build

# Copy Nginx configuration
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose ports (if needed)
EXPOSE 80

# Copy startup script
COPY ./start_services.sh /start_services.sh
RUN chmod +x /start_services.sh

# Start services
CMD ["/start_services.sh"]
