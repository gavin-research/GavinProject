import express, { Request, Response, Application } from "express";
import { body, query, validationResult } from "express-validator";
import dotenv from "dotenv";
import cors from "cors";
import { sendEncodedTransaction } from "./ethereum";
import { HelperSigner } from "./signer";
import { PinoLogger } from "./logger";
import { getStructFirmaValidacion } from "./helper";

dotenv.config();
const app: Application = express();
const port = process.env.PORT || 8000;
app.use(cors());
app.use(express.json());
app.use(PinoLogger.logger);

const signer = HelperSigner.getInstance();

//Funciones API
app.get("/", (req: Request, res: Response) => {
  req.log.info(`Hello world`);
  res.send("Welcome to the BAF API");
});

app.get("/blocks", (req, res) => {
  req.log.info(`Get blocks`);
  signer.web3.eth.getBlockNumber().then((lastBlock) => {
    const lbs = lastBlock.toString();
    res.send(lbs);
  });
});

app.post(
  "/accessCert",
  query("from").isString(),
  query("certAddress").isString(),
  body("signedMessage").isString(),
  body("rawMessage").isString(),
  body("entityAddr").isString(),
  body("accessValue").isNumeric(),
  async (req, res) => {
    req.log.info(`accesCert`);

    try {
      const verifier = validationResult(req);
      if (!verifier.isEmpty()) {
        res.status(400);
        res.send({ errors: verifier.array() });
        return;
      }

      const signedMessage = req.body.signedMessage;
      const rawMessage = req.body.rawMessage;
      const entityAddr = req.body.entityAddr;
      const accessValue = req.body.accessValue;
      const certAddress = req.query?.certAddress;
      const from = req.query?.from;

      const firmaValidacion = getStructFirmaValidacion(
        rawMessage,
        signedMessage,
      );

      const encoded = signer.contractInterface.methods
        .modifyAccess(
          // from,
          entityAddr,
          certAddress,
          firmaValidacion,
          accessValue,
        )
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
  "/checkCert",
  query("from").isString(),
  query("certAddress").isString(),
  body("signedMessage").isString(),
  body("rawMessage").isString(),
  async (req, res) => {
    req.log.info(`checkCert`);

    try {
      const verifier = validationResult(req);
      if (!verifier.isEmpty()) {
        res.status(400);
        res.send({ errors: verifier.array() });
        return;
      }

      const signedMessage = req.body.signedMessage;
      const rawMessage = req.body.rawMessage;
      const certAddress = req.query?.certAddress;
      const from = req.query?.from;

      const firmaValidacion = getStructFirmaValidacion(
        rawMessage,
        signedMessage,
      );

      const portIbc = "transfer";
      const channel = "channel-0";
      const timeoutHeight = 0;

      const encoded = signer.contractInterface.methods
        .sendTransfer(
          certAddress,
          from,
          {
            sourcePort: portIbc,
            sourceChannel: channel,
            timeoutHeight: timeoutHeight,
          },
          firmaValidacion,
        )
        .encodeABI();

      const block = await sendEncodedTransaction(encoded);
      let result: string | unknown = "No response";

      result = await signer.contractInterface.methods.balanceOf(from).call();

      res.status(200).json(result);
      return res;

      //Si el resultado esta vacio se esperan par de segundos
      // while (result == "") {
      //   result = await signer.contractInterface.methods.balanceOf(from).call();
      // }

      //Esto seria lo ideal con eventos pero no tira
      // await signer.contractInterface
      //   .getPastEvents("UserAccess", {
      //     filter: { from: from }, // Recuepra los eventos para el usuario que lo pidio
      //     fromBlock: block, //A partir del bloque donde se hizo la transaccion
      //     toBlock: "latest",
      //   })
      //   .then(function (events) {
      //     // Solo selecciono el ultimo evento por si hay varios del mismo usuariuo en el mismo bloque
      //     const lastEvent = events[events.length - 1];

      //     if (typeof lastEvent != "string") {
      //       console.log(JSON.stringify(lastEvent.returnValues));

      //       result = lastEvent.returnValues[1];
      //     }
      //   })
      //   .catch(function (error) {
      //     throw error;
      //   });

      //TODO: Esto no me gusta, quizas podemos lanzar un evento ?
      // let hash = await signer.contractInterface.methods.balanceOf(from).call();
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

app.post(
  "/getCerts",
  query("from").isString(),
  body("signedMessage").isString(),
  body("rawMessage").isString(),
  async (req, res) => {
    // getEntidades(address holder, FirmaValidacion calldata firma)
    try {
      const verifier = validationResult(req);
      if (!verifier.isEmpty()) {
        res.status(400);
        res.send({ errors: verifier.array() });
        return;
      }

      const signedMessage = req.body.signedMessage;
      const rawMessage = req.body.rawMessage;
      const from = req.query?.from;
      const firmaValidacion = getStructFirmaValidacion(
        rawMessage,
        signedMessage,
      );
      await sendEncodedTransaction(
        signer.contractInterface.methods.getAccessList(from).encodeABI(),
      );
      const encoded = signer.contractInterface.methods
        .getEntidades(from, firmaValidacion)
        .encodeABI();

      let result: unknown | string[] = [""];
      const block = await sendEncodedTransaction(encoded);

      await signer.contractInterface
        .getPastEvents("CertEntites", {
          filter: { from: from }, // Recuepra los eventos para el usuario que lo pidio
          fromBlock: block, //A partir del bloque donde se hizo la transaccion
          toBlock: "latest",
        })
        .then(function (events) {
          // Solo selecciono el ultimo evento por si hay varios del mismo usuariuo en el mismo bloque
          const lastEvent = events[events.length - 1];

          if (typeof lastEvent != "string") {
            console.log(JSON.stringify(lastEvent.returnValues));
            const certs = {
              certificates: lastEvent.returnValues[1],
              access: lastEvent.returnValues[2],
            };
            result = certs;
          }
        })
        .catch(function (error) {
          throw error;
        });

      res.status(200).json(result);

      return res;
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

app.get("/getNonce", query("from").isString(), async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
