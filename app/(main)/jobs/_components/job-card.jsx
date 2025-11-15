"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Building2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function JobCard({ job }) {
	const posted =
		job.postedAt ? new Date(job.postedAt).toLocaleDateString() : "—";

	return (
		<Card className="bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 transition-colors">
			<div className="p-5 md:p-6 flex flex-col gap-4">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
					<div className="space-y-1">
						<h3 className="text-lg md:text-xl font-semibold text-zinc-100">
							{job.title}
						</h3>
						<div className="flex flex-wrap items-center gap-3 text-zinc-400 text-sm">
							<span className="inline-flex items-center gap-1.5">
								<Building2 className="w-4 h-4" />
								{job.company || "Unknown"}
							</span>
							<span className="inline-flex items-center gap-1.5">
								<MapPin className="w-4 h-4" />
								{job.location || "Remote"}
							</span>
							<span className="inline-flex items-center gap-1.5">
								<Calendar className="w-4 h-4" />
								{posted}
							</span>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="secondary" className="bg-zinc-800 text-zinc-200">
							{job.type}
						</Badge>
						<Badge className="bg-emerald-900/40 border-emerald-800 text-emerald-300">
							{job.source}
						</Badge>
					</div>
				</div>
				{job.tags?.length ? (
					<div className="flex flex-wrap gap-2">
						{job.tags.slice(0, 6).map((t) => (
							<Badge
								key={t}
								variant="outline"
								className="border-zinc-700 text-zinc-300"
							>
								{t}
							</Badge>
						))}
					</div>
				) : null}
				<div className="flex items-center justify-between">
					<div className="text-zinc-300 text-sm">
						{job.salary ? `Salary: ${job.salary}` : ""}
					</div>
					{job.url ? (
						<Link href={job.url} target="_blank" rel="noopener noreferrer">
							<Button variant="secondary" className="gap-2">
								Apply
								<ExternalLink className="w-4 h-4" />
							</Button>
						</Link>
					) : null}
				</div>
			</div>
		</Card>
	);
}




