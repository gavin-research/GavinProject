import { baf_url } from './constants';
import { t } from '$lib/lang/translations';

/**
 * @param {string} userAddr
 * @param {string} certAddr
 * @param {string} signedMessage
 * @param {string} rawMessage
 * @param {string} entityAddr
 * @param {number} accessValue
 * @returns
 */
export const accessCert = async (
	userAddr,
	certAddr,
	signedMessage,
	rawMessage,
	entityAddr,
	accessValue
) => {
	const body = {
		rawMessage: rawMessage,
		signedMessage: signedMessage,
		entityAddr: entityAddr,
		accessValue: accessValue
	};

	console.log('Body: ', body);
	const response = await fetch(`${baf_url}/accessCert?from=${userAddr}&certAddress=${certAddr}`, {
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
		return { data: `${t.get('error.send')}` };
	}
};
