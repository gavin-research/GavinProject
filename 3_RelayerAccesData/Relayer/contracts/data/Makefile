.PHONY: build2
build:
	npm run compile
	cp ./node_modules/@hyperledger-labs/yui-ibc-solidity/build/contracts/* ./build/contracts

.PHONY: install
install:
	npm install

.PHONY: proto
proto:
ifndef SOLPB_DIR
	$(error SOLPB_DIR is not specified)
else
	. ./scripts/solpb.sh
endif
