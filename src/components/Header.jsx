'use client';

import { usePortfolio } from '../context/PortfolioContext';

const Header = ({
	showIdentity = true,
}) => {
	const { isLoaded } = usePortfolio();
	return (
		<div
			className={`flex flex-col gap-4 sm:gap-6 transition-all duration-700 delay-100 ${
				isLoaded
					? 'opacity-100 translate-y-0'
					: 'opacity-0 translate-y-8'
			}`}
		>
			{showIdentity ? (
				<h2 className="text-lg sm:text-xl font-normal leading-none">
					Sparsh Shah
				</h2>
			) : null}
			<div className="flex flex-col flex-wrap justify-start gap-2 sm:flex-row">
				<div className="w-fit h-fit flex gap-2 rounded-full border px-4 sm:px-5 py-2">
					<p className="text-[11px] sm:text-[12px] font-medium leading-none text-text-secondary">
						Waterloo, Canada
					</p>
				</div>
				<div className="w-fit h-fit flex gap-3 rounded-full border px-4 sm:px-5 py-2 bg-pill-bg">
					<p className="text-[11px] sm:text-[12px] font-medium leading-none text-text-secondary">
						<span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
						Seeking co-op{' '}
						<span className="text-text-muted">
							fall 2026
						</span>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Header;
