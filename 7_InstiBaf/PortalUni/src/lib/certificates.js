import { baf_url, db_url } from './constants';
import { getNonceDB } from './nonce';
import { MetaMaskStore } from '$lib';
import { AES } from 'crypto-js';
import { get } from 'svelte/store';

const { walletState, signMessage } = MetaMaskStore();

/**
 * @param {String} name
 * @param {String[][]} data
 * @param {String} userAddr
 * @param {String} userPublicKey
 */
async function addCertificate(name, data, userAddr, userPublicKey) {
	// console.log(name);
	// console.log('Data:', data);

	const fields = Object.fromEntries(data);

	const body = { name: name, data: fields, userPublicKey: userPublicKey };
	const response = await fetch(`${baf_url}/generateMerkle?from=${userAddr}`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	const certificate = await response.json();
	return certificate;
}

/**
 * @param {String} address
 * @param {String} code
 * @param {String} userAddr
 */
async function createCertificate(address, code, userAddr) {
	// console.log(address);
	// console.log(code);

	const body = { certificate: address, code: code };

	const response = await fetch(`${baf_url}/addCertificate?from=${userAddr}`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	const block = await response.json();

	return block;
}

/**
 * @param {String} userAddress
 * @param {String} certificate
 * @param {String} secret
 */
async function uploadCertificate(userAddress, certificate, secret) {
	// console.log(address);
	// console.log(code);
	let block = 0;
	const currentWalletState = get(walletState);
	const account = currentWalletState.account;

	const signedCert = AES.encrypt(JSON.stringify(certificate), secret).toString();

	getNonceDB(account).then((nonce) => {
		console.log('Nonce actual:', nonce.data);
		signMessage(account, nonce.data.toString()).then(async (token) => {
			console.log('Token firmado: ', token);
			const body = {
				cid: certificate,
				signedCert: signedCert,
				signedMessage: token,
				rawMessage: nonce.data.toString()
			};
			const response = await fetch(`${db_url}/uploadCert?from=${userAddress}`, {
				method: 'POST',
				body: JSON.stringify(body),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			block = await response.json();
		});
	});

	return block;
}

export { addCertificate, createCertificate, uploadCertificate };
