import Link from "next/link";
import { Button } from "@/components/ui";
import {
  Briefcase,
  Calendar,
  Users,
  ArrowLeftRight,
  Clock,
  Shield,
  Bell,
  ArrowRight,
} from "lucide-react";

// [Template] — Landing page structure. Replace hero copy, features, and steps with your product's content.

const features = [
  {
    icon: Calendar,
    title: "Smart scheduling",
    description:
      "Manage all your bookings in one place. Consumers see availability and book directly.",
  },
  {
    icon: Users,
    title: "Consumer management",
    description:
      "Keep contact info, booking notes, and schedules in one organized dashboard.",
  },
  {
    icon: ArrowLeftRight,
    title: "Consumer-to-consumer exchanges",
    description:
      "Consumers find compatible exchange partners themselves — you just approve.",
  },
  {
    icon: Clock,
    title: "Make-up requests",
    description:
      "Consumers request make-up bookings from your available slots, no phone tag needed.",
  },
  {
    icon: Shield,
    title: "Approval workflows",
    description:
      "Every change goes through you first. Stay in control with one-tap approvals.",
  },
  {
    icon: Bell,
    title: "Email notifications",
    description:
      "Automatic reminders and updates keep everyone on the same page.",
  },
];

const steps = [
  {
    number: "1",
    title: "Create your account",
    description: "Sign up and add your consumers in minutes.",
  },
  {
    number: "2",
    title: "Invite your consumers",
    description: "They get a link to view bookings and request exchanges.",
  },
  {
    number: "3",
    title: "Focus on what matters",
    description: "Spend less time scheduling, more time delivering value.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border transition-all duration-300">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-display)] text-foreground">
              AppName
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/signin">
              <Button variant="ghost" className="text-[#6b5c4f] hover:text-foreground">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-primary text-white hover:bg-primary/90 rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-14 pb-16 md:pt-20 md:pb-24">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary-light/5 blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto flex flex-col items-center text-center px-8">
            <span className="inline-block mb-6 rounded-full border border-primary/20 bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium">
              Built for service providers
            </span>

            <h1 className="max-w-3xl text-4xl leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Less scheduling.
              <br />
              <span className="text-primary">More doing.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-[#6b5c4f] leading-relaxed">
              AppName handles scheduling, make-ups, and consumer exchanges
              for service providers — so you get your time back.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="rounded-full bg-primary text-white hover:bg-primary/90 px-8 text-base shadow-lg shadow-primary/25"
                >
                  Get started free
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full px-8 text-base border-border text-foreground hover:bg-surface-hover"
                >
                  Sign in
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-[#6b5c4f]">
              Free for up to 5 consumers. No credit card required.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-20 bg-[#f7f2eb]/60">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mx-auto max-w-2xl text-center mb-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-foreground">
                Everything you need to run your business
              </h2>
              <p className="mt-4 text-lg text-[#6b5c4f]">
                Built specifically for the way service providers work.
              </p>
            </div>

            <div className="mx-auto max-w-5xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-border bg-surface p-7 transition-all hover:shadow-md hover:border-primary/20"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6b5c4f]">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mx-auto max-w-2xl text-center mb-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-foreground">
                How it works
              </h2>
            </div>

            <div className="mx-auto max-w-4xl grid gap-10 md:grid-cols-3 md:gap-6">
              {steps.map((step, i) => (
                <div
                  key={step.number}
                  className="relative flex flex-col items-center text-center"
                >
                  {i < steps.length - 1 && (
                    <div className="absolute top-7 left-[calc(50%+28px)] hidden h-px w-[calc(100%-56px)] bg-border md:block" />
                  )}

                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white text-xl font-[family-name:var(--font-display)] shadow-lg shadow-primary/20">
                    {step.number}
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#6b5c4f] max-w-[240px]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-14 md:py-20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mx-auto max-w-3xl rounded-3xl bg-[var(--warm-dark)] px-8 py-12 text-center md:px-16 md:py-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-white">
                Ready to simplify your business?
              </h2>
              <p className="mt-4 text-lg text-white/70 max-w-md mx-auto">
                Spend less time on admin and more time delivering value to your consumers.
              </p>
              <Link href="/auth/signup" className="mt-8 inline-block">
                <Button
                  size="lg"
                  className="rounded-full bg-primary text-white hover:bg-primary/90 px-8 text-base shadow-lg shadow-primary/30"
                >
                  Get started free
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 md:flex-row md:justify-between px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold font-[family-name:var(--font-display)] text-foreground">
              AppName
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-[#6b5c4f]">
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link href="/tools" className="hover:text-foreground transition-colors">
              Tools
            </Link>
            <Link href="/compare" className="hover:text-foreground transition-colors">
              Compare
            </Link>
          </nav>
          <p className="text-sm text-[#6b5c4f]">
            Built for service providers.
          </p>
        </div>
      </footer>
    </div>
  );
}
