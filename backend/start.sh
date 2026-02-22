#!/bin/sh

echo "Running database migrations..."
if npx prisma migrate deploy; then
  echo "Migrations applied successfully."
else
  echo "migrate deploy failed. Falling back to db push..."
  npx prisma db push || echo "db push also failed. Continuing startup..."
fi

echo "Starting server..."
exec node dist/index.js
