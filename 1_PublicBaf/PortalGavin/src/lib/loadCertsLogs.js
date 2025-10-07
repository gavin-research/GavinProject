import { baf_url } from './constants';

/**
 * @param {string} userAddr
 * @param {string} certAddr
 * @param {string} signedMessage
 * @param {string} rawMessage
 * @returns
 */
export const loadUserCertsLogs = async (userAddr, certAddr, signedMessage, rawMessage) => {
	// Esto en principio se hace de manera insegura
	// a la espera de tener una BBDD
	const body = { signedMessage: signedMessage, rawMessage: rawMessage };
	const response = await fetch(`${baf_url}/getAccess?from=${userAddr}&certAddress=${certAddr}`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	// const response = await fetch(`http://localhost:5173/api/certsData/${userAddr}/${certAddr}`);
	const data = await response.json();
	console.log(data);
	return {
		certificates: data.certificates,
		access: data.access
	};
};
