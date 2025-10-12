#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies for the root (backend)
npm install

# Install dependencies for the frontend
npm install --prefix frontend

# Build the frontend
npm run build --prefix frontend

# Run database migrations or other build steps for the backend
# (Add any backend-specific build commands here)
