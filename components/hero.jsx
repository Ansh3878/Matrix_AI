"use client";


import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { motion } from "motion/react";
import { LinkPreview } from "@/components/ui/link-preview";

const HeroSection = () => {
  const imageRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
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
          Accelerate your professional growth through intelligent coaching that combines AI to unlock executive-level opportunities.
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
        
            <Button size="lg" variant="outline" className="px-8">
            <LinkPreview url="https://www.youtube.com/embed/HuihDhJ5i9o?si=wD5bMl1qC4s98QdV" className="font-bold">
            Watch Demo
        </LinkPreview>
             
            </Button>
        
        </div>
        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div 
            ref={imageRef} 
            className={`hero-image ${isScrolled ? 'scrolled' : ''}`}
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