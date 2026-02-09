const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

interface OrganizationProps {
  type: "organization";
}

interface BlogPostingProps {
  type: "blogPosting";
  title: string;
  description: string;
  date: string;
  author: string;
  url: string;
  image?: string;
}

type JsonLdProps = OrganizationProps | BlogPostingProps;

export function JsonLd(props: JsonLdProps) {
  let data: Record<string, unknown>;

  if (props.type === "organization") {
    data = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "AppName",
      url: SITE_URL,
      description:
        "The provider-consumer SaaS platform for scheduling, bookings, and business management.",
      sameAs: [],
    };
  } else {
    data = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: props.title,
      description: props.description,
      datePublished: props.date,
      author: {
        "@type": "Person",
        name: props.author,
      },
      publisher: {
        "@type": "Organization",
        name: "AppName",
        url: SITE_URL,
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": props.url,
      },
      ...(props.image && { image: `${SITE_URL}${props.image}` }),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
