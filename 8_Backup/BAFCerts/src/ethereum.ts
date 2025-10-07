import { HelperSigner } from "./signer";

async function sendEncodedTransaction(encoded: string, isLog = false) {
  const signer = HelperSigner.getInstance();
  let web3 = signer.web3;
  // if (isLog) {
  //   web3 = signer.web3Logger;
  // }

  console.log("Sending tx");
  const tcCount = await web3.eth.getTransactionCount(signer.publicKey);

  // const estGas = await AccessContract.methods
  //   .sendTransfer(certAddress, from, portIbc, channel, timeoutHeight)
  //   .estimateGas();
  // console.log("Estimated gas: ", estGas);
  const gasPrice = web3.utils.toWei("10", "gwei");

  const tx = {
    from: signer.publicKey,
    to: signer.contractInterface.options.address,
    data: encoded,
    nonce: tcCount,
    gas: "1000000",
    gasPrice: gasPrice,
  };

  let blockhash = 0;

  await web3.eth.accounts
    .signTransaction(tx, signer.privateKey)
    .then(async (signed) => {
      await web3.eth
        .sendSignedTransaction(signed.rawTransaction)
        .on("transactionHash", (hash) => {
          console.log("Transaction Hash:", hash);
        })
        .then(async (value) => {
          console.log("Transaccion completada");
          blockhash = Number(value.blockNumber);
        });
    });

  return blockhash;
}

export { sendEncodedTransaction };
