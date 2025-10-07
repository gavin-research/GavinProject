<script>
	/** @import { SvelteComponent } from 'svelte' */

	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { t } from '$lib/lang/translations';

	// Props
	/** Exposes parent props to this component. */
	/**
	 * @type SvelteComponent
	 */
	export let parent;

	const modalStore = getModalStore();

	//Acceder a la URL
	$modalStore[0].meta.url;
	// const certAddress = $modalStore[0].meta.certAddress;
	// const userAddress = $modalStore[0].meta.userAddress;

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';

	function download() {
		//Tiene que descargar algo aqui no se el que muy bien
		// return fetch(`http://localhost:5173/api/certsData/${userAddress}/${certAddress}/pdf`);
	}
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div style="overflow-wrap: anywhere" class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? ''}</header>

		<article>{$modalStore[0].body ?? ''}</article>

		<button on:click={download}>
			{$t('download.pdf')} <iconify-icon icon="mdi:download"> </iconify-icon>
		</button>

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>Cancelar</button>
		</footer>
	</div>
{/if}
