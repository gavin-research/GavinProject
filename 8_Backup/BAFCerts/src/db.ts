import dotenv from "dotenv";
import mariadb from "mariadb";

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  connectionLimit: 5,
});

async function getCert(cid: string) {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("Conexion creada");

    const cert = await conn.query(
      "SELECT * FROM `gavin_certs`.`certificates` WHERE cid=?",
      [cid],
    );

    return cert[0];
  } finally {
    if (conn) conn.release(); //release to pool
  }
}

async function uploadCert(cid: string, code: string) {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("Conexion creada");

    await conn.query(
      "INSERT INTO `gavin_certs`.`certificates` (cid, code) VALUES (?, ?)",
      [cid, code],
    );
  } finally {
    if (conn) conn.release(); //release to pool
  }
}

export { getCert, uploadCert };
