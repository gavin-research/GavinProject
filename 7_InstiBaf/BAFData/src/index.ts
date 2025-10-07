import express, { Request, Response, Application } from "express";
import { body, query, validationResult } from "express-validator";
import dotenv from "dotenv";
import cors from "cors";
import { sendEncodedTransaction } from "./ethereum";
import { randomBytes } from "node:crypto";
import { HelperSigner } from "./signer";
import { generate } from "./merkleTree";
import {
  encryptWithSharedSecret,
  generateSharedSecret,
  signWithPrivKey,
} from "./crypto";
import { uploadDB, getDBNonce } from "./db";

dotenv.config();
const app: Application = express();
const port = process.env.PORT || 8000;
app.use(cors());
app.use(express.json());

const signer = HelperSigner.getInstance();

//Funciones API
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the BAF Data API");
});

app.get("/blocks", (req, res) => {
  signer.web3.eth.getBlockNumber().then((lastBlock) => {
    const lbs = lastBlock.toString();
    res.send(lbs);
  });
});

//DEPRECATED
//En principio se pide el nonce directamente a BAFBBBD
//Recupera el nonce de la cadena asociada a la BBDD
// app.get("/nonceDB", query("from").isString(), async (req, res) => {
//   try {
//     const verifier = validationResult(req);
//     if (!verifier.isEmpty()) {
//       res.status(400);
//       res.send({ errors: verifier.array() });
//       return;
//     }
//     const from = req.query?.from;
//     const nonce = await getDBNonce(from);
//     res.send(nonce);
//   } catch (error) {
//     console.error("Error al procesar la solicitud:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// });

//Sube certificado al sistema
app.post(
  "/addCertificate",
  body("certificate").isString(),
  body("code").isString(),
  query("from").isString(),
  async (req, res) => {
    try {
      const verifier = validationResult(req);
      if (!verifier.isEmpty()) {
        res.status(400);
        res.send({ errors: verifier.array() });
        return;
      }

      const certificate = req.body.certificate;
      //const code = signer.web3.utils.utf8ToHex(req.body.code);
      const code = req.body.code;
      const holder = req.query?.from;

      console.log("AddCertData: ", certificate, code, holder);

      const encoded = signer.contractInterface.methods
        .addCertificate(holder, certificate, code)
        .encodeABI();

      const result = await sendEncodedTransaction(encoded);

      res.status(200).json(result);
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

app.post(
  "/addIssuer",
  body("address").isString(),
  body("name").isString(),
  async (req, res) => {
    try {
      const verifier = validationResult(req);
      if (!verifier.isEmpty()) {
        res.status(400);
        res.send({ errors: verifier.array() });
        return;
      }

      const address = req.body.address;
      const name = req.body.name;

      // function addIssuer(address issuerAddy, string memory issuerName) external {
      const encoded = signer.contractInterface.methods
        .addIssuer(address, name)
        .encodeABI();

      const result = await sendEncodedTransaction(encoded);

      res.status(200).json(result);
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

//Interactura con el BAF de BD para subir certificado al backup
//Se podria hacer llamando al BAFBBBD pero se quiere mantener el secreto en la maquina local
app.post(
  "/uploadCertificateDB",
  query("from").isString(),
  body("certificate").isObject(),
  body("sharedSecret").isString(),
  body("signedMessage").isString(),
  body("rawMessage").isString(),
  async (req, res) => {
    try {
      const verifier = validationResult(req);
      if (!verifier.isEmpty()) {
        res.status(400);
        res.send({ errors: verifier.array() });
        return;
      }

      const holder = req.query?.from;
      const certificate = req.body.certificate;
      const secret = req.body.sharedSecret;
      const signedMessage = req.body.signedMessage;
      const rawMessage = req.body.rawMessage;

      const resultAsString = JSON.stringify(certificate);
      const cypherData = await encryptWithSharedSecret(resultAsString, secret);

      //TODO: Subir a la BBDD
      uploadDB(holder, certificate.code, cypherData, signedMessage, rawMessage);
      // uploadSCAuthAccess(code, certSalt);

      res.status(200).json("Ok");
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

//Genera certificado y secreto compartido
app.post(
  "/generateMerkle",
  query("from").isString(),
  body("data").isObject(),
  body("userPublicKey").isString(),
  body("name").isString(),
  body("date").optional().isDate(),
  async (req, res) => {
    try {
      const verifier = validationResult(req);
      if (!verifier.isEmpty()) {
        res.status(400);
        res.send({ errors: verifier.array() });
        return;
      }

      const fields = req.body.data;
      const userPublicKey = req.body.userPublicKey;
      const name = req.body.name;
      const holder = req.query?.from;
      let date = req.body.date;

      if (date == undefined) {
        const newDate = new Date();
        date = `${newDate.getFullYear()}-${newDate.getMonth()}-${newDate.getDate()}`;
      }

      const { tree, salts } = generate(fields);
      const root = tree[tree.length - 1][0];
      // console.log(tree, salts);

      //Se firma la raiz
      const sign = signWithPrivKey(root);

      //Se genera secreto para encriptar
      const shared = await generateSharedSecret(userPublicKey);
      console.log(shared);

      const result = {
        sharedSecret: shared,
        certificate: {
          name: name,
          date: date,
          holder: holder,
          userPublicKey: userPublicKey,
          root: root, //Esto es certificate / root firmada
          address: `0x${randomBytes(32).toString("hex")}`, //TODO: Mejorar generacion código (hex - 64)
          data: fields,
          sign: sign,
          salts: salts,
        },
      };

      //TODO: anadir cypher y clave pública del usuario

      res.status(200).json(result);
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
