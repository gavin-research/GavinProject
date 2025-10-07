import { db_url } from './constants';

/**
 * @param {string} userAddr
 * @param {string} certAddr
 * @param {string} signedMessage
 * @param {string} rawMessage
 * @returns
 */
const downloadCert = async (userAddr, certAddr, signedMessage, rawMessage) => {
	//Es necesario mandar el raw hasheado
	const body = { signedMessage: signedMessage, rawMessage: rawMessage };

	console.log('Body: ', body);

	const response = await fetch(`${db_url}/retrieveCert?from=${userAddr}&code=${certAddr}`, {
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
		return { data: 'Error en el envio' };
	}
};

/**
 * @param {string} data
 * @param {string} secret
 * @returns
 */
const decryptCert = (data, secret) => {
	const cert = data + secret;
	return cert;
};

export { downloadCert, decryptCert };
