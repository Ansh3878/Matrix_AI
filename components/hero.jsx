"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Lazy-load motion — the full Framer Motion bundle is ~60KB gzipped
const MotionDiv = dynamic(
  () => import("motion/react").then((m) => m.motion.div),
  { ssr: false }
);

// Lazy-load LinkPreview — it calls api.microlink.io on mount, don't block page
const LinkPreview = dynamic(
  () => import("@/components/ui/link-preview").then((m) => m.LinkPreview),
  { ssr: false, loading: () => <span>Watch Demo</span> }
);

const HeroSection = () => {
  const imageRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    // Use passive listener for scroll — much better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="w-full pt-36 md:pt-48 pb-10">
      <div className="space-y-6 text-center">
        <div className="space-y-6 mx-auto">
          <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title animate-gradient">
            AI-Powered Career Platform and
            <br />
            AI-Driven Career Optimization
          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Accelerate your professional growth through intelligent coaching
            that combines AI to unlock executive-level opportunities.
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>

          <Button size="lg" variant="outline" className="px-8">
            <LinkPreview
              url="https://www.youtube.com/watch?v=HuihDhJ5i9o"
              isStatic={true}
              imageSrc="https://img.youtube.com/vi/HuihDhJ5i9o/maxresdefault.jpg"
              width={240}
              height={135}
              className="font-bold"
            >
              Watch Demo
            </LinkPreview>
          </Button>
        </div>
        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div
            ref={imageRef}
            className={`hero-image ${isScrolled ? "scrolled" : ""}`}
          >
            <Image
              src="/banner.jpg"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;