#!/bin/bash

# This script helps set up Vercel environment variables from .env.local file

echo "Setting up environment variables on Vercel..."

# Array of environment variables
ENV_VARS=(
  "NEXT_PUBLIC_FIREBASE_API_KEY"
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  "NEXT_PUBLIC_FIREBASE_DATABASE_URL"
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  "NEXT_PUBLIC_FIREBASE_APP_ID"
  "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
)

# Loop through and add each environment variable
for var in "${ENV_VARS[@]}"; do
  echo "Adding $var to Vercel..."
  value=$(grep "^$var=" .env.local | cut -d '=' -f2-)
  if [ -n "$value" ]; then
    vercel env add "$var" production "$value"
  else
    echo "Warning: $var not found in .env.local"
  fi
done

echo "Environment setup complete! Please deploy your project again." 