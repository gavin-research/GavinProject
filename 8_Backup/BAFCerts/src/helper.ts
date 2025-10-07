import { Web3 } from "web3";

export const getStructFirmaValidacion = (raw: string, firma: string) => {
  const r = firma.slice(0, 66);
  const s = "0x" + firma.slice(66, 130);
  const v = parseInt(firma.slice(130, 132), 16);

  return {
    _hashCodeCert: Web3.utils.soliditySha3(raw),
    _r: r,
    _s: s,
    _v: v,
  };
};
