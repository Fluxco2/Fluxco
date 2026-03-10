"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Network, Briefcase, FileText } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const HeroSection = () => {
  const [rfpCount, setRfpCount] = useState(1247);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const intervalsRef = useRef([2000, 4000, 6000, 3000, 9000]);
  const indexRef = useRef(0);

  useEffect(() => {
    const scheduleNextUpdate = () => {
      const delay = intervalsRef.current[indexRef.current];
      indexRef.current = (indexRef.current + 1) % intervalsRef.current.length;
      
      intervalRef.current = setTimeout(() => {
        setRfpCount(prev => prev + Math.floor(Math.random() * 3) + 1);
        scheduleNextUpdate();
      }, delay);
    };

    scheduleNextUpdate();

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28">
      {/* Background Video with Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover brightness-50"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/30 to-transparent" />
      </div>

      {/* Ranch Pattern Overlay */}
      <div className="absolute inset-0 ranch-pattern opacity-5 z-10" />

      {/* Content */}
      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border-2 border-primary/40 px-5 py-2 mb-8 animate-fade-up">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary text-sm font-semibold uppercase tracking-widest font-display">
              Global Network • One Stop Shop
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none mb-6 animate-fade-up-delay-1">
            <span className="text-foreground">ONE CALL.</span>
            <br />
            <span className="text-gradient">GLOBAL POWER.</span>
          </h1>

          {/* Subheading */}
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mb-10 animate-fade-up-delay-2">
            Your complete transformer partner. Full engineering, procurement & construction services through a single trusted source.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-16 animate-fade-up-delay-3">
            <Button
              variant="hero"
              size="xl"
              asChild
            >
              <Link href="/specbuilder">
                AI Spec Builder
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button 
              variant="heroOutline" 
              size="xl"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Our Services
            </Button>
            <Button 
              variant="heroOutline" 
              size="xl"
              asChild
            >
              <Link href="/careers">
                <Briefcase className="w-5 h-5 mr-2" />
                We're Hiring
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl animate-fade-up-delay-3">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-primary" />
              <div>
                <div className="font-display text-2xl text-foreground">100+</div>
                <div className="text-muted-foreground text-sm">Global Partners</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <div className="font-display text-2xl text-foreground flex items-center gap-2">
                  {rfpCount.toLocaleString()}
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div className="text-muted-foreground text-sm">RFP Responses</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Network className="w-8 h-8 text-primary" />
              <div>
                <div className="font-display text-2xl text-foreground">Real-Time</div>
                <div className="text-muted-foreground text-sm">Order Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warm Glow */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/15 rounded-full blur-[150px] z-0" />
    </section>
  );
};

export default HeroSection;
