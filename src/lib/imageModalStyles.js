const baseCloseClassName =
	'absolute top-4 right-4 transition-colors z-10';

export function isPresenceImage(src = '') {
	return /(^|\/)presence\/[^/]+\.(png|jpe?g|webp|gif)$/i.test(src);
}

export function getImageModalCloseClassName(src) {
	const colorClassName = isPresenceImage(src)
		? 'text-black hover:text-neutral-700'
		: 'text-white hover:text-gray-300';

	return `${baseCloseClassName} ${colorClassName}`;
}
