import { HelperSigner } from "./signer";

enum Chains {
  Main,
}

async function sendEncodedTransaction(
  encoded: string,
  chain: Chains = Chains.Main,
) {
  const signer = HelperSigner.getInstance();
  let web3 = signer.web3;

  console.log("Sending tx");
  const tcCount = await web3.eth.getTransactionCount(signer.address);

  const gasPrice = web3.utils.toWei("10", "gwei");

  const tx = {
    from: signer.address,
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

export { sendEncodedTransaction, Chains };
