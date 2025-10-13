/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			colors: {
				bg: 'var(--color-bg)',
				surface: 'var(--color-surface)',
				border: 'var(--color-border)',
				'text-primary': 'var(--color-text-primary)',
				'text-secondary': 'var(--color-text-secondary)',
				'text-muted': 'var(--color-text-muted)',
				accent: 'var(--color-accent)',
				'accent-muted': 'var(--color-accent-muted)',
				'status-busy': 'var(--color-status-busy)',
				'status-available': 'var(--color-status-available)',
				'pill-bg': 'var(--color-pill-bg)',
				'pill-text': 'var(--color-pill-text)',
        'pill-border': 'var(--colorpill-border)'
			},
			boxShadow: {
				soft: 'var(--shadow-soft)',
				medium: 'var(--shadow-medium)',
			},
		},
	},
	plugins: [],
};
