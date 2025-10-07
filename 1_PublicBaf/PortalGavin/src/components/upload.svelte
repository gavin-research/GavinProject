<script>
	import { FileDropzone } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { t } from '$lib/lang/translations';

	const toastStore = getToastStore();

	/**
	 * @param {Event} event - El evento de cambio del archivo de entrada.
	 */
	/** @type {boolean} */
	let persist = true;
	/** @type {string} */
	let fileName = '';

	/**
	 * @param {any} event
	 */
	function uploadFile(event) {
		const input = /** @type {HTMLInputElement} */ (event.target);
		const file = input.files?.[0];

		if (file) {
			const name = file.name;
			const reader = new FileReader();
			reader.onload = function (e) {
				try {
					const result = /** @type {string} */ (e.target?.result);
					let parsedData = JSON.parse(result);

					if (parsedData.certificate != undefined) {
						parsedData = parsedData.certificate;
					}

					(fileName = `${parsedData.address}` || name), JSON.stringify(parsedData);
					if (persist) {
						localStorage.setItem(fileName, JSON.stringify(parsedData));
					} else {
						sessionStorage.setItem(fileName, JSON.stringify(parsedData));
					}
					console.log('Archivo ', fileName);
					// alert('Archivo subido y guardado correctamente');
					toastStore.trigger({
						message: `${t.get('upload.ok')}`,
						background: 'variant-filled-primary'
					});
				} catch (error) {
					// alert('Error al parsear el JSON');
					toastStore.trigger({
						message: `${t.get('upload.error_json')}`,
						background: 'variant-filled-error'
					});
				}
			};

			//Se hace para comprobar que se ha guardado correctamente
			try {
				reader.readAsText(file);
			} catch (error) {
				toastStore.trigger({
					message: `${t.get('upload.error_file')}`,
					background: 'variant-filled-error'
				});
				// alert('Error al leer el archivo');
			}
		}
	}
	export { persist, fileName };
</script>

<!-- <div class="file-upload m-2" style="min-width: 50rem; justify-self: center;"> -->
<div class="file-upload m-2">
	<FileDropzone name="files" type="file" accept=".json" on:change={uploadFile}>
		<svelte:fragment slot="message">{$t('upload.upload')}</svelte:fragment>
	</FileDropzone>
</div>
