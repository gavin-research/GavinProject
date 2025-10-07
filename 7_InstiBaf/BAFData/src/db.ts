import dotenv from "dotenv";
dotenv.config();

//Las llamadas se hacen directas ya que el BAFDB solo actua como api de consulta para minimizar riesgos
const DB_API = process.env.DB_SERVER || "";

async function uploadDB(
  from: string,
  cid: string,
  signedCert: string,
  signedMessage: string,
  rawMessage: string,
) {
  //Llama directamente a API
  const response = await fetch(`${DB_API}/uploadCert?from=${from}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cid, signedCert, signedMessage, rawMessage }),
  });
  return response.json();
}

async function getDBNonce(from: string) {
  const response = await fetch(`${DB_API}/nonce?from=${from}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

export { uploadDB, getDBNonce };
