"use client";

import { useEffect, useRef, useState } from "react";
import Filters from "./_components/filters";
import JobCard from "./_components/job-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw } from "lucide-react";

const PER_PAGE = 20;

export default function JobsPage() {
	// ── Single unified query object ──────────────────────────────────────────
	// All state that drives a fetch lives here so React batches them atomically.
	// This eliminates the double-fetch that happened when filters changed while
	// page > 1 (previously two separate effects raced each other).
	const [query, setQuery] = useState({
		search: "",
		location: "",
		remoteOnly: true,
		source: "all",
		page: 1,
		refreshKey: 0,
	});

	// Accumulated job list (appended by Load More)
	const [allJobs, setAllJobs] = useState([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState("");

	// Track previous query to distinguish filter-change (replace) from page-change (append)
	const prevQueryRef = useRef(query);

	useEffect(() => {
		const prev = prevQueryRef.current;
		prevQueryRef.current = query;

		const { search, location, remoteOnly, source, page, refreshKey } = query;

		// A "load more" only happens when page increases and nothing else changed
		const isLoadMore =
			prev.search === search &&
			prev.location === location &&
			prev.remoteOnly === remoteOnly &&
			prev.source === source &&
			prev.refreshKey === refreshKey &&
			page > 1;

		const controller = new AbortController();

		async function load() {
			if (isLoadMore) setLoadingMore(true);
			else { setLoading(true); setAllJobs([]); setTotal(0); }
			setError("");

			try {
				const params = new URLSearchParams();
				if (search) params.set("q", search);
				if (location) params.set("location", location);
				params.set("remote", remoteOnly ? "true" : "false");
				if (source && source !== "all") params.set("source", source);
				params.set("page", String(page));
				params.set("perPage", String(PER_PAGE));

				const res = await fetch(`/api/jobs?${params.toString()}`, {
					signal: controller.signal,
				});
				if (!res.ok) {
					const t = await res.text();
					throw new Error(t || "Failed to fetch jobs");
				}
				const json = await res.json();
				setTotal(json.total || 0);
				if (isLoadMore) {
					setAllJobs(prev => [...prev, ...(json.results || [])]);
				} else {
					setAllJobs(json.results || []);
				}
			} catch (e) {
				if (e.name === "AbortError") return;
				setError(e.message || "Something went wrong");
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		}

		load();
		return () => controller.abort();
	}, [query]); // Single dep — all filter changes are atomic

	const hasMore = allJobs.length < total;

	// Helpers that atomically update the query object
	const handleFilterChange = (payload) =>
		setQuery(q => ({
			...q,
			search: payload.q || "",
			location: payload.location || "",
			remoteOnly: Boolean(payload.remote),
			page: 1, // reset to page 1 on filter change
		}));

	const handleSourceChange = (source) =>
		setQuery(q => ({ ...q, source, page: 1 }));

	const handleLoadMore = () =>
		setQuery(q => ({ ...q, page: q.page + 1 }));

	const handleRefresh = () =>
		setQuery(q => ({ ...q, page: 1, refreshKey: q.refreshKey + 1 }));

	return (
		<div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
			<div className="space-y-6">

				{/* Title + Refresh */}
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-2">
						<h1 className="text-6xl font-bold gradient-title">Discover Your Next Role</h1>
						<p className="text-zinc-400">
							Search across multiple job sources with real-time results.
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={loading}
						className="flex items-center gap-2 shrink-0 mt-2"
					>
						<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
						Refresh
					</Button>
				</div>

				<Filters
					initialQuery=""
					onChange={handleFilterChange}
				/>

				<Tabs
					className="w-full"
					value={query.source}
					onValueChange={handleSourceChange}
				>
					<TabsList className="bg-zinc-900 border border-zinc-800">
						<TabsTrigger value="all">All</TabsTrigger>
						<TabsTrigger value="remotive">Remotive</TabsTrigger>
					</TabsList>
					<TabsContent value="all" className="mt-6" />
					<TabsContent value="remotive" className="mt-6" />
				</Tabs>

				{/* Job list */}
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
						{allJobs.length ? (
							allJobs.map(job => <JobCard key={job.id} job={job} />)
						) : (
							<div className="col-span-full text-zinc-400 text-center py-16">
								No jobs found. Try adjusting your search.
							</div>
						)}
					</div>
				)}

				{/* Footer: count + Load More */}
				<div className="flex flex-col items-center gap-3 pt-2">
					<p className="text-sm text-zinc-500">
						Showing {allJobs.length} of {total} jobs
					</p>
					{hasMore && !loading && (
						<Button
							variant="outline"
							className="border-zinc-700 text-zinc-200 w-full max-w-xs"
							disabled={loadingMore}
							onClick={handleLoadMore}
						>
							{loadingMore
								? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</>
								: "Load More"}
						</Button>
					)}
				</div>

			</div>
		</div>
	);
}
