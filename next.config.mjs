/** @type {import('next').NextConfig} */
const nextConfig = {
	compiler: {
		styledComponents: true,
	},
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'i.scdn.co' },
			{ protocol: 'https', hostname: 'media.licdn.com' },
			{ protocol: 'https', hostname: 'upload.wikimedia.org' },
			{ protocol: 'https', hostname: 'github.com' },
			{ protocol: 'https', hostname: 'raw.githubusercontent.com' },
		],
	},
};

export default nextConfig;
