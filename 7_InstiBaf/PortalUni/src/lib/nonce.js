import { db_url } from './constants';

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
		return { data: 'Error en el envio' };
	}
};

export { getNonceDB };
