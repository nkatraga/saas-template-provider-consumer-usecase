import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Briefcase, FileText, List, Calculator, Clock } from "lucide-react";

export const metadata = buildMetadata({
  title: "Free Tools for Service Providers",
  description:
    "Free tools to help service providers manage their business — scheduling, invoicing, and more. Coming soon.",
  path: "/tools",
});

const tools = [
  {
    icon: FileText,
    title: "Invoice Generator",
    description:
      "Create professional invoices for your consumers based on completed bookings and rates.",
  },
  {
    icon: List,
    title: "Service Checklist Builder",
    description:
      "Build reusable checklists for your service sessions to ensure consistent quality.",
  },
  {
    icon: Calculator,
    title: "Rate Calculator",
    description:
      "Figure out competitive rates based on your area, experience, and service type.",
  },
  {
    icon: Clock,
    title: "Schedule Planner",
    description:
      "Plan your weekly schedule with built-in break times and travel buffers.",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
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
              className="text-sm text-stone-500 hover:text-foreground transition-colors"
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
          <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
            Coming soon
          </span>
          <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-display)] text-foreground tracking-tight mb-3">
            Free tools for service providers
          </h1>
          <p className="text-stone-500 text-lg">
            We&apos;re building free tools to help you run your business. Here&apos;s
            what&apos;s on the way.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="p-6 rounded-[var(--ds-radius-lg)] border border-border bg-surface opacity-75"
            >
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                <tool.icon className="w-5 h-5 text-stone-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {tool.title}
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
