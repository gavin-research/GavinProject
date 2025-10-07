<script>
	import { MetaMaskStore } from '$lib';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { t } from '$lib/lang/translations';
	import { createCertificate } from '$lib/certificates';

	const { walletState } = MetaMaskStore();
	const toastStore = getToastStore();
	let userAddress = '';
	let certAddress = '';
	let certCode = '';

	const callCreateCertificate = () => {
		createCertificate(certCode, certAddress, userAddress)
			.then((response) => {
				toastStore.trigger({
					message: response,
					background: 'variant-filled-primary'
				});
			})
			.catch((error) => {
				console.log(error);
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
		<h2>{$t('home.add_title')}</h2>
		<form on:submit={() => callCreateCertificate()}>
			<label class="label">
				<span>{$t('home.add_address')}</span>
				<input
					class="input p-2"
					title={$t('home.add_address_input')}
					type="text"
					placeholder="0x123ABC"
					bind:value={userAddress}
				/>
			</label>
			<label class="label">
				<span>{$t('home.add_cert_address')}</span>
				<input
					class="input p-2"
					title={$t('home.add_cert_address_input')}
					type="text"
					placeholder="0x123ABC"
					bind:value={certAddress}
				/>
			</label>

			<label class="label mb-2">
				<span>{$t('home.add_code')}</span>
				<input
					class="input p-2"
					title={$t('home.add_cert_code_input')}
					type="text"
					placeholder="123ABCD"
					bind:value={certCode}
				/>
			</label>
			<button class="btn variant-filled">{$t('home.submit')}</button>
		</form>
	</div>
</div>
