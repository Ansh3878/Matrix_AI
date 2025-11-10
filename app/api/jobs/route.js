export const dynamic = "force-dynamic";

// Aggregate jobs from Remotive and JSearch (RapidAPI)
export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q") || "";
		const page = Math.max(Number(searchParams.get("page") || "1"), 1);
		const perPage = Math.min(Math.max(Number(searchParams.get("perPage") || "20"), 1), 50);
		const location = searchParams.get("location") || "";
		const remoteParam = searchParams.get("remote");
		const remoteOnly =
			remoteParam === null ? true : remoteParam === "true" || remoteParam === "1";
		const sourceFilter = (searchParams.get("source") || "all").toLowerCase();

		// Remotive API
		const remotiveUrl = new URL("https://remotive.com/api/remote-jobs");
		if (query) remotiveUrl.searchParams.set("search", query);
		if (location) remotiveUrl.searchParams.set("location", location);
		if (remoteOnly) remotiveUrl.searchParams.set("is_remote", "true");

		// JSearch RapidAPI
		const jsearchKey = process.env.JSEARCH_API_KEY;
		const jsearchUrl = new URL("https://jsearch.p.rapidapi.com/search");
		jsearchUrl.searchParams.set("query", query || "developer");
		if (location) {
			jsearchUrl.searchParams.set("page", String(page));
			jsearchUrl.searchParams.set("location", location);
		} else {
			jsearchUrl.searchParams.set("page", String(page));
		}
		jsearchUrl.searchParams.set("num_pages", "1");

		const remotivePromise = fetch(remotiveUrl.toString(), {
			next: { revalidate: 0 },
		});

		let jsearchPromise = null;
		if (jsearchKey) {
			jsearchPromise = fetch(jsearchUrl.toString(), {
				method: "GET",
				headers: {
					"x-rapidapi-key": jsearchKey,
					"x-rapidapi-host": "jsearch.p.rapidapi.com",
				},
				next: { revalidate: 0 },
			});
		}

		const [remotiveRes, jsearchRes] = await Promise.all([
			remotivePromise,
			jsearchPromise,
		]);

		if (!remotiveRes.ok) {
			const text = await remotiveRes.text();
			throw new Error(`Remotive error: ${remotiveRes.status} ${text}`);
		}
		if (jsearchRes && !jsearchRes.ok) {
			const text = await jsearchRes.text();
			throw new Error(`JSearch error: ${jsearchRes.status} ${text}`);
		}

		const remotiveData = await remotiveRes.json();
		const jsearchData = jsearchRes ? await jsearchRes.json() : { data: [] };

		// Normalize Remotive
		const remotiveJobs = Array.isArray(remotiveData?.jobs)
			? remotiveData.jobs.map((j) => ({
					id: `remotive_${j.id}`,
					title: j.title,
					company: j.company_name,
					location: j.candidate_required_location || "Remote",
					salary: j.salary || null,
					type: j.job_type || "Full-time",
					source: "Remotive",
					url: j.url,
					postedAt: j.publication_date,
					tags: j.tags || [],
					isRemote:
						typeof j?.candidate_required_location === "string"
							? /remote/i.test(j.candidate_required_location)
							: true,
			  }))
			: [];

		// Normalize JSearch
		const jsearchJobs = Array.isArray(jsearchData?.data)
			? jsearchData.data.map((j) => ({
					id: `jsearch_${j.job_id}`,
					title: j.job_title,
					company: j.employer_name,
					location: j.job_city
						? [j.job_city, j.job_state, j.job_country].filter(Boolean).join(", ")
						: j.job_country || "Remote",
					salary: j.job_max_salary || j.job_min_salary || null,
					type: j.job_employment_type || "Unknown",
					source: "JSearch",
					url: j.job_apply_link || j.job_google_link,
					postedAt: j.job_posted_at_datetime_utc || j.job_posted_at_timestamp,
					tags: j.job_required_skills || [],
					isRemote: Boolean(j.job_is_remote),
			  }))
			: [];

		// Combine, sort by posted date desc, paginate
		const combined = [...remotiveJobs, ...jsearchJobs].sort((a, b) => {
			const da = a.postedAt ? new Date(a.postedAt).getTime() : 0;
			const db = b.postedAt ? new Date(b.postedAt).getTime() : 0;
			return db - da;
		});

		let filtered = combined;

		if (sourceFilter !== "all") {
			filtered = filtered.filter(
				(job) => job.source.toLowerCase() === sourceFilter
			);
		}

		if (remoteOnly) {
			filtered = filtered.filter((job) => {
				if (typeof job.isRemote === "boolean") return job.isRemote;
				return /remote/i.test(job.location || "");
			});
		}

		if (location) {
			const needle = location.toLowerCase();
			filtered = filtered.filter((job) =>
				(job.location || "").toLowerCase().includes(needle)
			);
		}

		const start = (page - 1) * perPage;
		const paginated = filtered.slice(start, start + perPage);

		return new Response(
			JSON.stringify({
				page,
				perPage,
				total: filtered.length,
				source: sourceFilter,
				results: paginated,
			}),
			{
				status: 200,
				headers: { "content-type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Jobs API error:", error);
		return new Response(
			JSON.stringify({
				error: error.message || "Failed to fetch jobs",
			}),
			{ status: 500, headers: { "content-type": "application/json" } }
		);
	}
}


