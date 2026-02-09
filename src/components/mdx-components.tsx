import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      className="text-3xl font-bold text-foreground mt-10 mb-4 first:mt-0"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="text-2xl font-semibold text-foreground mt-8 mb-3"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="text-xl font-semibold text-foreground mt-6 mb-2"
      {...props}
    />
  ),
  p: (props) => (
    <p className="text-muted leading-relaxed mb-4" {...props} />
  ),
  ul: (props) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
  ol: (props) => (
    <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
  ),
  li: (props) => <li className="text-muted leading-relaxed" {...props} />,
  a: ({ href, ...props }) => {
    if (href?.startsWith("/")) {
      return (
        <Link
          href={href}
          className="text-primary hover:underline font-medium"
          {...props}
        />
      );
    }
    return (
      <a
        href={href}
        className="text-primary hover:underline font-medium"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    );
  },
  blockquote: (props) => (
    <blockquote
      className="border-l-4 border-primary/30 pl-4 my-4 italic text-muted"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="bg-surface-hover text-foreground px-1.5 py-0.5 rounded text-sm font-mono"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="bg-[var(--warm-dark)] text-gray-100 rounded-lg p-4 overflow-x-auto mb-4"
      {...props}
    />
  ),
  hr: () => <hr className="border-border my-8" />,
  strong: (props) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  em: (props) => <em className="italic text-muted" {...props} />,
};
