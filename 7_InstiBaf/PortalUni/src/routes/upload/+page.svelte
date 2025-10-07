<script>
	import { MetaMaskStore } from '$lib';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { t } from '$lib/lang/translations';
	import { uploadCertificate } from '$lib/certificates';

	const { walletState } = MetaMaskStore();
	const toastStore = getToastStore();
	let userAddress = '';
	let certificate = '';
	let sharedSecret = '';

	const callUploadCertificate = async () => {
		console.log(certificate);
		uploadCertificate(userAddress, certificate, sharedSecret)
			.then((response) => {
				toastStore.trigger({
					message: `${response}`,
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
	<h1>{$t('home.upload_title')}: {$walletState.account}</h1>
	<div class="card p-4 m-2">
		<h2>{$t('home.upload_title')}</h2>
		<form on:submit={() => callUploadCertificate()}>
			<label class="label">
				<span>{$t('home.upload_address')}</span>
				<input
					class="input p-2"
					title={$t('home.upload_address_input')}
					type="text"
					placeholder="0x123ABC"
					bind:value={userAddress}
				/>
			</label>
			<label class="label">
				<span>{$t('home.upload_cert')}</span>
				<textarea
					class="textarea p-2"
					title={$t('home.upload_cert_input')}
					rows="10"
					placeholder={`{\n\t"name":"MyCertificate",\n\t"address":"0x123ABC",\n\t"code":"123ABCD"\n}`}
					bind:value={certificate}
				></textarea>
			</label>

			<label class="label mb-2">
				<span>{$t('home.upload_secret')}</span>
				<input
					class="input p-2"
					title={$t('home.upload_secret_input')}
					type="text"
					placeholder="123ABCD"
					bind:value={sharedSecret}
				/>
			</label>
			<button class="btn variant-filled">{$t('home.submit')}</button>
		</form>
	</div>
</div>
