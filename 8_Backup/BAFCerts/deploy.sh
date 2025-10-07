#!/bin/bash
npm run build
pm2 start dist/index.js --name "bafCerts" --env PORT=$PORT
pm2 status
