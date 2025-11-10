"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Filters({ initialQuery, onChange }) {
	const [q, setQ] = useState(initialQuery || "");
	const [location, setLocation] = useState("");
	const [remote, setRemote] = useState(true);
	const lastPayload = useRef(null);

	// Debounce search
	useEffect(() => {
		const payload = { q, location, remote };
		const t = setTimeout(() => {
			const prev = lastPayload.current;
			const changed =
				!prev ||
				prev.q !== payload.q ||
				prev.location !== payload.location ||
				prev.remote !== payload.remote;
			if (!changed) return;
			lastPayload.current = payload;
			onChange?.(payload);
		}, 400);
		return () => clearTimeout(t);
	}, [q, location, remote, onChange]);

	return (
		<div className="w-full grid grid-cols-1 md:grid-cols-5 gap-3">
			<div className="md:col-span-3">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
					<Input
						placeholder="Search roles, skills, companies..."
						className="pl-9 bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
						value={q}
						onChange={(e) => setQ(e.target.value)}
					/>
				</div>
			</div>
			<div>
				<div className="relative">
					<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
					<Input
						placeholder="Location (optional)"
						className="pl-9 bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
						value={location}
						onChange={(e) => setLocation(e.target.value)}
					/>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant={remote ? "default" : "outline"}
					onClick={() => setRemote((prev) => !prev)}
					className={
						remote
							? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
							: "border-zinc-700 text-zinc-200"
					}
				>
					{remote ? "Remote only" : "Remote + Onsite"}
				</Button>
				<Button
					variant="outline"
					onClick={() => {
						setQ("");
						setLocation("");
						setRemote(true);
					}}
					className="border-zinc-700 text-zinc-200"
				>
					Reset
				</Button>
			</div>
		</div>
	);
}


