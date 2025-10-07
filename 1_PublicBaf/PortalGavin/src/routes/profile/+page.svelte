<script>
	import { MetaMaskStore } from '$lib';
	import { checkCert, checkCertWithStorage } from '$lib/checkCert';
	import { getCert } from '$lib/getCert';
	import { getNonce, getNonceDB } from '$lib/nonce';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { ethers } from 'ethers';
	import { clipboard } from '@skeletonlabs/skeleton';
	import 'iconify-icon';
	// import { Web3 } from 'web3';

	import UploadFile from '../../components/upload.svelte';
	import { t } from '$lib/lang/translations';
	// /** @type {import('./$types').PageData} */
	// export let data;

	const toastStore = getToastStore();
	const { walletState, signMessage } = MetaMaskStore();
	const formData = {
		address: ''
	};

	let signedRoot = '';
	var fileName = '';
	let userPublicKey = '';
	// let message = '';
	// for (let i = 0; i < sessionStorage.length; ++i) {
	// 	console.log(sessionStorage.key(i));
	// }
	//

	function checkCertificate() {
		console.log('Comprobando :', fileName);
		const certAddress = formData.address;
		const userAddress = $walletState.account;

		// if (
		// 	checkCertWithStorage(
		// 		'8d75551017905682f1deb32be65167a9baa1a5d1d9bd6d18d5b3307779f51748',
		// 		fileName
		// 	)
		// ) {
		// 	alert('Certificado verificado correctamente');
		// } else {
		// 	alert('Problemas con la prueba de verificación');
		// }

		getNonce(userAddress).then((nonce) => {
			// console.log('Nonce actual:', nonce.data);
			signMessage(userAddress, nonce.data.toString()).then((token) => {
				// console.log('Token firmado: ', token);

				//Se ve si se tiene acceso al certificado
				checkCert(userAddress, certAddress, token, nonce.data.toString())
					.then((res) => {
						// console.log('Verificado con resultado: ', JSON.stringify(res));
						//En caso de tener acceso se prueba a verificar con los almacenados
						if (res.data == 'NO ACCESS TO CERTIFICATION') {
							signedRoot = $t('profile.no_access');
							throw $t('common.error_no_access');
						} else {
							signedRoot = res.data;
							// 'f479b80bb0172faed557a2073bd8c5082364cd4b53cd76ef87e30dd711497c6';
						}

						if (checkCertWithStorage(signedRoot, fileName)) {
							toastStore.trigger({
								message: $t('common.success_verify'),
								background: 'variant-filled-primary'
							});
						} else {
							throw $t('common.error_verify');
						}
					})
					.catch(function (e) {
						toastStore.trigger({ message: e, background: 'variant-filled-error' });
					});
			});
		});

		// console.log('Direccion a comprobar: ', certAddress);
	}

	function getCertificateFromDB() {
		const certAddress = formData.address;
		const userAddress = $walletState.account;
		getNonceDB(userAddress).then((nonce) => {
			signMessage(userAddress, nonce.data.toString()).then((token) => {
				getCert(userAddress, certAddress, token, nonce.data.toString())
					.then((res) => {
						if (res.data != undefined) {
							console.log(res.data);
						} else {
							throw $t('common.error_verify');
						}
					})
					.catch(function (e) {
						toastStore.trigger({ message: e, background: 'variant-filled-error' });
					});
			});
		});
	}

	function getUserPublicKey() {
		console.log('User Pk');

		const userAddress = $walletState.account;
		const message = 'pk';
		console.log('UserAddr:', userAddress);
		signMessage(userAddress, message, true).then((sign) => {
			console.log('Firma:', sign);
			const messageHash = ethers.hashMessage(message);
			// const messageHash = Web3.utils.sha3(message);

			const publicKey = ethers.SigningKey.recoverPublicKey(messageHash, sign);
			console.log('PK:', publicKey);
			userPublicKey = publicKey;
		});
	}
	// toastStore.trigger({ message: message, background: 'variant-filled-warning' });
</script>

<div class="p-4">
	<h2 class="h2 ml-2">{$t('profile.title')}</h2>

	<div class="card p-4 m-2">
		<p style="line-height: 3rem; height: 3rem;">
			{$t('profile.account')}
			{$walletState.account}
			<button class="btn-icon p-0 m-0" use:clipboard={$walletState.account}>
				<iconify-icon class="icon" icon="mdi-content-copy" />
			</button>
		</p>
	</div>
	<!-- <form class="form border border-surface-500 p-4 space-y-4 rounded-container-token m-4"> -->
	<div class="card p-4 m-2">
		<label class="label m-1">
			<span>{$t('profile.cert_address')}</span>
			<input class="input p-2" type="text" bind:value={formData.address} placeholder="0x0AB1..." />
		</label>

		<button class="btn variant-filled m-1" on:click={checkCertificate}
			>{$t('profile.cert_proof')}</button
		>
		<button class="btn variant-filled m-1" on:click={getCertificateFromDB}
			>{$t('profile.cert_db')}</button
		>

		{#if signedRoot != ''}
			<div style="display: flex; height: 4rem;">
				<p class="pre bg-surface-700 mt-2 mb-2">{signedRoot}</p>
				<button class="btn-icon p-0 m-0" use:clipboard={signedRoot}>
					<iconify-icon class="icon" icon="mdi-content-copy" />
				</button>
			</div>
		{/if}
	</div>

	<div class="card p-4 m-2" style="display: block;">
		{#if userPublicKey != ''}
			<div style="display: flex;">
				<pre class="pre bg-surface-700 mt-2 mb-2">{userPublicKey}</pre>
				<button class="btn-icon p-0 m-0" use:clipboard={userPublicKey}>
					<iconify-icon class="icon" icon="mdi-content-copy" />
				</button>
			</div>
		{/if}
		<button class="btn variant-filled" on:click={getUserPublicKey}
			>{$t('profile.user_public_key')}</button
		>
	</div>

	<div class="p-4">
		<h2 class="h3">{$t('profile.upload')}</h2>
		<UploadFile persist={false} bind:fileName />
	</div>
	<!-- </form> -->
</div>
