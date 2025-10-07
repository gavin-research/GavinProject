#!/bin/bash
#export PORT=3000
npm run build
pm2 start dist/index.js --name "baf" --env PORT=$PORT
pm2 status
