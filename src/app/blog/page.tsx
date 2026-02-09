import Link from "next/link";
import { getAllPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Briefcase, Clock, ArrowRight } from "lucide-react";

export const metadata = buildMetadata({
  title: "Blog",
  description:
    "Tips, guides, and insights for service providers on scheduling, business management, and growing your practice.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 px-4 sm:px-6 py-4 backdrop-blur-md bg-[#fafaf8]/90 border-b border-border/60">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-[family-name:var(--font-display)] text-2xl tracking-tight text-foreground"
          >
            <Briefcase className="w-5 h-5 text-primary" />
            AppName
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-sm font-medium text-foreground"
            >
              Blog
            </Link>
            <Link
              href="/auth/signin"
              className="text-sm text-stone-500 hover:text-foreground transition-all duration-150"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-display)] text-foreground tracking-tight mb-3">
            Blog
          </h1>
          <p className="text-stone-500 text-lg">
            Tips and insights for service providers.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-stone-400">No posts yet. Check back soon!</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block p-6 rounded-[var(--ds-radius-lg)] border border-border bg-surface hover:shadow-[var(--ds-shadow-sm)] transition-shadow group"
              >
                <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                  {post.frontmatter.title}
                </h2>
                <p className="text-stone-500 text-sm leading-relaxed mb-3">
                  {post.frontmatter.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <span>
                      {new Date(
                        `${post.frontmatter.date}T12:00:00`
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTime}
                    </span>
                  </div>
                  <span className="text-xs text-primary font-medium inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read more <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
                {post.frontmatter.tags.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {post.frontmatter.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
