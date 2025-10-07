import { loadTranslations } from '$lib/lang/translations';
import { browser } from '$app/environment';

/** @type {import('@sveltejs/kit').Load} */
export const load = async ({ url }) => {
	const { pathname } = url;
	let lang = 'en';

	if (browser) {
		const langVal = localStorage.getItem('lang');
		if (langVal != undefined) {
			lang = langVal;
		}
	}

	await loadTranslations(lang, pathname); // keep this just before the `return`
	return { lang };
};
