import Calendar from 'lucide-react/dist/esm/icons/calendar.js';

const EducationCard = ({
	school,
	degree,
	date,
	logoUrl,
	coursework,
}) => {
	return (
		<div className="flex flex-col gap-2 p-4 border border-border rounded-xl hover:bg-pill-bg/30 transition-colors duration-300">
			<div className="flex justify-between items-start gap-3">
				<div className="w-10 h-10 min-w-10 min-h-10 flex items-center justify-center">
					{logoUrl ? (
						<img
							src={logoUrl}
							alt={`${school} logo`}
							className="w-full h-full"
						/>
					) : (
						<div className="w-full h-full rounded-sm" />
					)}
				</div>
				<div className="flex flex-col gap-0.5 w-full">
					<div className="flex justify-between items-start">
						<h3 className="text-sm sm:text-base font-medium text-text-primary">
							{school}
						</h3>
						<div className="flex items-center gap-1.5 px-2 py-1 bg-pill-bg/50 rounded-full border border-border/50">
							<Calendar
								size={10}
								className="text-text-muted hover:text-text-primary transition-all"
							/>
							<span className="text-[10px] sm:text-[11px] text-text-secondary font-medium whitespace-nowrap">
								{date}
							</span>
						</div>
					</div>
					<p className="text-xs sm:text-sm text-text-muted hover:text-text-primary transition-colors">
						{degree}
					</p>

					{coursework && (
						<p className="text-[11px] sm:text-[12px] text-text-muted mt-1">
							<span className="font-medium text-text-secondary">
								Relevant Coursework:
							</span>{' '}
							{coursework}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

const Education = () => {
	const education = [
		{
			id: 'uwaterloo',
			school: 'University of Waterloo',
			degree: 'BASc, Systems Design Engineering',
			date: 'Expected Jun 2030',
			logoUrl: 'waterloo.png',
			coursework:
				'Data Structures and Algorithms, Digital Computation (C++), MATLAB, Solidworks',
		},
	];

	return (
		<div className="flex flex-col gap-4 animate-fade-in mt-8">
			<h2 className="text-lg font-medium text-text-primary px-1">
				Education
			</h2>
			<div className="flex flex-col gap-4">
				{education.map((edu) => (
					<EducationCard key={edu.id} {...edu} />
				))}
			</div>
		</div>
	);
};

export default Education;
