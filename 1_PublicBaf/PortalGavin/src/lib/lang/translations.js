import i18n from 'sveltekit-i18n';

const config = {
	loaders: [
		{
			locale: 'en',
			key: 'common',
			loader: async () => (await import('./en/common.json')).default
		},
		{
			locale: 'en',
			key: 'access',
			loader: async () => (await import('./en/access.json')).default
		},
		{
			locale: 'en',
			key: 'info',
			loader: async () => (await import('./en/info.json')).default
		},
		{
			locale: 'en',
			key: 'download',
			loader: async () => (await import('./en/download.json')).default
		},
		{
			locale: 'en',
			key: 'upload',
			loader: async () => (await import('./en/upload.json')).default
		},
		{
			locale: 'en',
			key: 'home',
			routes: ['/'],
			loader: async () => (await import('./en/home.json')).default
		},
		{
			locale: 'en',
			key: 'profile',
			routes: ['/profile'],
			loader: async () => (await import('./en/profile.json')).default
		},
		{
			locale: 'en',
			key: 'error',
			loader: async () => (await import('./en/errors.json')).default
		},
		{
			locale: 'es',
			key: 'common',
			loader: async () => (await import('./es/common.json')).default
		},
		{
			locale: 'es',
			key: 'access',
			loader: async () => (await import('./es/access.json')).default
		},
		{
			locale: 'es',
			key: 'info',
			loader: async () => (await import('./es/info.json')).default
		},
		{
			locale: 'es',
			key: 'download',
			loader: async () => (await import('./es/download.json')).default
		},
		{
			locale: 'es',
			key: 'upload',
			loader: async () => (await import('./es/upload.json')).default
		},
		{
			locale: 'es',
			key: 'home',
			routes: ['/'],
			loader: async () => (await import('./es/home.json')).default
		},
		{
			locale: 'es',
			key: 'profile',
			routes: ['/profile'],
			loader: async () => (await import('./es/profile.json')).default
		},
		{
			locale: 'es',
			key: 'error',
			loader: async () => (await import('./es/errors.json')).default
		}
	]
};

export const { t, locale, locales, loading, loadTranslations } = new i18n(config);
