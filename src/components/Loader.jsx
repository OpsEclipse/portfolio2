
const Loader = ({ show }) => {
	if (!show) return null;
	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-gray-900">
			<img
				src="icon.png"
				alt="Loading"
				className="w-20 h-20 sm:w-24 sm:h-24 animate-pulse"
			/>
		</div>
	);
};

export default Loader;
