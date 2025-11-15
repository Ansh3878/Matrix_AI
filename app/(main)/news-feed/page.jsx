import CSTechNewsPage from "./cs-tech-news/page";

export const metadata = {
  title: "News Feed",
  description: "Computer Science & Tech News Feed",
};

export default function NewsFeedIndexPage() {
  // Render the existing CS Tech News page at the index route
  return <CSTechNewsPage />;
}