import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right.js';
import Calendar from 'lucide-react/dist/esm/icons/calendar.js';

// Parse simple HTML with only <strong> tags to React elements
function parseDescription(text) {
	const parts = text.split(/(<strong>.*?<\/strong>)/g);
	return parts.map((part, index) => {
		const match = part.match(/<strong>(.*?)<\/strong>/);
		if (match) {
			return <strong key={index}>{match[1]}</strong>;
		}
		return part;
	});
}

const ExperienceCard = ({
	role,
	company,
	date,
	description,
	skills,
	companyUrl,
	logoUrl,
}) => {
	return (
		<div className="flex flex-col gap-2 p-4 border border-border rounded-xl hover:bg-pill-bg/30 transition-colors duration-300 group">
			<div className="flex justify-between items-start gap-3">
				{logoUrl && (
					<div className="w-10 h-10 min-w-10 min-h-10 flex items-center justify-center">
						<img
							src={logoUrl}
							alt={`${company} logo`}
							className="w-full h-full object-contain"
						/>
					</div>
				)}

				<div className="flex flex-col gap-0.5 w-full">
					<div className="flex justify-between items-start">
						<div className="flex flex-col gap-0.5">
							<h3 className="text-sm sm:text-base font-medium text-text-primary">
								{role}
							</h3>
							<a
								href={companyUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs sm:text-sm text-text-muted hover:text-text-primary hover:translate-x-0.5 transition-all flex items-center gap-1 w-fit"
							>
								{company}
								<ArrowUpRight
									size={12}
									className="opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-y-0.5"
								/>
							</a>
						</div>
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
				</div>
			</div>

			{description && description.length > 0 && (
				<ul className="flex flex-col gap-1.5 mt-2 pl-4 list-disc marker:text-text-muted/50">
					{description.map((item, index) => (
						<li
							key={index}
							className="text-[11px] sm:text-[12px] text-text-muted leading-relaxed"
						>
							{parseDescription(item)}
						</li>
					))}
				</ul>
			)}

			{skills && (
				<div className="flex gap-1.5 flex-wrap mt-2">
					{skills.map((skill, index) => (
						<div
							key={index}
							className="px-2 py-0 rounded-md bg-pill-bg border border-border/50"
						>
							<span className="text-[10px] text-text-secondary font-medium">
								{skill}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

const Experience = () => {
	const experiences = [
		{
			id: 'uw-vex',
			role: 'Full Stack Developer — Scouting Intelligence Platform',
			company: 'UWAT VEXU Robotics Design Team',
			companyUrl: 'https://ca.linkedin.com/company/uw-vex-u',
			date: 'Oct 2025 – Dec 2025',
			description: [
				'Developing a full-stack scouting system using <strong>FastAPI</strong>, <strong>React</strong>, <strong>OpenCV</strong>, and <strong>Docker</strong> that analyzes livestream footage to track advanced metrics including score rate, jam frequency, defense effectiveness, and driver efficiency.',
				'Creating responsive visual dashboards and scalable <strong>REST API</strong> pipelines that support opponent profiling and historical comparison across multiple competitions.',
			],
			skills: [
				'FastAPI',
				'React',
				'OpenCV',
				'Docker',
				'REST API',
			],
			logoUrl:
				'https://media.licdn.com/dms/image/v2/C4D0BAQFvORyCn1VLaA/company-logo_100_100/company-logo_100_100/0/1630520530065/uw_vex_u_logo?e=1768435200&v=beta&t=X18jBk_pOrkyaxoHTH7pa80hcNpfRULgcQttsFW11gs',
		},
		{
			id: 'sanatan-mandir',
			role: 'Software Developer',
			company: 'Fort McMurray Sanatan Mandir',
			companyUrl: 'https://fortmcmurraymandir.com',
			date: 'Sep 2023 – Jan 2024',
			description: [
				'Revamped and maintained the community website using HTML, CSS, and JavaScript, serving <strong>300+</strong> active members.',
				'Implemented a mobile-first responsive design, improving accessibility for <strong>70%</strong> of visitors browsing on phones.',
				'Built and integrated a secure contact form with real-time validation and error handling, improving communication by <strong>reducing spam submissions</strong>, and providing a smoother user experience for community members on the website.',
			],
			skills: ['HTML', 'CSS', 'JavaScript'],
		},
		{
			id: 'westwood',
			role: 'Robotics Software Lead',
			company: 'Westwood Robotics Team 221X',
			companyUrl: '#',
			date: 'Sep 2022 – May 2025',
			description: [
				'Programmed an autonomous competition robot using C++, setting a <strong>provincial record</strong> in autonomous competition points and helping the team win 1st place in Alberta.',
				'Developed odometry-based autonomous navigation system, and implemented advanced PID control algorithms for precise arm positioning, motion stabilization, and consistent task execution.',
				'Created <strong>binary search PID tuning algorithm</strong>, reducing tuning time by <strong>50%</strong> and improving development efficiency.',
			],
			skills: ['C++', 'PID Control', 'Algorithms'],
			logoUrl: '',
		},
	];

	return (
		<div className="flex flex-col gap-4 animate-fade-in">
			{experiences.map((exp) => (
				<ExperienceCard key={exp.id} {...exp} />
			))}
		</div>
	);
};

export default Experience;
