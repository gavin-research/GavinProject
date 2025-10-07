import { baf_url } from './constants';
import { check } from './merkle';
import secp256k1 from 'secp256k1';
import { t } from '$lib/lang/translations';
import { Buffer } from 'buffer';

/**
 * @typedef {object}  sign
 * @property {string} data
 * @property {string} sign
 * @property {string} publicKey
 * @param {sign} sign
 * @returns
 */
const verify_root = (sign) => {
	try {
		console.log(sign);
		const data_buff = Buffer.from(sign.data, 'hex');
		const sign_buff = Buffer.from(sign.sign, 'hex');
		const publicKey_buff = Buffer.from(sign.publicKey, 'hex');

		console.log(secp256k1.ecdsaVerify(sign_buff, data_buff, publicKey_buff));

		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
};

/**
 * @param {string} signedRoot
 * @param {string} sessionKey
 * @returns
 */
export const checkCertWithStorage = (signedRoot, sessionKey) => {
	try {
		const proof = sessionStorage.getItem(sessionKey);

		if (proof == null) {
			throw `${t.get('error.no_cert_validation')}`;
		}

		const sign = JSON.parse(proof).sign;
		if (!verify_root(sign)) {
			throw `${t.get('error.sign_verification')}`;
		}

		const tree = JSON.parse(proof).challengeTree;
		const fields = JSON.parse(proof).fields;
		const salts = JSON.parse(proof).salts;
		const root = JSON.parse(proof).sign.data;
		// const entity = JSON.parse(proof).entity;
		return check(tree, root, fields, salts);
	} catch (e) {
		console.error(e);
		throw e;
		// return false;
	}
};

/**
 * @param {string} userAddr
 * @param {string} certAddr
 * @param {string} signedMessage
 * @param {string} rawMessage
 * @returns
 */
export const checkCert = async (userAddr, certAddr, signedMessage, rawMessage) => {
	// Este check cert es "tonto" en el sentido de que no puede verificar:
	// 1. La validez del certificado
	// 2. El contenido de los datos
	// 3. Si la entidad lo ha generado
	//
	// Solo sirve para ver que se tiene acceso a la dirección

	//Es necesario mandar el raw hasheado
	const body = { signedMessage: signedMessage, rawMessage: rawMessage };

	console.log('Body: ', body);

	const response = await fetch(`${baf_url}/checkCert?from=${userAddr}&certAddress=${certAddr}`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (response.status == 200) {
		const data = await response.json();

		return {
			data
		};
	} else {
		console.log('casi wey');
		return { data: `${t.get('error.send')}` };
	}
};
