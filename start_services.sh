#!/bin/sh

# Start backend in the background
cd /app/backend && npm run start &

nginx

# Keep the container running
tail -f /dev/null