'use client';

import X from 'lucide-react/dist/esm/icons/x.js';

import { usePortfolio } from '../context/PortfolioContext';

const ImageModal = () => {
	const { selectedImage: image, closePopup: onClose } = usePortfolio();
	if (!image) return null;
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-fade-in"
			onClick={onClose}
		>
			<div
				className="relative w-full h-full flex items-center justify-center animate-scale-in"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
					aria-label="Close"
				>
					<X size={32} />
				</button>
				<img
					src={image}
					alt="Full size project screenshot"
					className="w-full h-full object-contain"
					loading="lazy"
				/>
			</div>
		</div>
	);
};

export default ImageModal;
