#!/bin/bash

#export PORT=3030

if [ -z "$PORT" ]; then
  echo "Variable PORT no disponible, pruebe con PORT=3030 y ejecute de nuevo"
  exit 1
fi

pm2 start build/index.js --name "portalGavin" --env PORT=$PORT
pm2 status
