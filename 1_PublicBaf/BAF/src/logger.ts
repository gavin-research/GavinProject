import * as fs from "fs";
import { pinoHttp } from "pino-http";
import { CronJob } from "cron";
import { createHash } from "crypto";
import { HelperSigner } from "./signer";
import { Chains, sendEncodedTransaction } from "./ethereum";

class PinoLogger {
  private static rotateJob = new CronJob(
    "0 0 * * * *", // todos lod dias a las 00:00
    // "2 * * * * *", //cada 2 minutos
    function () {
      PinoLogger.rotate();
    }, // onTick
    null, // onComplete
    true,
    "utc", // timeZone
  );

  private static uploadChainJob = new CronJob(
    "0 0 * * 0", // domingo a las 00:00
    // "2 * * * * *", // cada 2 minutos
    function () {
      PinoLogger.upload();
    }, // onTick
    null, // onComplete
    true,
    "utc", // timeZone
  );

  static startDate = new Date();
  static startDateName = `${this.startDate.getFullYear()}-${this.startDate.getMonth()}-${this.startDate.getDate()}`;
  static logRoute = process.env.PORT || "./logs";

  static logger = pinoHttp({
    autoLogging: false,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: false,
        ignore: "pid,hostname",
        translateTime: "UTC:mm-dd-yyyy HH:MM:ss.l",
        destination: `${this.logRoute}/${this.startDateName}-info.log`,
      },
    },
  });

  private static rotate(): void {
    const now = new Date();

    const newDate = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    fs.renameSync(
      `${this.logRoute}/${this.startDateName}-info.log`,
      `${this.logRoute}/${newDate}-info.log`,
    );
    fs.copyFileSync(
      `${this.logRoute}/${newDate}-info.log`,
      `${this.logRoute}/${this.startDateName}-info.log`,
    );
    fs.writeFileSync(`${this.logRoute}/${newDate}-info.log`, "");

    getHash(`${this.logRoute}/${this.startDateName}-info.log`).then((hash) => {
      console.log("Hash creado: ", hash, " para dia: ", this.startDateName);
      fs.appendFileSync(
        `${this.logRoute}/resume.log`,
        `${this.startDateName}:${hash}`,
      );
    });

    this.startDateName = newDate;
    // this.logger = pinoHttp({
    //   autoLogging: false,
    //   transport: {
    //     target: "pino-pretty",
    //     options: {
    //       colorize: false,
    //       ignore: "pid,hostname",
    //       translateTime: "UTC:mm-dd-yyyy HH:MM:ss.l",
    //       destination: `${this.logRoute}/${newDate}-info.log`,
    //     },
    //   },
    // });
  }

  private static upload(): void {
    //Lee el resume.log con los hashes lo hashea y lo sube a una cadena
    const signer = HelperSigner.getInstance();
    getHash(`${this.logRoute}/resume.log`).then((hash) => {
      const tx = signer.contractInterfaceLogger.methods
        .setHash(this.startDateName, hash)
        .encodeABI();
      sendEncodedTransaction(tx, Chains.Logger);
    });
  }
}

const getHash = (path: String) =>
  new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const rs = fs.createReadStream(Buffer.from(path, "utf-8"));
    rs.on("error", reject);
    rs.on("data", (chunk) => hash.update(chunk));
    rs.on("end", () => resolve(hash.digest("hex")));
  });

export { PinoLogger };
