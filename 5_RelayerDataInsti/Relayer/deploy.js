const { Web3 } = require("web3");
const fs = require("fs");
require("dotenv").config();

const PortTransfer = "transfer";
const MockClientType = "mock-client";

const mainSC = process.env.SCNAME || undefined;
const contractDir = process.env.SCDIR || undefined;

var { abi, bytecode } = JSON.parse(
  fs.readFileSync(`./contracts/${contractDir}/build/contracts/IBCClient.json`),
);
const abiClient = abi;
const bytecodeClient = bytecode;

var { abi, bytecode } = JSON.parse(
  fs.readFileSync(
    `./contracts/${contractDir}/build/contracts/IBCConnection.json`,
  ),
);
const abiConnection = abi;
const bytecodeConnection = bytecode;

var { abi, bytecode } = JSON.parse(
  fs.readFileSync(
    `./contracts/${contractDir}/build/contracts/IBCChannelHandshake.json`,
  ),
);
const abiChannel = abi;
const bytecodeChannel = bytecode;

var { abi, bytecode } = JSON.parse(
  fs.readFileSync(`./contracts/${contractDir}/build/contracts/IBCPacket.json`),
);
const abiPacket = abi;
const bytecodePacket = bytecode;

var { abi, bytecode } = JSON.parse(
  fs.readFileSync(
    `./contracts/${contractDir}/build/contracts/OwnableIBCHandler.json`,
  ),
);
const abiHandler = abi;
const bytecodeHandler = bytecode;

var { abi, bytecode } = JSON.parse(
  fs.readFileSync(`./contracts/${contractDir}/build/contracts/MockClient.json`),
);
const abiMock = abi;
const bytecodeMock = bytecode;

var { abi, bytecode } = JSON.parse(
  fs.readFileSync(`./contracts/${contractDir}/build/contracts/${mainSC}.json`),
);
const abiMainSC = abi;
const bytecodeMainSC = bytecode;

// Configuring the connection to an Ethereum node
const network = process.env.ETHEREUM_NETWORK;
const web3 = new Web3(
  new Web3.providers.HttpProvider(`${process.env.API_URL}`),
);

// Creating a signing account from a private key
const signer = web3.eth.accounts.privateKeyToAccount(
  "0x" + process.env.SIGNER_PRIVATE_KEY,
);
web3.eth.accounts.wallet.add(signer);

async function contractDeploy(
  abi,
  bytecode,
  input = undefined,
  gasMultiplier = 1,
) {
  const contract = new web3.eth.Contract(abi);
  const deployTx = contract.deploy({ data: bytecode, arguments: input });

  // console.log("Desplegando contrato:");
  try {
    const deployedContract = await deployTx
      .send({
        from: signer.address,
        // gas: (await deployTx.estimateGas()) * BigInt(gasMultiplier),
        gas: BigInt(10000000) * BigInt(gasMultiplier),
        gasPrice: 1000000000,
      })
      .once("transactionHash", (txhash) => {
        // console.log(`Mining deployment transaction ...`);
        // console.log(`https://${network}.etherscan.io/tx/${txhash}`);
      });

    // console.log(`Contract deployed at ${deployedContract.options.address}`);
    return deployedContract.options.address;
  } catch (e) {
    console.log("Error tx: ", e.message);
    if (
      e.message == "code couldn't be stored" ||
      e.message == "Returned error: replacement transaction underpriced" ||
      e.message ==
        "Returned error: INTERNAL_ERROR: could not replace existing tx"
    ) {
      // console.log("Gas to low, multiplying it by +1");
      return contractDeploy(abi, bytecode, input, ++gasMultiplier);
    } else {
      throw {
        name: "Contract could not be deployed ):",
        message: e,
      };
    }
  }
  // The contract is now deployed on chain!
}

async function callMethod(abi, contract) {
  const tx = {
    from: signer.address,
    to: contract.options.address,
    data: abi,
    value: "0",
    gasPrice: "153000000000",
  };
  const gas_estimate = await web3.eth.estimateGas(tx);
  tx.gas = gas_estimate;
  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    signer.privateKey,
  );
  // console.log("Raw transaction data: " + signedTx.rawTransaction);
  // Sending the transaction to the network
  const receipt = await web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .once("transactionHash", (txhash) => {
      // console.log(`Mining transaction ...`);
      // console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
  // The transaction is now on chain!
  // console.log(`Mined in block ${receipt.blockNumber}`);
}

async function main() {
  try {
    if (mainSC == undefined) {
      throw "Need to specify Smart Contract";
    }
    //Despliegue de contratos
    const clientAddr = await contractDeploy(abiClient, bytecodeClient);
    // const clientAddr = "0xF02569843952C6dE8a5f719114A9F34540FE81C7";
    console.log("Client deployed: ", clientAddr);

    const connectionAddr = await contractDeploy(
      abiConnection,
      bytecodeConnection,
    );
    // const connectionAddr = "0x321bDABc12d634FBA70c32914A594D3fDc42d3b7";
    console.log("Connection deployed: ", connectionAddr);

    const channelAddr = await contractDeploy(abiChannel, bytecodeChannel);
    // const channelAddr = "0x4FFb53D54D03Bda4c3dc3ac1606B2479fe097fe4";
    console.log("Channel deployed: ", channelAddr);

    const packetAddr = await contractDeploy(abiPacket, bytecodePacket);
    // const packetAddr = "0x7c76ff1fCB74af0f7Dc1E996c43e3Cb9ab1A6f98";
    console.log("Packet deployed: ", packetAddr);

    const handlerAddr = await contractDeploy(abiHandler, bytecodeHandler, [
      clientAddr,
      connectionAddr,
      channelAddr,
      packetAddr,
    ]);
    // const handlerAddr = "0x7Decb4b91C38BEecEF02704Ed031456b3349d79F";
    console.log("Handler deployed: ", handlerAddr);

    const mockAddr = await contractDeploy(abiMock, bytecodeMock, [handlerAddr]);
    // const mockAddr = "0x782a0E3bDaD4c5F3049132F39560Da2EABC4Aae2";
    console.log("Mock deployed: ", mockAddr);

    const mainAddr = await contractDeploy(abiMainSC, bytecodeMainSC, [
      handlerAddr,
    ]);
    // const miniAddr = "0x1a917947d099013b63E079da4a6c58aE9FC3a6E5";
    console.log(`${mainSC} deployed: `, mainAddr);

    //Una vez deployeados se hace el init
    const contract = new web3.eth.Contract(abiHandler, handlerAddr);

    // console.log("Contrato localizado");
    const bindPort_abi = contract.methods
      .bindPort(PortTransfer, mainAddr)
      .encodeABI();
    const registerClient_abi = contract.methods
      .registerClient(MockClientType, mockAddr)
      .encodeABI();

    await callMethod(bindPort_abi, contract);
    await callMethod(registerClient_abi, contract);

    console.log("Handler: ", handlerAddr);
    console.log(`${mainSC}: `, mainAddr);

    if (mainSC == "SCVolcado") {
      const port = "transfer";
      const channel = "channel-0";
      const timeoutHeight = 0;
      //Direccion de SCStorage (no se usa)
      const receiverOtherChain = "0x2456631Faa408fE34636D88D03D1CeA5F598c89B";
      const contract = new web3.eth.Contract(abiMainSC, mainAddr);
      const setcomm_abi = contract.methods
        .setCommParams(receiverOtherChain, port, channel, timeoutHeight)
        .encodeABI();
      await callMethod(setcomm_abi, contract);
    }

    console.log("END");
  } catch (e) {
    console.log(e);
  }
}

main();
