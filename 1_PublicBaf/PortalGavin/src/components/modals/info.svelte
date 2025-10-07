<script>
	/** @import { SvelteComponent } from 'svelte' */

	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { loadLocalCert } from '$lib/loadCerts';
	import { t } from '$lib/lang/translations';

	// import Actions from '../actions.svelte';

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
	console.log(certAddress);
	// const userAddress = $modalStore[0].meta.userAddress;
	const certFields = loadLocalCert(certAddress);

	let info = [];
	let fields = [];

	console.log('Campos: ', certFields);
	if (certFields != undefined) {
		info.push(`Name: ${certFields['name']}`);
		info.push(`Date: ${certFields['date']}`);
		info.push(`Root: ${certFields['root']}`);

		console.log('Informacion: ', info);

		for (let key in certFields.data) {
			fields.push(`${key}: ${certFields.data[key]}`);
		}
	} else {
		fields.push(t.get('info.noData'));
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div style="overflow-wrap: anywhere" class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? ''}</header>

		<article>{$modalStore[0].body ?? ''}</article>

		<p>{$t('info.certificate')} {certAddress}</p>
		<ul class="list">
			{#each info as entry}
				<li>{entry}</li>
			{/each}
		</ul>

		<h3>{$t('info.data')}</h3>
		<div class="card p-4" style="overflow-wrap: anywhere">
			<ol class="list">
				{#each fields as entry}
					<li><span>{entry}</span></li>
				{/each}
			</ol>
		</div>

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
				>{$t('info.close')}</button
			>
		</footer>
	</div>
{/if}
