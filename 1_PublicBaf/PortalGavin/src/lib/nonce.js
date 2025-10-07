import { baf_url } from './constants';
import { db_url } from './constants';
import { t } from '$lib/lang/translations';

/**
 * @param {string} userAddr
 * @returns
 */
const getNonce = async (userAddr) => {
	const response = await fetch(`${baf_url}/getNonce?from=${userAddr}`, {
		method: 'GET'
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

/**
 * @param {string} userAddr
 * @returns
 */
const getNonceDB = async (userAddr) => {
	const response = await fetch(`${db_url}/getNonce?from=${userAddr}`, {
		method: 'GET'
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

export { getNonce, getNonceDB };
