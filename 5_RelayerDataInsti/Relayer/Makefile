DOCKER_COMPOSE ?= docker compose
TRUFFLE ?= npx truffle
TEST_OPTS ?= --compile-none --migrate-none

# setup
.PHONY: run down
run: handshake relayer-start
down: relayer-stop network-down

# build
.PHONY: build build-contract build-relayer
build: build-local build-contract build-relayer

build-local:
	npm install

build-contract:
	@make -C ./contracts/uni install
	@make -C ./contracts/data install
	@make -C ./contracts/uni build
	@make -C ./contracts/data build

build-relayer:
	@make -C ./relayer/relayer build

# relayer
.PHONY: handshake relayer-start relayer-stop
handshake:
	./relayer/scripts/init-rly

relayer-start:
	./relayer/scripts/relayer-start

relayer-stop:
	./relayer/scripts/relayer-stop

sleep:
	sleep 5
