import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

interface ContentLayoutProps {
  title: string;
  date: string;
  readingTime: string;
  author: string;
  children: React.ReactNode;
}

export function ContentLayout({
  title,
  date,
  readingTime,
  author,
  children,
}: ContentLayoutProps) {
  const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-display)] text-foreground tracking-tight mb-4">
            {title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted">
            <span>{author}</span>
            <span className="text-border-strong">|</span>
            <span>{formattedDate}</span>
            <span className="text-border-strong">|</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {readingTime}
            </span>
          </div>
        </header>

        <article className="prose prose-gray max-w-none">{children}</article>
      </div>
    </div>
  );
}
