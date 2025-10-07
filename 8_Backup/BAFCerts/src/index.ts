import express, { Request, Response, Application } from "express";
import { body, query, validationResult } from "express-validator";
import dotenv from "dotenv";
import cors from "cors";
import { getCert, uploadCert } from "./db";
import { HelperSigner } from "./signer";
import { sendEncodedTransaction } from "./ethereum";
import { getStructFirmaValidacion } from "./helper";

dotenv.config();
const app: Application = express();
const port = process.env.PORT || 8000;
app.use(cors());
app.use(express.json());

const signer = HelperSigner.getInstance();

//Funciones API
app.get("/", async (req: Request, res: Response) => {
  const dbData = await getCert("test02");
  // await uploadCert(
  //   "test03",
  //   '{\n\t"name": "Titulacion",\n\t"date": "2024-9-25",\n\t"holder": "0xEca8bB9Be63164Ff5b9F1e0a3a6fC8b369E8455F",\n\t"data": { "name": "Gavin", "age": 20, "tittle": "Graduado" },\n\t"sign": {\n\t\t"msg": "be761c5c21f2fbe229785f0312c1c25c2c6327bf10f6d2e808b6a1ad6c20bb3f",\n\t\t"sign": "a411481cef5a000861bf165051358ea217314c827b8f6b231495676897e0ffcc3a57c693f4adaa050591e662fe46fdce5d6593be47c9c28c3fef874ab2d834d1",\n\t\t"publicKey": "04aabbf1c2b7401d6fbd5764d10198070720fcde9970537196d83c2c0a538b6f9eeb0da187eb8410a34bae5a1373b0c348d7d738ba9cbf9654ef20098331d8b484"\n\t},\n\t"root": "be761c5c21f2fbe229785f0312c1c25c2c6327bf10f6d2e808b6a1ad6c20bb3f",\n\t"code": "0xf73910ddb3e35a2db69926e7d422df45a52751d09bc99ceaed08ed2dd497930e",\n\t"address": "0xf73910ddb3e35a2db69926e7d422df45a52751d09bc99ceaed08ed2dd497930e",\n\t"salts": [\n\t\t"4YiEEgpRVkIWlB2VUfZQsU16toQdat38VQ5SzWY3RVCumGMj5up/mxfabpCbKgaDqF736hY29QBhe4yDZwL+Z/TIIh1lm3/q/yuFzBzCbSiUeLS7eMyWfVnGDWwfBynTcl+V61jDf/eWcHppwugYu0KTEUQEUx4TjMjLvXmnfMQpkRhqlcHZ6mDQHceDuAh8fSLCe1i30jg5n9CHwC4tThC4xKb3NKkkgycCwStPadE1V75Pq//7JExbEVgH9vj+R6CyuUaBg1ACL7LME8TZyUZR4maA18+rQiS6fxBK6gG52/b5MkeHClNHpetfM/mqOSMafaEJZHaYDIj6w7lKcQ==",\n\t\t"3p1C06MJFLBEM0LH1ZdU8FdcijabnS4MfGBjgWgW9KNKIBGHe5h8AO3Lfg5gyc49/NGa+zi1J3BQ/U2ZpJKbFBIrXMH0sHdRT/NIBu3QHVkmclx/XpLEMm0okl3XiopnqqBp/XqbGORklAVdS4G34vR5sbweUigct4VfmEJnkUVBDy8HGVtFC8MGuTg7JOK3OPxe+oFUbPXHDqcm3iPxvhK1PVqb0HvDewEFnPmBjVLkQeZY274hT+NAP2ggx/1G/eck8bx/FdJJy8SXTo72QosRYtFPMxN3Q+PkhEFdH9RAU3kok7AzMsmJ7bvtTMUbEmTNQPewsXwWUbHpz+0Tqw==",\n\t\t"CYu1CmInvMfSZBjv1wbxE7oXym5/q7xjCgpzVtxVKumNf5iWumQ4XvnH+NKAy+DejMGCZXaWZOH/HlWeqJJmuqN02hLsxPRBcn7Z3QVqa6HSGZ7SZnyhYOCOmhIgkMUixt40RjlSdBODy2uQJcOynJOy+AjU4B/gpAE2qAVadjpWMqZwRT8fMX7XFGdJCg10ODg6YlwUqTU5bfYDjUdceZLJodiqZITlDGFjgacYAPBRyupDlIPVEl/H/3eGIaq6b89SZQhLB8A8wGKDOOA2Oql5aYVckAWpf6cy1eKT7xQUxBujb3BDyZQGvOPoNNbH9MZOxGRo6EC6+LD3mcPJ3g==",\n\t\t"w7hi+VCgtCafYh/tyg82GXrz+X+0vgN9h6g/U3xHV104A1KvhT2KiyjQVixjUj0ozU5sFACQ/qr4t7ducjGOjSNX8nFEyO3NbHlsCgAhq3qhuMLJBwu997HyiLmtXHP+IV2t3oyp1LQoQ+fnl+dD+aUUwm1zFhxPgv169sR3IoBho2Rm5v94PH8uUautyLOvKilJxMhag2mMxn6xHZ5CbZr0iNnLmPKzPeL84KEnhUAjInSIO9W6qOfone379Sp7YdiDAmTGPL9o4dobMXWa4stJWoHffMbM9FKTvj7OGRfLptDRx/jKQDjrlU5QJEa1qCRO0E8g9gGoYBf1G18QjA=="\n\t]\n}\n',
  // );
  res.send(`Welcome to the BAF Data API: ${JSON.stringify(dbData)}`);
});

