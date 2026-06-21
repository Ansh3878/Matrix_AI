"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  StarsIcon,
  ChevronDown,
  FileText,
  PenBox,
  GraduationCap,
  BriefcaseBusiness,
  Newspaper,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { usePathname } from "next/navigation";

const tools = [
  {
    label: "Build Resume",
    href: "/resume",
    icon: FileText,
    color: "bg-blue-500/15 text-blue-400",
    hoverColor: "hover:bg-blue-500/10",
    description: "Craft a standout resume",
  },
  {
    label: "Cover Letter",
    href: "/ai-cover-letter",
    icon: PenBox,
    color: "bg-purple-500/15 text-purple-400",
    hoverColor: "hover:bg-purple-500/10",
    description: "AI-tailored cover letters",
  },
  {
    label: "Interview Prep",
    href: "/interview",
    icon: GraduationCap,
    color: "bg-emerald-500/15 text-emerald-400",
    hoverColor: "hover:bg-emerald-500/10",
    description: "Ace your next interview",
  },
  {
    label: "Job Search",
    href: "/jobs",
    icon: BriefcaseBusiness,
    color: "bg-amber-500/15 text-amber-400",
    hoverColor: "hover:bg-amber-500/10",
    description: "Find the right opportunity",
  },
  {
    label: "Tech News",
    href: "/news-feed",
    icon: Newspaper,
    color: "bg-rose-500/15 text-rose-400",
    hoverColor: "hover:bg-rose-500/10",
    description: "Stay ahead of the curve",
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full border-b border-white/5 bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/navbar-logo.png"
            alt="matrix-logo"
            width={150}
            height={50}
            className="h-24 w-auto object-contain"
          />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          <SignedIn>
            {/* Industry Insights button */}
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200 rounded-lg px-3 h-9"
              >
                <LayoutDashboard className="h-4 w-4" />
                Industry Insights
              </Button>
              <Button
                variant="ghost"
                className="md:hidden w-9 h-9 p-0 rounded-lg hover:bg-white/5"
              >
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </Link>

            {/* Growth Tools Dropdown */}
            <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  className="flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{ outline: "none" }}
                >
                  <StarsIcon className="h-4 w-4" />
                  <span className="hidden md:block">Growth Tools</span>
                  <ChevronDown
                    className="h-3.5 w-3.5 transition-transform duration-300 ease-in-out"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-72 p-3 rounded-2xl border border-white/8 bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/40"
              >
                {/* Header label */}
                <div className="px-2 pb-2 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
                    Growth Tools
                  </p>
                </div>

                {/* Tool items */}
                <div className="flex flex-col gap-0.5">
                  {tools.map((tool, i) => {
                    const Icon = tool.icon;
                    const isActive = pathname === tool.href;
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setOpen(false)}
                        className={`
                          group flex items-center gap-3 px-3 py-2.5 rounded-xl
                          transition-all duration-200 ease-out
                          ${tool.hoverColor}
                          ${isActive ? "bg-white/8 ring-1 ring-white/10" : ""}
                          hover:translate-x-0.5
                        `}
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        {/* Icon pill */}
                        <span
                          className={`
                            flex items-center justify-center w-8 h-8 rounded-lg shrink-0
                            ${tool.color}
                            transition-transform duration-200 group-hover:scale-110
                          `}
                        >
                          <Icon className="h-4 w-4" />
                        </span>

                        {/* Text */}
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-foreground leading-tight">
                            {tool.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground/70 leading-tight truncate">
                            {tool.description}
                          </span>
                        </div>

                        {/* Active dot */}
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <Button variant="outline" className="h-9 px-4 rounded-lg text-sm">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 ring-2 ring-white/10 hover:ring-white/20 transition-all duration-200 rounded-full",
                  userButtonPopoverCard: "shadow-2xl rounded-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}