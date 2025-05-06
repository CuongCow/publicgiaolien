#!/bin/bash

# Hiển thị phiên bản Node.js
echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"

# Cài đặt dependencies
echo "Installing root dependencies..."
npm install

# Build frontend
echo "Building frontend..."
cd client
npm install
npm run build
cd ..

# Cấu trúc thư mục sau khi build
echo "Directory structure after build:"
find . -type d -maxdepth 2 | sort

echo "Build completed successfully!" 