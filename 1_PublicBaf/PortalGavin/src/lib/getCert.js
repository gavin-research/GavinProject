import { db_url } from './constants';
import { t } from '$lib/lang/translations';

/**
 * @param {string} userAddr
 * @param {string} certAddr
 * @param {string} signedMessage
 * @param {string} rawMessage
 * @returns
 */
export const getCert = async (userAddr, certAddr, signedMessage, rawMessage) => {
	const body = { signedMessage: signedMessage, rawMessage: rawMessage };

	const response = await fetch(`${db_url}/getCert?from=${userAddr}&certAddress=${certAddr}`, {
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
