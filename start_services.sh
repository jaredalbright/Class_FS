#!/bin/sh

# Start backend in the background
cd /app/backend && npm run start &

# Function to check if backend is ready
check_backend() {
    curl --silent --fail localhost:8000/health || return 1
    return 0
}

# Wait for the backend to become ready
echo "Waiting for backend to start..."
while ! check_backend; do
    sleep 5
    echo "Waiting for backend..."
done
echo "Backend started."

# Now start Nginx in the background
nginx

# Keep the container running
tail -f /dev/null