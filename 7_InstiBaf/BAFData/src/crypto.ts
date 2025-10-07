import secp256k1 from "secp256k1";
import dotenv from "dotenv";
import { AES } from "crypto-js";

dotenv.config();

export const entityPrivateKey = process.env.ENTITY_PRIVATE_KEY || "";

const getUniPrivKey = () => {
  const private_key = entityPrivateKey;
  if (private_key == "") {
    throw "Entity private key missing";
  }

  //Se obtiene el valor despues del 0x
  const private_split = private_key.split("0x")[1];

  const priv_buff = Buffer.from(private_split, "hex");
  if (!secp256k1.privateKeyVerify(priv_buff)) {
    throw "Entity private key not valid";
  } else {
    return priv_buff;
  }
};

async function generateSharedSecret(userPubKey: string) {
  const uniPrivKey = getUniPrivKey();

  const userPubKeySplit = userPubKey.split("0x")[1];
  const userPubKeyHex = Buffer.from(userPubKeySplit, "hex");

  const shared = secp256k1.ecdh(userPubKeyHex, uniPrivKey);
  const sharedString = Buffer.from(shared).toString("hex");
  return sharedString;
}

async function encryptWithSharedSecret(data: string, secret: string) {
  // const msg = Buffer.from(data, "hex");
  // const secretBuff = Buffer.from(secret, "hex");

  return AES.encrypt(JSON.stringify(data), secret).toString();

  // const signedData = secp256k1.ecdsaSign(msg, secretBuff);

  // return {
  //   data: data,
  //   sign: signedData,
  //   secret: secret,
  // };
}

const signWithPrivKey = (root: string) => {
  try {
    const privBuff = getUniPrivKey();

    //Se hace sin comprimir por lo que la clave publica debe empezar por 0x04
    const pub_buff = secp256k1.publicKeyCreate(privBuff, false);
    const public_key = Buffer.from(pub_buff).toString("hex");
    const msg = Buffer.from(root, "hex");
    const signed = secp256k1.ecdsaSign(msg, privBuff);

    const signed_str = Buffer.from(signed.signature).toString("hex");

    return {
      data: root,
      sign: signed_str,
      public_key: public_key,
    };
  } catch (e) {
    console.error(e);
  }
  return "";
};

const verifyWithPublicKey = (
  data: string,
  sign: string,
  public_key: string,
) => {
  const msg = Buffer.from(data, "hex");
  const sig = Buffer.from(sign, "hex");
  const pub = Buffer.from(public_key, "hex");

  const verified = secp256k1.ecdsaVerify(sig, msg, pub);
  return verified;
};

function decryptWithSharedSecret(dataEncripted: string, secret: string) {
  const bytes = AES.decrypt(dataEncripted, secret);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

export { generateSharedSecret, signWithPrivKey, encryptWithSharedSecret };
