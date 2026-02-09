import Link from "next/link";
import { Briefcase } from "lucide-react";
import type { ReactNode } from "react";

// [Template] — Split-panel auth layout with branding panel and form panel. Reuse for signin, signup, forgot-password.

interface AuthLayoutProps {
  heading: string;
  subheading?: string;
  children: ReactNode;
}

export default function AuthLayout({ heading, subheading, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — desktop only */}
      <div className="hidden lg:flex lg:w-[45%] bg-[var(--warm-dark)] text-white flex-col justify-between p-12 relative overflow-hidden">
        <Link href="/" className="flex items-center gap-2.5 text-white/80 hover:text-white transition-colors relative">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="font-[family-name:var(--font-display)] text-2xl tracking-tight">AppName</span>
        </Link>

        <div className="relative">
          <h1 className="font-[family-name:var(--font-display)] text-3xl leading-snug mb-3">{heading}</h1>
          {subheading && (
            <p className="text-white/50 text-lg leading-relaxed">{subheading}</p>
          )}
        </div>

        <p className="text-white/30 text-sm relative">
          Built for service providers.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile header */}
        <div className="lg:hidden px-4 py-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-xl tracking-tight">AppName</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
