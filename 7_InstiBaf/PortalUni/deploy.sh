#!/bin/bash

if [ -z "$PORT" ]; then
  echo "Variable PORT no disponible, pruebe con PORT=3000 y ejecute de nuevo"
  exit 1
fi

pm2 start build/index.js --name "portalUni" --env PORT=$PORT
pm2 status
