import { Web3 } from "web3";
import dotenv from "dotenv";
dotenv.config();
class HelperSigner {
  static #instance: HelperSigner;
  web3;
  contractInterface;
  address;
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
      this.web3 = new Web3(process.env.RPC_SERVER || "localhost:7545");
      this.contractInterface = new this.web3.eth.Contract(
        abi,
        process.env.CONTRACT_ADDRESS || "0x11111",
      );
      this.address =
        process.env.ADDRESS || "0xEca8bB9Be63164Ff5b9F1e0a3a6fC8b369E8455F";
      this.privateKey =
        process.env.PRIVATE_KEY ||
        "0x1dc0fb343a76df8cdf3857cc5e5e47d8836562a3b9c09650e7c2ded8c00d9bf4";
    } catch (e) {
      throw e;
    }
  }
}

export { HelperSigner };
