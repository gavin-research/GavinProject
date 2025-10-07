<script>
	// import type { SvelteComponent } from 'svelte';
	/** @import { SvelteComponent } from 'svelte' */
	import { accessCert } from '$lib/modifyCert';
	import { loadLocalCert } from '$lib/loadCerts';
	import { generate } from '$lib/merkle';
	import { getNonce } from '$lib/nonce';
	// import Actions from '../actions.svelte';
	import { MetaMaskStore } from '$lib/index';
	import { t } from '$lib/lang/translations';

	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	// Props
	/** Exposes parent props to this component. */
	/**
	 * @type SvelteComponent
	 */
	export let parent;

	const modalStore = getModalStore();
	const { signMessage } = MetaMaskStore();
	let share = false;
	let allSelected = false;
	let thirdPartyAccess = false;
	let denyAccess = false;

	const certAddress = $modalStore[0].meta.certAddress;
	const userAddress = $modalStore[0].meta.userAddress;
	const accessList = $modalStore[0].meta.accessList;
	const certFields = loadLocalCert(certAddress);
	/**
	 * @type string[]
	 */
	let fieldsSelected;
	/**
	 * @type string[]
	 */
	let accessAddress = [];
	/**
	 * @type string[]
	 */
	let accessType = [];
	const accessMap = [
		t.get('access.access_lvl_not_registered'),
		t.get('access.access_lvl_total'),
		t.get('access.access_lvl_partial'),
		t.get('access.access_lvl_thirds'),
		t.get('access.access_lvl_denied')
	];
	// Form Data
	const formData = {
		entityAddress: ''
	};

	console.log('Lista de acceso para certificado: ', accessList);

	let index = 1;
	for (let accesGroup in accessList) {
		for (let e of accessList[accesGroup]) {
			accessAddress.push(e);
			accessType.push(accessMap[index]);
		}
		index++;
	}
	accessAddress = accessAddress;
	accessType = accessType;
	console.log(accessAddress, accessType);

	const selectAll = () => {
		if (allSelected == false) {
			allSelected = true;
			fieldsSelected = Object.keys(certFields.data);
		} else {
			allSelected = false;
			fieldsSelected = [];
		}
	};

	const selectPartial = () => {
		allSelected = false;
	};

	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit() {
		if (share || denyAccess) {
			let accessValue = 1;
			if (denyAccess) {
				accessValue = 4;
			} else if (thirdPartyAccess) {
				accessValue = 3;
			} else if (certFields != undefined) {
				if (!allSelected) {
					accessValue = 2;
				}
				let data = generate(certFields.data, fieldsSelected, certFields.salts);

				//Añadimos metadatos
				//TODO: anadir metadatos nuevos para el cifrado
				if (data == undefined) {
					throw 'Fallo generacion arbol';
				}
				data.name = certFields.name;
				data.holder = certFields.holder;
				data.date = certFields.date;
				data.sign = certFields.sign;

				const dataStr =
					'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, undefined, 2));
				const downloadAnchorNode = document.createElement('a');
				downloadAnchorNode.setAttribute('href', dataStr);
				downloadAnchorNode.setAttribute(
					'download',
					`${certAddress}-challenge-${formData.entityAddress}.json`
				);
				document.body.appendChild(downloadAnchorNode); // required for firefox
				downloadAnchorNode.click();
				downloadAnchorNode.remove();
			}

			getNonce(userAddress).then((nonce) => {
				console.log('Nonce actual:', nonce.data);
				signMessage(userAddress, nonce.data.toString()).then((token) => {
					console.log('Token firmado: ', token);
					accessCert(
						userAddress,
						certAddress,
						token,
						nonce.data.toString(),
						formData.entityAddress,
						accessValue
					).then((res) => {
						console.log('Certificado Modificado', res.data);
					});
				});
			});

			modalStore.close();
		}
		// if ($modalStore[0].response) $modalStore[0].response(formData);
		console.log('Certificado: ', certAddress);
		console.log('Usuario: ', userAddress);

		share = true;
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div style="overflow-wrap: anywhere" class="modal-example-form {cBase}">
		<header class={cHeader}>
			{$modalStore[0].title ?? ''}
		</header>

		<article>{$modalStore[0].body ?? ''}</article>
		{#if !share}
			<!-- Enable for debugging: -->
			<form class="modal-form {cForm}">
				<label class="label">
					<span>{$t('access.share_address')}</span>
					<input
						class="input p-2"
						type="text"
						bind:value={formData.entityAddress}
						placeholder="0x0AB1..."
					/>
				</label>
			</form>

			<!-- <p>Lista de accesos para {certAddress}</p> -->

			<div class="flex table-container">
				<table class="table table-hover m-1 table-compact">
					<thead>
						<tr>
							<th style="text-align: left;">{$t('access.info_entity')}</th>
							<th style="text-align: left;">{$t('access.info_access')}</th>
							<th style="text-align: left;">{$t('access.info_action')}</th>
						</tr>
					</thead>
					<tbody>
						{#each accessAddress as a, index}
							<tr>
								<td>{a}</td>
								<td>{accessType[index]}</td>
								<td>
									<button
										class="m-1 text-xl"
										on:click={() => {
											(share = true), (formData.entityAddress = a);
											return;
										}}
									>
										<iconify-icon icon="mdi:pencil"></iconify-icon>
									</button>
									<button
										class="m-1 text-xl"
										on:click={() => {
											(share = true), (denyAccess = true), (formData.entityAddress = a);
											return;
										}}
									>
										<iconify-icon icon="mdi:delete"></iconify-icon>
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else if certFields == undefined && !denyAccess}
			<p>{$t('access.share_no_fields')}</p>
		{:else if !denyAccess}
			<h2>{$t('access.share_fields')} {formData.entityAddress}</h2>

			<span style="display: flex; align-items: center;">
				<input
					style="margin-right: 0.5rem;"
					type="checkbox"
					class="checkbox"
					bind:checked={thirdPartyAccess}
				/>
				<p>{$t('access.share_3rd_party_access')}</p>
			</span>
			<span style="display: flex; align-items: center;">
				<input
					style="margin-right: 0.5rem;"
					type="checkbox"
					class="checkbox"
					on:click={selectAll}
					checked={allSelected}
					disabled={thirdPartyAccess}
				/>
				<p>{$t('access.share_all')}</p>
			</span>

			{#each Object.entries(certFields.data) as [key, value]}
				<span style="display: flex; align-items: center;">
					<input
						style="margin-right: 0.5rem;"
						type="checkbox"
						class="checkbox"
						bind:group={fieldsSelected}
						value={key}
						on:click={selectPartial}
						disabled={thirdPartyAccess}
					/>
					<p>{key}:{value}</p>
				</span>
			{/each}
		{:else}
			<p>{$t('access.deny_confirmation')}</p>
		{/if}

		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
		{#if !denyAccess}
		  <button class="btn {parent.buttonPositive}" on:click={onFormSubmit} disabled={formData.entityAddress == ''}>{$t('access.add')}</button>
		{:else}
		  <button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>{$t('access.deny')}</button>
		{/if}
		<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{$t('access.cancel')}</button>
		</footer>
	</div>
{/if}
