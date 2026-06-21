"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"

const PAGE_SIZE = 10

export default function CSTechNewsPage() {
  const [activeTab, setActiveTab] = useState("tech-trends")

  // ── Tech Trends (Hacker News) ──────────────────────────────────────────────
  const [techData, setTechData] = useState([])
  const [techLoading, setTechLoading] = useState(false)
  const [techLoadingMore, setTechLoadingMore] = useState(false)
  const [techError, setTechError] = useState(null)
  const [techPage, setTechPage] = useState(1)
  const [techHasMore, setTechHasMore] = useState(true)
  const hnIdsRef = useRef(null) // cached HN story ID list

  // ── CS News (Dev.to) ───────────────────────────────────────────────────────
  const [csNewsData, setCsNewsData] = useState([])
  const [csNewsLoading, setCsNewsLoading] = useState(false)
  const [csNewsLoadingMore, setCsNewsLoadingMore] = useState(false)
  const [csNewsError, setCsNewsError] = useState(null)
  const [csNewsPage, setCsNewsPage] = useState(1)
  const [csNewsFetched, setCsNewsFetched] = useState(false)
  const [csNewsHasMore, setCsNewsHasMore] = useState(true)

  // ── CS Job News (NewsAPI via /api/news-feed) ───────────────────────────────
  const [csJobsData, setCsJobsData] = useState([])
  const [csJobsLoading, setCsJobsLoading] = useState(false)
  const [csJobsLoadingMore, setCsJobsLoadingMore] = useState(false)
  const [csJobsError, setCsJobsError] = useState(null)
  const [csJobsPage, setCsJobsPage] = useState(1)
  const [csJobsFetched, setCsJobsFetched] = useState(false)
  const [csJobsHasMore, setCsJobsHasMore] = useState(true)

  // ── Fetch functions ────────────────────────────────────────────────────────

  const fetchTechTrends = async (page = 1, append = false) => {
    if (append) setTechLoadingMore(true)
    else setTechLoading(true)
    setTechError(null)

    try {
      // Re-fetch IDs only on fresh load / refresh, cache for load-more pages
      if (!hnIdsRef.current || !append) {
        const r = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json")
        if (!r.ok) throw new Error("Failed to fetch story IDs")
        hnIdsRef.current = await r.json()
      }

      const ids = hnIdsRef.current
      const start = (page - 1) * PAGE_SIZE
      const pageIds = ids.slice(start, start + PAGE_SIZE)

      if (!pageIds.length) { setTechHasMore(false); return }

      const stories = await Promise.all(
        pageIds.map(id =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
        )
      )

      setTechData(prev => append ? [...prev, ...stories] : stories)
      setTechHasMore(start + PAGE_SIZE < ids.length)
      setTechPage(page)
    } catch (err) {
      setTechError(err.message || "Failed to fetch tech trends")
    } finally {
      setTechLoading(false)
      setTechLoadingMore(false)
    }
  }

  const fetchCsNews = async (page = 1, append = false) => {
    if (append) setCsNewsLoadingMore(true)
    else setCsNewsLoading(true)
    setCsNewsError(null)

    try {
      const r = await fetch(
        `https://dev.to/api/articles?tag=computerscience&per_page=${PAGE_SIZE}&page=${page}`
      )
      if (!r.ok) throw new Error("Failed to fetch CS news")

      const data = await r.json()
      setCsNewsData(prev => append ? [...prev, ...data] : data)
      setCsNewsHasMore(data.length === PAGE_SIZE)
      setCsNewsPage(page)
      setCsNewsFetched(true)
    } catch (err) {
      setCsNewsError(err.message || "Failed to fetch CS news")
    } finally {
      setCsNewsLoading(false)
      setCsNewsLoadingMore(false)
    }
  }

  const fetchCsJobs = async (page = 1, append = false) => {
    if (append) setCsJobsLoadingMore(true)
    else setCsJobsLoading(true)
    setCsJobsError(null)

    try {
      const q = '(developer OR "software engineer") AND (layoffs OR hiring OR "job market")'
      const r = await fetch(
        `/api/news-feed?q=${encodeURIComponent(q)}&pageSize=${PAGE_SIZE}&page=${page}`
      )
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err?.error || `Failed (${r.status})`)
      }
      const data = await r.json()
      const articles = data.articles || []
      setCsJobsData(prev => append ? [...prev, ...articles] : articles)
      setCsJobsHasMore(articles.length === PAGE_SIZE)
      setCsJobsPage(page)
      setCsJobsFetched(true)
    } catch (err) {
      setCsJobsError(err.message || "Failed to fetch CS job news")
    } finally {
      setCsJobsLoading(false)
      setCsJobsLoadingMore(false)
    }
  }

  // ── Initial mount: load Tech Trends (default tab) ─────────────────────────
  useEffect(() => { fetchTechTrends(1, false) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tab switch: lazy-load on first visit ──────────────────────────────────
  const handleTabChange = (value) => {
    setActiveTab(value)
    if (value === "cs-news" && !csNewsFetched) fetchCsNews(1, false)
    else if (value === "cs-jobs" && !csJobsFetched) fetchCsJobs(1, false)
  }

  // ── Refresh: clear data + re-fetch page 1 for the active tab ─────────────
  const handleRefresh = () => {
    if (activeTab === "tech-trends") {
      hnIdsRef.current = null
      setTechData([]); setTechPage(1); setTechHasMore(true)
      fetchTechTrends(1, false)
    } else if (activeTab === "cs-news") {
      setCsNewsData([]); setCsNewsPage(1); setCsNewsHasMore(true); setCsNewsFetched(false)
      fetchCsNews(1, false)
    } else {
      setCsJobsData([]); setCsJobsPage(1); setCsJobsHasMore(true); setCsJobsFetched(false)
      fetchCsJobs(1, false)
    }
  }

  const isRefreshing =
    (activeTab === "tech-trends" && techLoading) ||
    (activeTab === "cs-news" && csNewsLoading) ||
    (activeTab === "cs-jobs" && csJobsLoading)

  // ── Reusable skeleton ─────────────────────────────────────────────────────
  const SkeletonCards = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
          <CardFooter><Skeleton className="h-4 w-24" /></CardFooter>
        </Card>
      ))}
    </div>
  )

  const LoadMoreButton = ({ onClick, loading, hasMore }) =>
    hasMore ? (
      <div className="flex justify-center mt-6">
        <Button
          variant="outline"
          onClick={onClick}
          disabled={loading}
          className="w-full max-w-xs"
        >
          {loading
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</>
            : "Load More"}
        </Button>
      </div>
    ) : null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header row with Refresh button */}
      <div className="flex items-center justify-between my-4 gap-4">
        <h1 className="text-5xl md:text-6xl font-bold gradient-title">
          Computer Science &amp; Tech News
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="tech-trends" onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="tech-trends">Tech Trends</TabsTrigger>
          <TabsTrigger value="cs-news">CS News</TabsTrigger>
          <TabsTrigger value="cs-jobs">CS Job News</TabsTrigger>
        </TabsList>

        {/* ── Tech Trends ─────────────────────────────────────── */}
        <TabsContent value="tech-trends" className="mt-6">
          {techLoading && <SkeletonCards />}
          {techError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{techError}</AlertDescription>
            </Alert>
          )}
          {!techLoading && !techError && techData.length > 0 && (
            <>
              <div className="space-y-4">
                {techData.map(story => (
                  <Card key={story.id}>
                    <CardHeader>
                      <CardTitle>{story.title || "No title"}</CardTitle>
                      <CardDescription>
                        By {story.by || "Unknown"} • {story.score || 0} points
                        {story.time && ` • ${new Date(story.time * 1000).toLocaleDateString()}`}
                      </CardDescription>
                    </CardHeader>
                    {story.text && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {story.text.replace(/<[^>]*>/g, "").substring(0, 200)}…
                        </p>
                      </CardContent>
                    )}
                    {story.url && (
                      <CardFooter>
                        <a href={story.url} target="_blank" rel="noopener noreferrer"
                          className="text-primary hover:underline">
                          Read More
                        </a>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
              <LoadMoreButton
                onClick={() => fetchTechTrends(techPage + 1, true)}
                loading={techLoadingMore}
                hasMore={techHasMore}
              />
            </>
          )}
        </TabsContent>

        {/* ── CS News ─────────────────────────────────────────── */}
        <TabsContent value="cs-news" className="mt-6">
          {csNewsLoading && <SkeletonCards />}
          {csNewsError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{csNewsError}</AlertDescription>
            </Alert>
          )}
          {!csNewsLoading && !csNewsError && csNewsData.length > 0 && (
            <>
              <div className="space-y-4">
                {csNewsData.map(article => (
                  <Card key={article.id}>
                    <CardHeader>
                      <CardTitle>{article.title || "No title"}</CardTitle>
                      <CardDescription>
                        By {article.user?.name || "Unknown"} • {article.public_reactions_count || 0} reactions
                        {article.published_at && ` • ${new Date(article.published_at).toLocaleDateString()}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {article.description || article.body_markdown?.substring(0, 200) || "No description available"}…
                      </p>
                    </CardContent>
                    <CardFooter>
                      <a href={article.url} target="_blank" rel="noopener noreferrer"
                        className="text-primary hover:underline">
                        Read More
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <LoadMoreButton
                onClick={() => fetchCsNews(csNewsPage + 1, true)}
                loading={csNewsLoadingMore}
                hasMore={csNewsHasMore}
              />
            </>
          )}
        </TabsContent>

        {/* ── CS Job News ─────────────────────────────────────── */}
        <TabsContent value="cs-jobs" className="mt-6">
          {csJobsLoading && <SkeletonCards />}
          {csJobsError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{csJobsError}</AlertDescription>
            </Alert>
          )}
          {!csJobsLoading && !csJobsError && csJobsData.length > 0 && (
            <>
              <div className="space-y-4">
                {csJobsData.map((article, i) => (
                  <Card key={article.url || i}>
                    <CardHeader>
                      <CardTitle>{article.title || "No title"}</CardTitle>
                      <CardDescription>
                        {article.source || "Unknown source"}
                        {article.publishedAt && ` • ${new Date(article.publishedAt).toLocaleDateString()}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {article.description || article.content?.substring(0, 200) || "No description available"}…
                      </p>
                    </CardContent>
                    {article.url && (
                      <CardFooter>
                        <a href={article.url} target="_blank" rel="noopener noreferrer"
                          className="text-primary hover:underline">
                          Read More
                        </a>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
              <LoadMoreButton
                onClick={() => fetchCsJobs(csJobsPage + 1, true)}
                loading={csJobsLoadingMore}
                hasMore={csJobsHasMore}
              />
            </>
          )}
          {!csJobsLoading && !csJobsError && csJobsData.length === 0 && csJobsFetched && (
            <Alert>
              <AlertTitle>No articles found</AlertTitle>
              <AlertDescription>No CS job news articles are available at this time.</AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
