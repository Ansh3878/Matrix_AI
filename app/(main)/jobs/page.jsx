"use client";

import { useEffect, useMemo, useState } from "react";
import Filters from "./_components/filters";
import JobCard from "./_components/job-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function JobsPage() {
	const [search, setSearch] = useState("");
	const [location, setLocation] = useState("");
	const [remoteOnly, setRemoteOnly] = useState(true);
	const [source, setSource] = useState("all");
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [data, setData] = useState({ results: [], total: 0 });

	const perPage = 20;

	useEffect(() => {
		setPage(1); // reset page when query changes
	}, [search, location, remoteOnly, source]);

	useEffect(() => {
		const controller = new AbortController();
		async function load() {
			setLoading(true);
			setError("");
			try {
				const params = new URLSearchParams();
				if (search) params.set("q", search);
				if (location) params.set("location", location);
				if (remoteOnly) params.set("remote", "true");
				else params.set("remote", "false");
				if (source && source !== "all") params.set("source", source);
				params.set("page", String(page));
				params.set("perPage", String(perPage));

				const res = await fetch(`/api/jobs?${params.toString()}`, {
					signal: controller.signal,
				});
				if (!res.ok) {
					const t = await res.text();
					throw new Error(t || "Failed to fetch jobs");
				}
				const json = await res.json();
				setData(json);
			} catch (e) {
				if (e.name === "AbortError") return;
				setError(e.message || "Something went wrong");
			} finally {
				setLoading(false);
			}
		}
		load();
		return () => controller.abort();
	}, [page, perPage, search, location, remoteOnly, source]);

	const totalPages = Math.max(1, Math.ceil((data?.total || 0) / perPage));

	const visibleResults = useMemo(() => {
		const results = data?.results || [];
		if (source === "all") return results;
		return results.filter((job) => job.source.toLowerCase() === source);
	}, [data?.results, source]);

	return (
		<div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
			<div className="space-y-6">
				<div className="space-y-2">
					<h1 className="text-2xl md:text-3xl font-bold text-zinc-100">
						Discover Your Next Role
					</h1>
					<p className="text-zinc-400">
						Search across multiple job sources with real-time results.
					</p>
				</div>

				<Filters
					initialQuery=""
					onChange={(payload) => {
						setSearch(payload.q || "");
						setLocation(payload.location || "");
						setRemoteOnly(Boolean(payload.remote));
					}}
				/>

				<Tabs
					className="w-full"
					value={source}
					onValueChange={(value) => setSource(value)}
				>
					<TabsList className="bg-zinc-900 border border-zinc-800">
						<TabsTrigger value="all">All</TabsTrigger>
						<TabsTrigger value="remotive">Remotive</TabsTrigger>
						<TabsTrigger value="jsearch">JSearch</TabsTrigger>
					</TabsList>
					<TabsContent value="all" className="mt-6" />
					<TabsContent value="remotive" className="mt-6" />
					<TabsContent value="jsearch" className="mt-6" />
				</Tabs>

				{loading ? (
					<div className="flex items-center justify-center py-16">
						<Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
					</div>
				) : error ? (
					<div className="text-red-400 bg-red-950/30 border border-red-900 p-4 rounded-md">
						{error}
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
						{visibleResults?.length ? (
							visibleResults.map((job) => <JobCard key={job.id} job={job} />)
						) : (
								<div className="col-span-full text-zinc-400 text-center py-16">
									No jobs found. Try adjusting your search.
								</div>
						)}
					</div>
				)}

				<div className="flex items-center justify-between pt-4">
					<p className="text-sm text-zinc-500">
						Page {page} of {totalPages} • {data?.total || 0} jobs
					</p>
					<div className="flex gap-2">
						<Button
							variant="outline"
							className="border-zinc-700 text-zinc-200"
							disabled={page <= 1 || loading}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							className="border-zinc-700 text-zinc-200"
							disabled={page >= totalPages || loading}
							onClick={() =>
								setPage((p) => Math.min(totalPages, p + 1))
							}
						>
							Next
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}


