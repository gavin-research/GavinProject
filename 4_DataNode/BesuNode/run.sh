#!/bin/bash
# create log folders with the user permissions so it won't conflict with container permissions
# mkdir -p logs/besu logs/quorum data

echo "*************************************"
echo "Gavin Run"
echo "*************************************"
echo "Start network"
echo "--------------------"

if [ -f "docker-compose-deps.yml" ]; then
    echo "Starting dependencies..."
    docker compose -f docker-compose-deps.yml up --detach
    sleep 60
fi

echo "Starting network..."
docker compose build --pull
docker compose up --detach
