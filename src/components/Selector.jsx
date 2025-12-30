import { usePortfolio } from '../context/PortfolioContext';

const Selector = () => {
	const { selector, changeSelector } = usePortfolio();

	const options = [
		{ id: 'projects', label: 'Projects' },
		{ id: 'experience', label: 'Experience' },
	];

	return (
		<div className="flex gap-1 w-full bg-pill-bg p-1 rounded-full">
			{options.map((option) => (
				<button
					key={option.id}
					onClick={() => changeSelector(option.id)}
					className={`w-full py-1.5 text-sm rounded-full transition-all duration-300   ${
						selector === option.id
							? 'bg-bg text-text-primary shadow-sm font-medium'
							: 'text-text-muted hover:text-text-secondary hover:bg-pill-bg'
					}`}
				>
					{option.label}
				</button>
			))}
		</div>
	);
};

export default Selector;