app.get("/nonce", query("from").isString(), async (req, res) => {
  try {
    const verifier = validationResult(req);
    if (!verifier.isEmpty()) {
      res.status(400);
      res.send({ errors: verifier.array() });
      return;
    }

    const from = req.query?.from;

    const result = await signer.contractInterface.methods.getNonce(from).call();

    console.log("Resultado del nonce", result);

    res.status(200).json(Number(result));
    return res;
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.post(
  "/retrieveCert",
  query("from").isString(),
  query("code").isString(),
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
      const code = req.query?.code;
      const signedMessage = req.body.signedMessage;
      const rawMessage = req.body.rawMessage;

      const firmaValidacion = getStructFirmaValidacion(
        signedMessage,
        rawMessage,
      );
      const encoded = signer.contractInterface.methods
        .getCertificateID(holder, code, firmaValidacion)
        .encodeABI();

      const block = await sendEncodedTransaction(encoded);
      let cid: unknown | string = "";

      //Recupero evento emitido
      await signer.contractInterface
        .getPastEvents("GotCertificateID", {
          filter: { from: holder }, // Recuepra los eventos para el usuario que lo pidio
          fromBlock: block, //A partir del bloque donde se hizo la transaccion
          toBlock: "latest",
        })
        .then(function (events) {
          // Solo selecciono el ultimo evento por si hay varios del mismo usuariuo en el mismo bloque
          const lastEvent = events[events.length - 1];

          if (typeof lastEvent != "string") {
            console.log(JSON.stringify(lastEvent.returnValues));
            const res = {
              //(msg.sender, coderegid[code], code)
              from: lastEvent.returnValues[1],
              cid: lastEvent.returnValues[1],
              code: lastEvent.returnValues[2],
            };
            cid = res.cid;
          }
        })
        .catch(function (error) {
          throw error;
        });

      if (typeof cid != "string") {
        throw "Error recuperando evento";
      }
      const cert = await getCert(cid);
      const result = JSON.parse(cert);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

app.post(
  "/retrieveAllCerts",
  query("from").isString(),
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
      const signedMessage = req.body.signedMessage;
      const rawMessage = req.body.rawMessage;

      const firmaValidacion = getStructFirmaValidacion(
        signedMessage,
        rawMessage,
      );
      const encoded = signer.contractInterface.methods
        .getAllCertificateID(holder, firmaValidacion)
        .encodeABI();

      const block = await sendEncodedTransaction(encoded);
      let allCid: unknown | string[] = [""];

      //Recupero evento emitido
      await signer.contractInterface
        .getPastEvents("GotAllCertificateID", {
          filter: { from: holder }, // Recuepra los eventos para el usuario que lo pidio
          fromBlock: block, //A partir del bloque donde se hizo la transaccion
          toBlock: "latest",
        })
        .then(function (events) {
          // Solo selecciono el ultimo evento por si hay varios del mismo usuariuo en el mismo bloque
          const lastEvent = events[events.length - 1];

          if (typeof lastEvent != "string") {
            console.log(JSON.stringify(lastEvent.returnValues));
            const res = {
              //(msg.sender, coderegid[code], code)
              from: lastEvent.returnValues[1],
              cids: lastEvent.returnValues[2],
            };
            allCid = res.cids;
          }
        })
        .catch(function (error) {
          throw error;
        });

      if (!Array.isArray(allCid)) {
        throw "Error recuperando evento";
      }

      let certs = [];
      for (let cid in allCid) {
        const cert = await getCert(cid);
        certs.push(cert);
      }
      const result = JSON.parse(certs.toString());
      res.status(200).json(result);
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

//Funcion encargada de subir certificados a la base de datos y al la cadena
app.post(
  "/uploadCert",
  query("from").isString(),
  body("cid").isString(),
  body("signedCert").isString(),
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
      const cid = req.body.cid;
      const signedCert = req.body.signedCert;
      const signedMessage = req.body.signedMessage;
      const rawMessage = req.body.rawMessage;

      await uploadCert(cid, signedCert);

      //Una vez subido el certificado a la base de datos, se registra en la cadena
      const firmaValidacion = getStructFirmaValidacion(
        rawMessage,
        signedMessage,
      );
      const encoded = signer.contractInterface.methods
        .setCertificatesID(cid, holder, firmaValidacion)
        .encodeABI();

      const result = await sendEncodedTransaction(encoded);

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
