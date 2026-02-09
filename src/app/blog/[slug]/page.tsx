import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { getPostBySlug, getPostSlugs } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { ContentLayout } from "@/components/ContentLayout";
import { JsonLd } from "@/components/JsonLd";
import { mdxComponents } from "@/components/mdx-components";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return buildMetadata({
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    path: `/blog/${slug}`,
    image: post.frontmatter.image,
  });
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
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
              className="text-sm font-medium text-stone-500 hover:text-foreground transition-colors"
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

      <JsonLd
        type="blogPosting"
        title={post.frontmatter.title}
        description={post.frontmatter.description}
        date={post.frontmatter.date}
        author={post.frontmatter.author}
        url={`${SITE_URL}/blog/${slug}`}
        image={post.frontmatter.image}
      />

      <ContentLayout
        title={post.frontmatter.title}
        date={post.frontmatter.date}
        readingTime={post.readingTime}
        author={post.frontmatter.author}
      >
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
            },
          }}
        />
      </ContentLayout>
    </>
  );
}
