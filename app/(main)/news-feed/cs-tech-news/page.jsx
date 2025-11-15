"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export default function CSTechNewsPage() {
  
  // State for each tab
  const [techTrendsData, setTechTrendsData] = useState(null)
  const [techTrendsLoading, setTechTrendsLoading] = useState(false)
  const [techTrendsError, setTechTrendsError] = useState(null)
  const [techTrendsFetched, setTechTrendsFetched] = useState(false)

  const [csNewsData, setCsNewsData] = useState(null)
  const [csNewsLoading, setCsNewsLoading] = useState(false)
  const [csNewsError, setCsNewsError] = useState(null)
  const [csNewsFetched, setCsNewsFetched] = useState(false)

  const [csJobsData, setCsJobsData] = useState(null)
  const [csJobsLoading, setCsJobsLoading] = useState(false)
  const [csJobsError, setCsJobsError] = useState(null)
  const [csJobsFetched, setCsJobsFetched] = useState(false)

  // Fetch Tech Trends from Hacker News
  const fetchTechTrends = async () => {
    setTechTrendsLoading(true)
    setTechTrendsError(null)
    
    try {
      // First, get top story IDs
      const idsResponse = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json")
      if (!idsResponse.ok) throw new Error("Failed to fetch story IDs")
      
      const storyIds = await idsResponse.json()
      const top10Ids = storyIds.slice(0, 10)
      
      // Then, fetch details for top 10 stories
      const storyPromises = top10Ids.map(id =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
      )
      
      const stories = await Promise.all(storyPromises)
      setTechTrendsData(stories)
      setTechTrendsFetched(true)
    } catch (error) {
      setTechTrendsError(error.message || "Failed to fetch tech trends")
    } finally {
      setTechTrendsLoading(false)
    }
  }

  // Fetch CS News from Dev.to
  const fetchCsNews = async () => {
    setCsNewsLoading(true)
    setCsNewsError(null)
    
    try {
      const response = await fetch("https://dev.to/api/articles?tag=computerscience&top=10")
      if (!response.ok) throw new Error("Failed to fetch CS news")
      
      const data = await response.json()
      setCsNewsData(data)
      setCsNewsFetched(true)
    } catch (error) {
      setCsNewsError(error.message || "Failed to fetch CS news")
    } finally {
      setCsNewsLoading(false)
    }
  }

  // Fetch CS Job News from NewsData.io
  // NOTE: You must create a .env.local file in the project root and add:
  // NEXT_PUBLIC_NEWSDATA_API_KEY=pub_53727094692a42fea8c599d30886abda
  const fetchCsJobs = async () => {
    setCsJobsLoading(true)
    setCsJobsError(null)
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY
      if (!apiKey) {
        throw new Error("NewsData.io API key is not configured. Please add NEXT_PUBLIC_NEWSDATA_API_KEY to your .env.local file.")
      }
      
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${apiKey}&q=computer%20science%20AND%20job&language=en`
      )
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch CS job news")
      }
      
      const data = await response.json()
      setCsJobsData(data.results || [])
      setCsJobsFetched(true)
    } catch (error) {
      setCsJobsError(error.message || "Failed to fetch CS job news")
    } finally {
      setCsJobsLoading(false)
    }
  }

  // Handle tab change
  const handleTabChange = (value) => {
    // Fetch data only if not already fetched
    if (value === "tech-trends" && !techTrendsFetched) {
      fetchTechTrends()
    } else if (value === "cs-news" && !csNewsFetched) {
      fetchCsNews()
    } else if (value === "cs-jobs" && !csJobsFetched) {
      fetchCsJobs()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-6xl font-bold gradient-title my-4">Computer Science & Tech News</h1>
      <Tabs defaultValue="tech-trends" onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="tech-trends">Tech Trends</TabsTrigger>
          <TabsTrigger value="cs-news">CS News</TabsTrigger>
          <TabsTrigger value="cs-jobs">CS Job News</TabsTrigger>
        </TabsList>

        {/* Tech Trends Tab */}
        <TabsContent value="tech-trends" className="mt-6">
          {techTrendsLoading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-4 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {techTrendsError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{techTrendsError}</AlertDescription>
            </Alert>
          )}

          {!techTrendsLoading && !techTrendsError && techTrendsData && (
            <div className="space-y-4">
              {techTrendsData.map((story) => (
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
                        {story.text.replace(/<[^>]*>/g, "").substring(0, 200)}...
                      </p>
                    </CardContent>
                  )}
                  {story.url && (
                    <CardFooter>
                      <a
                        href={story.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Read More
                      </a>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* CS News Tab */}
        <TabsContent value="cs-news" className="mt-6">
          {csNewsLoading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-4 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {csNewsError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{csNewsError}</AlertDescription>
            </Alert>
          )}

          {!csNewsLoading && !csNewsError && csNewsData && (
            <div className="space-y-4">
              {csNewsData.map((article) => (
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
                      {article.description || article.body_markdown?.substring(0, 200) || "No description available"}...
                    </p>
                  </CardContent>
                  <CardFooter>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Read More
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* CS Job News Tab */}
        <TabsContent value="cs-jobs" className="mt-6">
          {csJobsLoading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-4 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {csJobsError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{csJobsError}</AlertDescription>
            </Alert>
          )}

          {!csJobsLoading && !csJobsError && csJobsData && (
            <div className="space-y-4">
              {csJobsData.length === 0 ? (
                <Alert>
                  <AlertTitle>No articles found</AlertTitle>
                  <AlertDescription>No CS job news articles are available at this time.</AlertDescription>
                </Alert>
              ) : (
                csJobsData.map((article, index) => (
                  <Card key={article.article_id || index}>
                    <CardHeader>
                      <CardTitle>{article.title || "No title"}</CardTitle>
                      <CardDescription>
                        {article.source_name || "Unknown source"}
                        {article.pubDate && ` • ${new Date(article.pubDate).toLocaleDateString()}`}
                        {article.category && ` • ${article.category.join(", ")}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {article.description || article.content?.substring(0, 200) || "No description available"}...
                      </p>
                    </CardContent>
                    {article.link && (
                      <CardFooter>
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Read More
                        </a>
                      </CardFooter>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

