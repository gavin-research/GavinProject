import { baf_url } from './constants';

/**
 * @param {string} certAddr
 * @returns
 */
export const loadLocalCert = (certAddr) => {
	const cert = localStorage.getItem(certAddr);
	if (cert != null) {
		const parsedCert = JSON.parse(cert);
		return parsedCert;
	}
	return undefined;
};

/**
 * @param {string} userAddr
 * @param {string} signedMessage
 * @param {string} rawMessage
 * @returns
 */
export const loadUserCerts = async (userAddr, signedMessage, rawMessage) => {
	const body = { signedMessage: signedMessage, rawMessage: rawMessage };
	const response = await fetch(`${baf_url}/getCerts?from=${userAddr}`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	// const response = await fetch(`http://localhost:5173/api/certsData/${userAddr}/${certAddr}`);
	const data = await response.json();
	console.log(data);
	const certificates = data.certificates;
	const access = data.access;

	/**
	 * @typedef {object}  userData
	 * @property {string | undefined} name
	 * @property {string | undefined} date
	 * @property {string} address
	 * @property {string[]} salts
	 * @property {endpoints | undefined} endpoints
	 * @typedef {object} endpoints
	 * @property {string} download
	 * @property {string} access
	 * @property {string} log
	 */
	/**@type Array<userData>*/
	let res = Array();
	certificates.map((/** @type {string} */ address) => {
		const cert = localStorage.getItem(address);
		if (cert != null) {
			const parsedCert = JSON.parse(cert);
			console.log(parsedCert);
			res.push(parsedCert);
		} else {
			console.log(address);
			res.push({
				name: undefined,
				date: undefined,
				address: address,
				endpoints: undefined,
				salts: []
			});
		}
	});

	return { certificates: res, access };
};
