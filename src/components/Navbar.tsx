"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { Briefcase } from "lucide-react";

// [Template] — Authenticated navigation bar with role-based routing (provider, consumer, admin).

export default function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isAdmin = (session?.user as any)?.isAdmin;
  const profileImage = (session?.user as any)?.profileImage;
  const pathname = usePathname();

  const dashboardPath = isAdmin
    ? "/admin"
    : role === "PROVIDER"
      ? "/dashboard/provider"
      : "/dashboard/consumer";
  const isOnDashboard = session && pathname === dashboardPath;

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isOnDashboard) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("resetTab"));
    }
  };

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav className="sticky top-0 z-50 border-b border-border px-4 sm:px-6 py-3 backdrop-blur-sm bg-surface/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href={session ? dashboardPath : "/"}
          onClick={handleLogoClick}
          className="flex items-center gap-2 font-semibold text-xl tracking-tight text-foreground"
        >
          <Briefcase className="w-5 h-5 text-primary" />
          AppName
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {session ? (
            <>
              {profileImage ? (
                <img
                  src={profileImage}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/10"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {initials}
                  </span>
                </div>
              )}
              <span className="text-sm text-muted hidden sm:inline">
                {session.user?.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="text-sm text-muted hover:text-foreground transition-all duration-150"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
