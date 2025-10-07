<script>
	import '../app.postcss';

	import { MetaMaskStore } from '$lib';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { t } from '$lib/lang/translations';
	import { addCertificate } from '$lib/certificates';
	import { downloadObjectAsJson } from '$lib/utils';

	const { walletState } = MetaMaskStore();
	const toastStore = getToastStore();
	let userAddress = '';
	let certName = '';
	let certFields = [['', '']];
	let userPublicKey = '';

	const addField = () => {
		certFields.push(['', '']);
		certFields = certFields;
	};

	const removeField = () => {
		certFields.pop();
		certFields = certFields;
	};

	const callAddCertificate = () => {
		console.log('Campos a procesar:', certFields);
		addCertificate(certName, certFields, userAddress, userPublicKey)
			.then((response) => {
				toastStore.trigger({
					message: 'Ok',
					background: 'variant-filled-primary'
				});

				downloadObjectAsJson(response, response.certificate.name);
				console.log(response);
			})
			.catch((error) => {
				toastStore.trigger({
					message: error,
					background: 'variant-filled-error'
				});
			});
	};
</script>

<div class="p-4">
	<h1>{$t('home.title')}: {$walletState.account}</h1>
	<div class="card p-4 m-2">
		<h2>{$t('home.create_title')}</h2>
		<form on:submit={() => callAddCertificate()}>
			<label class="label">
				<span>{$t('home.create_address')}</span>
				<input
					class="input p-2"
					title={$t('home.create_address_input')}
					type="text"
					placeholder="0x123ABC"
					bind:value={userAddress}
				/>
			</label>
			<label class="label">
				<span>{$t('home.create_name')}</span>
				<input
					class="input p-2"
					title={$t('home.create_name_input')}
					type="text"
					placeholder={$t('home.create_placeholder_name')}
					bind:value={certName}
				/>
			</label>
			<label class="label">
				<span>{$t('home.create_upk')}</span>
				<input
					class="input p-2"
					title={$t('home.create_upk_input')}
					type="text"
					placeholder={$t('home.create_placeholder_upk')}
					bind:value={userPublicKey}
				/>
			</label>

			<div class="card p-2 m-2">
				<label class="label">
					<span>{$t('home.create_data')}</span>
					{#each certFields as field}
						<div class="flex">
							<input
								class="input p-2 m-1"
								placeholder={$t('home.create_placeholder_field')}
								type="text"
								bind:value={field[0]}
							/>
							<input
								class="input p-2 m-1"
								placeholder={$t('home.create_placeholder_value')}
								type="text"
								bind:value={field[1]}
							/>
						</div>
					{/each}
				</label>
				<div class="m-1" style="text-align: center;">
					<button type="button" class="btn variant-filled" on:click={() => addField()}>
						<iconify-icon class="icon-[mdi-light--home] text-2xl" icon="mdi:plus"></iconify-icon>
					</button>
					<button type="button" class="btn variant-filled" on:click={() => removeField()}>
						<iconify-icon class="icon-[mdi-light--home] text-2xl" icon="mdi:minus"></iconify-icon>
					</button>
				</div>
			</div>
			<button class="btn variant-filled">{$t('home.submit')}</button>
		</form>
	</div>
</div>
