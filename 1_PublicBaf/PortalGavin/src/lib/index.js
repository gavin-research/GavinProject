import { writable } from 'svelte/store';
import { Web3 } from 'web3';

const getMetaMaskInstalled = () =>
	typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

const getLocalStorageState = () => {
	if (typeof window == 'undefined') {
		return {};
	}

	return JSON.parse(localStorage.getItem('walletState') || '{}');
};

export function MetaMaskStore() {
	const loaded = writable(false);
	const isMetamaskInstalled = writable(getMetaMaskInstalled());
	const walletState = writable(getLocalStorageState());

	const connect = async () => {
		if (!getMetaMaskInstalled()) {
			loaded.set(true);
			return;
		}

		const accountResponse = await window.ethereum?.request({
			method: 'eth_requestAccounts'
		});

		if (accountResponse && accountResponse.length && accountResponse[0]) {
			const account = accountResponse[0];
			const accountMixedCase = Web3.utils.toChecksumAddress(account);
			console.log('Wallet nueva para: ', accountMixedCase);
			walletState.set({ account: accountMixedCase });

			window.ethereum?.on('accountChanged', handleAccountChanged);
		}
	};

	const init = async () => {
		await connect();

		setTimeout(() => {
			loaded.set(true);
		}, 500);

		walletState.subscribe((state) => {
			if (typeof window != 'undefined') {
				window.localStorage.setItem('walletState', JSON.stringify(state));
			}
		});
	};

	/**
	 *
	 * @param {any} newAccounts
	 */
	const handleAccountChanged = (newAccounts) => {
		if (Array.isArray(newAccounts) && newAccounts.length > 0 && newAccounts[0] !== undefined) {
			const account = newAccounts[0];
			walletState.set({ account });
		} else {
			walletState.set({});
		}
	};

	/**
	 *
	 * @param {string} userAddress
	 * @param {string} content
	 * @param {boolean} checkPublic
	 * @return {Promise<string>}
	 */
	const signMessage = async (userAddress, content, checkPublic = false) => {
		// Es necesario que los datos esten hasheados
		let data = Web3.utils.sha3(content);
		if (checkPublic) {
			data = content;
		}

		let res = await window.ethereum?.request({
			method: 'personal_sign',
			params: [data, userAddress]
		});

		if (typeof res != 'string') {
			return '';
		} else {
			return res;
		}
	};

	return {
		isMetamaskInstalled,
		walletState,
		loaded,
		connect,
		signMessage,
		init
	};
}
