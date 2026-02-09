import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Briefcase, ArrowLeftRight } from "lucide-react";

export const metadata = buildMetadata({
  title: "How AppName Compares",
  description:
    "See how AppName stacks up against other scheduling tools for service providers.",
  path: "/compare",
});

const comparisons = [
  {
    name: "AppName vs. Google Calendar",
    description:
      "Google Calendar is great for general scheduling, but it wasn't built for booking exchanges, approvals, or consumer self-service.",
  },
  {
    name: "AppName vs. Generic Scheduling Tool",
    description:
      "Generic scheduling tools offer broad functionality, but AppName focuses specifically on the provider-consumer relationship — exchanges, make-ups, and approvals.",
  },
  {
    name: "AppName vs. CRM Platforms",
    description:
      "CRM platforms cover client management broadly, but lack purpose-built booking exchange and scheduling coordination.",
  },
  {
    name: "AppName vs. Spreadsheets",
    description:
      "Spreadsheets are free but fragile. One wrong edit and your schedule is chaos. AppName gives you structure without the overhead.",
  },
];

export default function ComparePage() {
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
            How AppName compares
          </h1>
          <p className="text-stone-500 text-lg">
            Detailed comparisons coming soon. Here&apos;s a preview.
          </p>
        </div>

        <div className="space-y-4">
          {comparisons.map((comparison) => (
            <div
              key={comparison.name}
              className="p-6 rounded-[var(--ds-radius-lg)] border border-border bg-surface opacity-75"
            >
              <div className="flex items-center gap-3 mb-2">
                <ArrowLeftRight className="w-4 h-4 text-stone-400" />
                <h3 className="font-semibold text-foreground">
                  {comparison.name}
                </h3>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">
                {comparison.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
