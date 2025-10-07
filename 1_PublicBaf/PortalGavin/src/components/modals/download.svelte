<script>
	/** @import { SvelteComponent } from 'svelte' */

	// Stores
	import { MetaMaskStore } from '$lib';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { t } from '$lib/lang/translations';
	import { downloadObjectAsJson } from '$lib/utils';
	import { getNonce } from '$lib/nonce';
	import { downloadCert, decryptCert } from '$lib/dbApi';

	const { signMessage } = MetaMaskStore();
	// Props
	/** Exposes parent props to this component. */
	/**
	 * @type SvelteComponent
	 */
	export let parent;

	const modalStore = getModalStore();

	//Acceder a la URL
	$modalStore[0].meta.url;
	const certAddress = $modalStore[0].meta.certAddress;
	const userAddress = $modalStore[0].meta.userAddress;

	//TODO: Descargar bien el certificado
	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	let secret = '';
	// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	async function download() {
		//Tiene que descargar algo aqui no se el que muy bien
		// return fetch(`http://localhost:5173/api/retrieveCert/${userAddress}/${certAddress}`);
		//Signed Message y rawMessage pendientes

		getNonce(userAddress).then((nonce) => {
			console.log('Nonce actual:', nonce.data);
			signMessage(userAddress, nonce.data.toString()).then((token) => {
				console.log('Token firmado: ', token);

				downloadCert(userAddress, certAddress, token, nonce.data.toString()).then((res) => {
					const cert = decryptCert(res.data, secret);
					downloadObjectAsJson(certAddress, cert);
				});
			});
		});
	}
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div style="overflow-wrap: anywhere" class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? ''}</header>

		<article>{$modalStore[0].body ?? ''}</article>

		<label class="label m-1">
			<span>{$t('access.share_secret')}</span>
			<input class="input p-2" type="text" bind:value={secret} placeholder="0x0AB1..." />
		</label>

		<button on:click={download}>
			{$t('download.pdf')} <iconify-icon icon="mdi:download"> </iconify-icon>
		</button>

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>Cancelar</button>
		</footer>
	</div>
{/if}
