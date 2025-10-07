<script>
	import '../app.postcss';

	import { MetaMaskStore } from '$lib';
	import { afterUpdate, onMount } from 'svelte';
	import { loadUserCerts } from '$lib/loadCerts';
	import { getNonce } from '$lib/nonce';
	import Actions from '../components/actions.svelte';
	import UploadFile from '../components/upload.svelte';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { t } from '$lib/lang/translations';

	const toastStore = getToastStore();
	const { walletState, signMessage } = MetaMaskStore();

	/**
	 * @typedef {object}  userData
	 * @property {string | undefined} name
	 * @property {string | undefined} date
	 * @property {string} address
	 * @property {endpoints| undefined} endpoints
	 * @typedef {object} endpoints
	 * @property {string} download
	 * @property {string} access
	 * @property {string} log
	 */

	/**@type Array<userData>*/
	let tableArr = Array();
	let accessArr = Array();

	onMount(() => {
		if (tableArr[0] == undefined) {
			const userAddress = $walletState.account;

			getNonce(userAddress).then((nonce) => {
				console.log('Nonce actual:', nonce.data);
				signMessage(userAddress, nonce.data.toString()).then((token) => {
					console.log('Token firmado: ', token);

					loadUserCerts(userAddress, token, nonce.data.toString()).then((res) => {
						console.log('Data loaded:', res.certificates);
						if (res != undefined) {
							tableArr = res.certificates;
							accessArr = res.access;

							if (accessArr.length != tableArr.length) {
								// alert('Problemas con los accessos');
								toastStore.trigger({
									message: $t('common.error_access'),
									background: 'variant-filled-error'
								});
							}
						}
					});
				});
			});

			tableArr.pop();
		}
	});

	//Revisar se carga multiples vceces
	afterUpdate(() => {});
</script>

<div class="p-4">
	<h2 class="h2 m-1">{$t('home.title')}</h2>
	<div class="table-container">
		<table class="table table-hover" style="overflow-wrap: anywhere">
			<thead>
				<tr>
					<th></th>
					<th>{$t('home.table_name')}</th>
					<th>{$t('home.table_date')}</th>
					<th>{$t('home.table_actions')}</th>
				</tr>
			</thead>
			<tbody>
				{#each tableArr as row, i}
					{#if row !== undefined}
						<tr>
							<td style="vertical-align: middle;">{i}</td>
							<td style="word-wrap: break-word; max-width: 20vw;vertical-align: middle;"
								>{row.name || row.address}</td
							>
							<td style="vertical-align: middle;">{row.date || $t('home.no_data')}</td>
							<td>
								<!-- url={row.endpoints.download } -->
								<Actions
									action="download"
									userAddress={$walletState.account}
									certAddress={row.address}
								></Actions>
								<Actions
									action="access"
									title="{$t('home.certificate')} {row.name || row.address}"
									certAddress={row.address}
									userAddress={$walletState.account}
									accessList={accessArr[i]}
								></Actions>
								<Actions
									action="info"
									title="{$t('home.info')} {row.name || row.address}"
									userAddress={$walletState.account}
									certAddress={row.address}
								></Actions>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>

	<div class="p-4">
		<h3 class="h3">{$t('home.upload')}</h3>
		<UploadFile />
	</div>
</div>
