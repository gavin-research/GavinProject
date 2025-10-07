<script>
	import '../app.postcss';
	import { AppShell, AppBar, Modal, Toast, RadioItem, RadioGroup } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import 'iconify-icon';
	import { t } from '$lib/lang/translations';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import Download from '../components/modals/download.svelte';
	import { browser } from '$app/environment';
	import { MetaMaskStore } from '$lib';
	import { onMount } from 'svelte';

	const { walletState, isMetamaskInstalled, loaded, connect, init } = MetaMaskStore();

	onMount(() => {
		init();
	});

	// import GavinCabecera from '../../static/GavinCabecera.png';
	export let data;
	let langVal = 0;
	if (data.lang == 'es') {
		langVal = 1;
	}
	// /** @type {{ data: import('./$types').PageData }} */
	// let { data } = $props();
	const modalRegistry = {
		download: { ref: Download }
	};

	async function changeLang() {
		if (browser) {
			let langStr = 'en';
			if (langVal == 1) {
				langStr = 'es';
			}

			localStorage.setItem('lang', langStr);
			await goto(window.location.pathname, { invalidateAll: true });
			console.log('nueva lang:', localStorage.getItem('lang'));
		}
		return;
	}

	$: langVal, changeLang();
	initializeStores();
</script>

<Modal components={modalRegistry}></Modal>
<Toast />
<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar background="dark:variant-filled-secondary variant-filled-primary">
			<svelte:fragment slot="lead">
				<img src="GavinCabecera.png" class="mr-5" alt="logo" style="filter: invert(100%)" />
				<strong class="text-xl uppercase">UNI Portal</strong>
			</svelte:fragment>
			<a href="/" class="btn bg-initial" data-sveltekit-preload-data="hover"
				>{$t('common.nav_add')}</a
			>
			<a href="/create" class="btn bg-initial" data-sveltekit-preload-data="hover"
				>{$t('common.nav_create')}</a
			>
			<a href="/upload" class="btn bg-initial" data-sveltekit-preload-data="hover"
				>{$t('common.nav_upload')}</a
			>
			<svelte:fragment slot="trail">
				<LightSwitch />

				<a class="btn btn-sm" href="https://gavin.webs.uvigo.gal" target="_blank" rel="noreferrer">
					<iconify-icon class="icon-[mdi-light--home] text-2xl" icon="mdi:web"></iconify-icon>
				</a>
				<a
					class="btn btn-sm"
					href="https://github.com/gavin-research"
					target="_blank"
					rel="noreferrer"
				>
					<iconify-icon class="icon-[mdi-light--home] text-2xl" icon="mdi:github-circle"
					></iconify-icon>
				</a>

				<RadioGroup>
					<RadioItem class="pb-0" bind:group={langVal} name="gb" value={0}>
						<iconify-icon class="icon text-2x1" icon="circle-flags:gb" />
					</RadioItem>
					<RadioItem class="pb-0" bind:group={langVal} name="es" value={1}>
						<iconify-icon class="icon text-2x1" icon="circle-flags:es" />
					</RadioItem>
				</RadioGroup>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	{#if $loaded}
		{#if $isMetamaskInstalled}
			{#if Boolean($walletState.account)}
				<slot />
			{:else}
				<button on:click={connect}>{$t('home.wallet_connect')}</button>
			{/if}
		{:else}
			<aside class="alert variant-ghost">
				<!-- Icon -->
				<!-- <div>(icon)</div> -->
				<!-- Message -->
				<div class="alert-message">
					<h3 class="h3">{$t('home.wallet_not_detected')}</h3>
				</div>
				<p>{$t('home.wallet_install')}</p>
				<!-- Actions -->
				<!-- <div class="alert-actions">(buttons)</div> -->
			</aside>
		{/if}
	{:else}
		<p>{$t('common.loading')}</p>
	{/if}

	<svelte:fragment slot="footer">
		<section
			class="dark:variant-filled-secondary variant-filled-primary pt-2"
			style="justify-items: center "
		>
			<p>{$t('common.footer')}</p>
		</section>
		<section
			class="grid grid-cols-3 gap-2 p-6 dark:variant-filled-secondary variant-filled-primary"
			style="justify-items: center"
		>
			<div style="max-width: 50%;" class="variant-filled-tertiary p-1">
				<a href="https://www.ciencia.gob.es/" target="_blank">
					<img src="ministeriocienciaeinnovacion.png" alt="Logo attlantic" />
				</a>
			</div>
			<div style="max-width: 50%;" class="variant-filled-tertiary p-1">
				<a href="https://atlanttic.uvigo.es/en/" target="_blank">
					<img src="Universidade-de-Vigo2.png" alt="Logo attlantic" />
				</a>
			</div>
			<div style="max-width: 50%;" class="variant-filled-tertiary p-1">
				<a href="https://www.uvigo.es/" target="_blank">
					<img src="attlantic4.png" alt="Logo attlantic" />
				</a>
			</div>
		</section>
	</svelte:fragment>
</AppShell>
