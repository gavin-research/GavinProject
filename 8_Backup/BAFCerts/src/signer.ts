import { Web3 } from "web3";
import dotenv from "dotenv";
dotenv.config();
class HelperSigner {
  static #instance: HelperSigner;
  web3;
  // web3Logger;
  // contractInterfaceLogger;
  contractInterface;
  publicKey;
  privateKey;

  public static getInstance() {
    if (!HelperSigner.#instance) {
      HelperSigner.#instance = new HelperSigner();
    }

    return HelperSigner.#instance;
  }

  private constructor() {
    if (HelperSigner.#instance) {
      throw new Error("This class is a Singleton!");
    }

    // Initialize the class properties here

    try {
      const fs = require("fs");
      const abi = JSON.parse(fs.readFileSync(process.env.CONTRACT_ABI)).abi;
      // const abi_logger = JSON.parse(
      //   fs.readFileSync(process.env.LOG_CONTRACT_ABI),
      // ).abi;

      this.web3 = new Web3(process.env.RPC_SERVER || "localhost:7545");
      this.contractInterface = new this.web3.eth.Contract(
        abi,
        process.env.CONTRACT_ADDRESS || "0x11111",
      );
      // this.web3Logger = new Web3(
      //   process.env.LOG_RPC_SERVER || "localhost:7545",
      // );
      // this.contractInterfaceLogger = new this.web3.eth.Contract(
      //   abi_logger,
      //   process.env.LOG_CONTRACT_ADDRESS || "0x11111",
      // );
      //TODO: Pendiente de ver si se recupera por variables de entorno o como hacemos
      this.publicKey =
        process.env.PUBLIC_KEY || "0xEca8bB9Be63164Ff5b9F1e0a3a6fC8b369E8455F";
      this.privateKey =
        process.env.PRIVATE_KEY ||
        "0x1dc0fb343a76df8cdf3857cc5e5e47d8836562a3b9c09650e7c2ded8c00d9bf4";
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

export { HelperSigner };
