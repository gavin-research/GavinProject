<script>
	import { getModalStore } from '@skeletonlabs/skeleton';

	/** @type {string} */
	let title = '';
	/** @type {string} */
	let action = '';

	//Valores para interactuar
	/** @type {Array<Array<String>>} */
	let accessList = [];
	/** @type {string} */
	let certAddress = '0x0';
	/** @type {string} */
	let userAddress = '0x0';

	const modalStore = getModalStore();

	/** @type {import("@skeletonlabs/skeleton").ModalSettings}*/
	const modal = {
		type: 'component',
		component: action,
		// Data
		title: title,
		meta: { accessList, certAddress, userAddress }
	};

	const activar = () => {
		modalStore.trigger(modal);
	};

	export { title, accessList, action, userAddress, certAddress };
</script>

<button class="btn-icon" on:click={activar}>
	{#if action == 'download'}
		<iconify-icon icon="mdi:download"></iconify-icon>
	{/if}
	{#if action == 'access'}
		<iconify-icon icon="mdi:share"></iconify-icon>
	{/if}
	{#if action == 'info'}
		<iconify-icon icon="mdi:form"></iconify-icon>
	{/if}
	{#if action == 'fields'}
		<iconify-icon icon="mdi:form"></iconify-icon>
	{/if}
</button>
