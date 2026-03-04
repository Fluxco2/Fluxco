"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Zap, ArrowRight, ArrowLeft, ChevronDown, Shield, Factory, Cpu, Building2,
  Globe, Clock, DollarSign, CheckCircle, TrendingUp, Search, BarChart3,
  Users, Wrench, Bot, Sparkles, AlertTriangle, Eye, Target, Repeat,
} from "lucide-react";

const TOTAL_SECTIONS = 12;

/* ------------------------------------------------------------------ */
/*  Hook: animate numbers counting up                                  */
/* ------------------------------------------------------------------ */
function useCountUp(end: number, duration = 2000, trigger = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) { setValue(0); return; }
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setValue(end); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [trigger, end, duration]);
  return value;
}

/* ------------------------------------------------------------------ */
/*  Hook: intersection observer for scroll-triggered animations        */
/* ------------------------------------------------------------------ */
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold, root: null }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ------------------------------------------------------------------ */
/*  Animated grid background for title slide                           */
/* ------------------------------------------------------------------ */
function GridBackground() {
  return (
    <div className="grid-bg">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(45,140,255,0.06)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="grid-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="grid-mask">
            <rect width="100%" height="100%" fill="url(#grid-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#grid-mask)" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Scatter chart data — real bid data from FluxCo marketplace          */
/* ------------------------------------------------------------------ */
const CHART_DATA: { name: string; price: number; weeks: number; type: string; quality: number; recommended?: boolean }[] = [
  { name: "Supplier A", price: 195500, weeks: 20, type: "fluxco", quality: 7.0 },
  { name: "Supplier B", price: 367866, weeks: 22, type: "fluxco", quality: 8.5, recommended: true },
  { name: "Supplier C", price: 280000, weeks: 24, type: "fluxco", quality: 6.0 },
  { name: "Supplier D", price: 340000, weeks: 25, type: "fluxco", quality: 7.5 },
  { name: "Supplier E", price: 415000, weeks: 26, type: "fluxco", quality: 8.0 },
  { name: "Supplier F", price: 380000, weeks: 27, type: "client", quality: 6.5 },
  { name: "Supplier G", price: 305500, weeks: 28, type: "fluxco", quality: 9.0, recommended: true },
  { name: "Supplier H", price: 450000, weeks: 29, type: "fluxco", quality: 7.0 },
  { name: "Supplier I", price: 475000, weeks: 30, type: "fluxco", quality: 7.5 },
  { name: "Supplier J", price: 604737, weeks: 31, type: "client", quality: 7.5 },
  { name: "Supplier K", price: 520000, weeks: 32, type: "fluxco", quality: 6.0 },
  { name: "Supplier L", price: 550000, weeks: 33, type: "fluxco", quality: 7.0 },
  { name: "Supplier M", price: 1121100, weeks: 34, type: "fluxco", quality: 6.5 },
  { name: "Supplier N", price: 1197500, weeks: 35, type: "fluxco", quality: 7.0 },
  { name: "Supplier O", price: 610000, weeks: 36, type: "fluxco", quality: 8.0 },
  { name: "Supplier P", price: 635000, weeks: 37, type: "client", quality: 6.5 },
  { name: "Supplier Q", price: 660000, weeks: 38, type: "fluxco", quality: 7.0 },
  { name: "Supplier R", price: 572297, weeks: 40, type: "fluxco", quality: 8.5, recommended: true },
  { name: "Supplier S", price: 852068, weeks: 40, type: "client", quality: 7.0 },
  { name: "Supplier T", price: 981875, weeks: 41, type: "client", quality: 6.5 },
  { name: "Supplier U", price: 720000, weeks: 42, type: "fluxco", quality: 7.5 },
  { name: "Supplier V", price: 750000, weeks: 44, type: "fluxco", quality: 8.0 },
  { name: "Supplier W", price: 780000, weeks: 45, type: "fluxco", quality: 6.0 },
  { name: "Supplier X", price: 830000, weeks: 46, type: "fluxco", quality: 7.5 },
  { name: "Supplier Y", price: 967771, weeks: 48, type: "client", quality: 7.0 },
  { name: "Supplier Z", price: 642000, weeks: 50, type: "fluxco", quality: 7.5 },
  { name: "Supplier AA", price: 596730, weeks: 51, type: "fluxco", quality: 8.0 },
  { name: "Supplier AB", price: 890000, weeks: 52, type: "fluxco", quality: 7.0 },
  { name: "Supplier AC", price: 950000, weeks: 55, type: "client", quality: 8.0 },
  { name: "Supplier AD", price: 1050000, weeks: 58, type: "fluxco", quality: 6.5 },
  { name: "Supplier AE", price: 1150000, weeks: 60, type: "fluxco", quality: 7.0 },
  { name: "Supplier AF", price: 693790, weeks: 66, type: "fluxco", quality: 7.0 },
  { name: "Supplier AG", price: 1350000, weeks: 72, type: "fluxco", quality: 8.5 },
  { name: "Supplier AH", price: 1500000, weeks: 80, type: "client", quality: 7.0 },
  { name: "Supplier AI", price: 1650000, weeks: 90, type: "fluxco", quality: 8.0 },
  { name: "Supplier AJ", price: 729565, weeks: 94, type: "fluxco", quality: 8.0 },
  { name: "Supplier AK", price: 1800000, weeks: 110, type: "fluxco", quality: 7.5 },
  { name: "Supplier AL", price: 2200000, weeks: 140, type: "fluxco", quality: 9.0 },
  { name: "Supplier AM", price: 2000000, weeks: 159, type: "fluxco", quality: 9.5 },
  { name: "Supplier AN", price: 2750000, weeks: 214, type: "fluxco", quality: 9.5 },
];

function DeckScatterChart({ inView }: { inView: boolean }) {
  const maxPrice = 3000000;
  const maxWeeks = 220;
  const chartW = 900;
  const chartH = 400;
  const padL = 80;
  const padR = 30;
  const padT = 20;
  const padB = 50;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const x = (w: number) => padL + (w / maxWeeks) * plotW;
  const y = (p: number) => padT + plotH - (p / maxPrice) * plotH;

  const priceTicks = [0, 500000, 1000000, 1500000, 2000000, 2500000, 3000000];
  const weekTicks = [0, 50, 100, 150, 200];

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", height: "auto" }}>
      {priceTicks.map(p => (
        <g key={`p-${p}`}>
          <line x1={padL} y1={y(p)} x2={chartW - padR} y2={y(p)} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <text x={padL - 8} y={y(p) + 4} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="Inter">
            ${(p / 1000000).toFixed(1)}M
          </text>
        </g>
      ))}
      {weekTicks.map(w => (
        <g key={`w-${w}`}>
          <line x1={x(w)} y1={padT} x2={x(w)} y2={chartH - padB} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <text x={x(w)} y={chartH - padB + 16} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="Inter">
            {w} wks
          </text>
        </g>
      ))}
      <line x1={x(38)} y1={padT} x2={x(38)} y2={chartH - padB} stroke="rgba(230,57,70,0.5)" strokeWidth="1.5" strokeDasharray="4,4" />
      <text x={x(38) + 6} y={padT + 14} fill="#e63946" fontSize="8" fontFamily="JetBrains Mono" fontWeight="600">
        TARGET DELIVERY
      </text>
      <text x={chartW / 2} y={chartH - 5} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Inter" fontWeight="600" letterSpacing="1">
        TOTAL LEAD TIME (WEEKS)
      </text>
      <text x={14} y={chartH / 2} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Inter" fontWeight="600" letterSpacing="1" transform={`rotate(-90, 14, ${chartH / 2})`}>
        QUOTED PRICE ($)
      </text>
      {CHART_DATA.map((d, i) => {
        const cx = x(d.weeks);
        const cy = y(d.price);
        const isClient = d.type === "client";
        const isRec = d.recommended;
        const dotR = 3 + (d.quality / 10) * 4;
        return (
          <g key={d.name} style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "scale(1)" : "scale(0)",
            transformOrigin: `${cx}px ${cy}px`,
            transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.02}s`,
          }}>
            {isRec && <circle cx={cx} cy={cy} r={dotR + 6} fill="rgba(45,140,255,0.1)" stroke="rgba(45,140,255,0.3)" strokeWidth="0.5" />}
            <circle
              cx={cx} cy={cy}
              r={dotR}
              fill={isClient ? "#e63946" : isRec ? "#2d8cff" : "rgba(45,140,255,0.6)"}
              stroke={isRec ? "#2d8cff" : "none"}
              strokeWidth={isRec ? "1.5" : "0"}
            />
            {(isRec || d.price > 1800000 || d.price < 250000) && (
              <text
                x={cx}
                y={cy - dotR - 4}
                textAnchor="middle"
                fill={isClient ? "#e63946" : isRec ? "#2d8cff" : "rgba(255,255,255,0.45)"}
                fontSize="7"
                fontFamily="Inter"
                fontWeight={isRec ? "600" : "400"}
              >
                {d.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main deck component                                                */
/* ------------------------------------------------------------------ */
export default function Deck2Page() {
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const index = Math.round(container.scrollTop / window.innerHeight);
      setCurrentSection(Math.min(index, TOTAL_SECTIONS - 1));
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        goTo(Math.min(currentSection + 1, TOTAL_SECTIONS - 1));
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(Math.max(currentSection - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentSection]);

  const goTo = useCallback((index: number) => {
    containerRef.current?.scrollTo({
      top: index * window.innerHeight,
      behavior: "smooth",
    });
  }, []);

  /* Slide in-view trackers */
  const s1 = useInView(0.3);
  const s2 = useInView(0.2);
  const s3 = useInView(0.2);
  const s4 = useInView(0.2);
  const s5 = useInView(0.2);
  const s6 = useInView(0.2);
  const s7 = useInView(0.2);
  const s8 = useInView(0.2);
  const s8b = useInView(0.2);
  const s9 = useInView(0.2);
  const s10 = useInView(0.2);
  const s11 = useInView(0.2);

  /* Animated counters */
  const c85 = useCountUp(85, 1800, s3.inView);
  const c48 = useCountUp(48, 1800, s3.inView);
  const c6 = useCountUp(6, 1200, s3.inView);
  const c60 = useCountUp(60, 1600, s6.inView);
  const c40 = useCountUp(40, 1600, s6.inView);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Oswald:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <style>{deck2Styles}</style>

      {/* ---- PROGRESS BAR ---- */}
      <div className="d2-progress">
        {Array.from({ length: TOTAL_SECTIONS }).map((_, i) => (
          <button
            key={i}
            className={`d2-progress-dot ${i === currentSection ? "active" : ""} ${i < currentSection ? "past" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ---- NAV ---- */}
      <div className="d2-nav">
        <button className="d2-nav-btn" onClick={() => goTo(Math.max(currentSection - 1, 0))} aria-label="Previous">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="d2-nav-count">{String(currentSection + 1).padStart(2, "0")} / {TOTAL_SECTIONS}</span>
        <button className="d2-nav-btn" onClick={() => goTo(Math.min(currentSection + 1, TOTAL_SECTIONS - 1))} aria-label="Next">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {currentSection === 0 && (
        <div className="d2-scroll-hint" onClick={() => goTo(1)}>
          <ChevronDown className="w-5 h-5" />
        </div>
      )}

      <div ref={containerRef} className="d2-container">

        {/* ========== SLIDE 1 — TITLE ========== */}
        <section className="d2-slide" ref={s1.ref}>
          <GridBackground />
          <div className="d2-glow d2-glow-1" />
          <div className="d2-glow d2-glow-2" />
          <div className={`d2-title-content ${s1.inView ? "in" : ""}`}>
            <div className="d2-logo">
              <div className="d2-logo-icon"><Zap className="w-8 h-8" /></div>
              <span>FLUXCO</span>
            </div>
            <h1 className="d2-h1">
              <span className="d2-h1-line d2-h1-1">Rebuilding.</span>
              <span className="d2-h1-line d2-h1-2">American Power.</span>
            </h1>
            <p className="d2-subtitle">
              The US electrical grid is undergoing its largest expansion of all
              time, and transformers are its backbone. We&apos;re building the
              company to supply it.
            </p>
          </div>
        </section>

        {/* ========== SLIDE 2 — MARKET EXPLOSION ========== */}
        <section className="d2-slide d2-slide-dark" ref={s2.ref}>
          <div className="d2-bg-img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1753907537890-f20de9e116cc?w=1920&q=80)' }} />
          <div className={`d2-content ${s2.inView ? "in" : ""}`}>
            <div className="d2-slide-label">THE OPPORTUNITY</div>
            <h2 className="d2-h2">The Market Explosion</h2>
            <div className="d2-grid-2">
              <div className="d2-text-col">
                <p className="d2-p">
                  For two decades, US electricity demand was <strong>stagnant</strong>. Now, three massive forces are converging into the largest demand shock since rural electrification.
                </p>
                <div className="d2-drivers">
                  {[
                    { icon: <Cpu className="w-5 h-5" />, name: "AI & Data Centers", stat: "+450,000 GWh" },
                    { icon: <Building2 className="w-5 h-5" />, name: "Industrial Onshoring", stat: "+1,050,000 GWh" },
                    { icon: <Zap className="w-5 h-5" />, name: "EV & Electrification", stat: "+1,200,000 GWh" },
                  ].map((d, i) => (
                    <div key={d.name} className="d2-driver" style={{ animationDelay: `${0.3 + i * 0.15}s` }}>
                      <div className="d2-driver-icon">{d.icon}</div>
                      <div className="d2-driver-info">
                        <span className="d2-driver-name">{d.name}</span>
                        <span className="d2-driver-stat">{d.stat}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="d2-chart-wrap">
                <div className="d2-chart">
                  <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <line key={i} x1="70" y1={340 - i * 56} x2="540" y2={340 - i * 56} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    ))}
                    {/* Y labels */}
                    {[0, 50, 100, 150, 200, 250].map((v, i) => (
                      <text key={v} x="60" y={344 - i * 56} fill="rgba(255,255,255,0.35)" fontFamily="Inter" fontSize="10" textAnchor="end">{v}</text>
                    ))}
                    <text x="20" y="200" fill="rgba(255,255,255,0.35)" fontFamily="Inter" fontSize="10" textAnchor="middle" transform="rotate(-90 20,200)">CAPACITY (GW)</text>
                    {/* Right Y */}
                    {["$0", "$20B", "$40B", "$60B", "$80B"].map((v, i) => (
                      <text key={v} x="550" y={344 - i * 70} fill="rgba(196,30,58,0.6)" fontFamily="Inter" fontSize="10" textAnchor="start">{v}</text>
                    ))}
                    <text x="585" y="200" fill="rgba(196,30,58,0.5)" fontFamily="Inter" fontSize="10" textAnchor="middle" transform="rotate(90 585,200)">MARKET VALUE ($)</text>
                    {/* Bars */}
                    {[
                      { x: 85,  repl: 20, newD: 2,   label: "2005" },
                      { x: 150, repl: 18, newD: 3,   label: "2010" },
                      { x: 215, repl: 21, newD: 4,   label: "2015" },
                      { x: 280, repl: 23, newD: 5,   label: "2020" },
                      { x: 345, repl: 25, newD: 10,  label: "2025" },
                      { x: 410, repl: 35, newD: 110, label: "2030" },
                      { x: 475, repl: 40, newD: 190, label: "2035" },
                    ].map((b, i) => {
                      const pxPerGW = 280 / 250;
                      const replH = b.repl * pxPerGW;
                      const newH = b.newD * pxPerGW;
                      const replY = 340 - replH;
                      const newY = replY - newH;
                      return (
                        <g key={b.label}>
                          <rect x={b.x} y={replY} width="36" height={replH} rx="2" fill="rgba(255,255,255,0.15)" className={s2.inView ? "d2-bar-anim" : ""} style={{ animationDelay: `${0.5 + i * 0.1}s` }} />
                          <rect x={b.x} y={newY} width="36" height={newH} rx="2" fill="url(#barGrad)" className={s2.inView ? "d2-bar-anim" : ""} style={{ animationDelay: `${0.6 + i * 0.1}s` }} />
                          <text x={b.x + 18} y="360" fill="rgba(255,255,255,0.5)" fontFamily="JetBrains Mono, monospace" fontSize="10" textAnchor="middle">{b.label}</text>
                        </g>
                      );
                    })}
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--d2-blue)" />
                        <stop offset="100%" stopColor="rgba(45,140,255,0.4)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="d2-chart-legend">
                  <div className="d2-legend"><div className="d2-legend-swatch" style={{ background: "var(--d2-blue)" }} />New Demand</div>
                  <div className="d2-legend"><div className="d2-legend-swatch" style={{ background: "rgba(255,255,255,0.15)" }} />Replacement</div>
                </div>
              </div>
            </div>

            <div className="d2-quotes-row">
              <a href="https://x.com/oguzerkan/status/2016480187790065829" target="_blank" rel="noopener noreferrer" className="d2-quote">
                <div className="d2-quote-who">Elon Musk</div>
                <div className="d2-quote-text">&ldquo;The voltage transformer shortage is the main bottleneck for scaling AI right now.&rdquo;</div>
              </a>
              <a href="https://x.com/MarioNawfal/status/1852185875611791550" target="_blank" rel="noopener noreferrer" className="d2-quote">
                <div className="d2-quote-who">VP JD Vance <span style={{ opacity: 0.4 }}>on Joe Rogan</span></div>
                <div className="d2-quote-text">&ldquo;We should have a backup power transformer for every major system in the United States.&rdquo;</div>
              </a>
            </div>
            <p className="d2-source">Sources: Wood Mackenzie, EIA, Grid Strategies, S&amp;P Global, NREL</p>
          </div>
        </section>

        {/* ========== SLIDE 3 — OPAQUE MARKET ========== */}
        <section className="d2-slide" ref={s4.ref}>
          <div className="d2-glow d2-glow-3" />
          <div className={`d2-content ${s4.inView ? "in" : ""}`}>
            <div className="d2-slide-label">THE PROBLEM</div>
            <h2 className="d2-h2">A $20B+ Opaque Market</h2>
            <div className="d2-grid-2">
              <div className="d2-text-col">
                <p className="d2-p">
                  Historically, transformers were bought by utilities. Now, <strong>commercial and industrial buyers</strong> &mdash; data centers, manufacturers, developers &mdash; are buying directly. They&apos;re spending tens of millions on equipment they barely understand.
                </p>
                <p className="d2-p">
                  The market is wildly inefficient: hundreds of OEMs worldwide, all with terrible websites and a &ldquo;contact us&rdquo; form. No pricing transparency. No way to compare.
                </p>
                <div className="d2-callout">
                  <DollarSign className="w-5 h-5" />
                  <div>
                    <strong>Real example:</strong> We bid a 20 MVA unit. One supplier quoted <strong>$200K</strong>. Another quoted <strong>$1.3M</strong>. Same spec. <strong>6x price spread.</strong>
                  </div>
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: "16px 12px 8px" }}>
                <DeckScatterChart inView={s4.inView} />
                <div className="d2-chart-legend" style={{ marginTop: 8, justifyContent: "center", gap: 16, fontSize: 10 }}>
                  <div className="d2-legend"><div className="d2-legend-swatch" style={{ background: "var(--d2-blue)", width: 8, height: 8 }} />FluxCo Sourced</div>
                  <div className="d2-legend"><div className="d2-legend-swatch" style={{ background: "#e63946", width: 8, height: 8 }} />Client Sourced</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 4 — MARKETPLACE WEDGE ========== */}
        <section className="d2-slide" ref={s5.ref}>
          <div className="d2-glow d2-glow-4" />
          <div className={`d2-content ${s5.inView ? "in" : ""}`}>
            <div className="d2-slide-label" style={{ fontSize: 16, letterSpacing: 6, marginBottom: 16 }}>THE WEDGE</div>
            <h2 className="d2-h2">The FluxCo Marketplace</h2>
            <div className="d2-grid-2">
              <div className="d2-text-col">
                <h3 className="d2-h3">The Chief Transformer Officer</h3>
                <p className="d2-p">
                  It will never make sense for a procurement person to become a transformer expert. It&apos;s one of many things they buy &mdash; but one of the most expensive.
                </p>
                <p className="d2-p">
                  <strong>FluxCo becomes their CTO</strong> (Chief Transformer Officer). Our <strong>free Spec Builder</strong> automates the design, then we bid it across <strong>100+ OEMs</strong> worldwide.
                </p>
                <ul className="d2-checklist">
                  <li><strong>Full visibility:</strong> price, lead time, quality, certifications &mdash; side-by-side.</li>
                  <li><strong>Speed:</strong> What takes buyers weeks of calls, we do in hours.</li>
                  <li><strong>Revenue:</strong> We automate the process EPCs typically take 10–20% on in a <strong>$20B+ annual US market</strong>.</li>
                </ul>
              </div>
              <div className="d2-flow-col">
                <div className="d2-flow">
                  {[
                    { icon: <Target className="w-7 h-7" />, label: "Customer Spec", active: false, href: null },
                    { icon: <Zap className="w-7 h-7" />, label: "FluxCo Spec Builder", active: true, href: "https://fluxco.com/specbuilder" },
                    { icon: <BarChart3 className="w-7 h-7" />, label: "100+ OEM Bids", active: false, href: null },
                  ].map((step, i) => (
                    <div key={step.label} className="d2-flow-group" style={{ animationDelay: `${0.3 + i * 0.25}s` }}>
                      {i > 0 && <div className="d2-flow-arrow"><ArrowRight className="w-5 h-5" /></div>}
                      {step.href ? (
                        <a href={step.href} target="_blank" rel="noopener noreferrer" className={`d2-flow-step active d2-pulse-glow`} style={{ textDecoration: "none", cursor: "pointer" }}>
                          <div className="d2-flow-icon">{step.icon}</div>
                          <div className="d2-flow-label">{step.label}</div>
                          <div className="d2-try-it">Try it live &rarr;</div>
                        </a>
                      ) : (
                        <div className={`d2-flow-step ${step.active ? "active" : ""}`}>
                          <div className="d2-flow-icon">{step.icon}</div>
                          <div className="d2-flow-label">{step.label}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="d2-intel-card">
                  <Eye className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <strong>The Secret Weapon</strong>
                    <p className="d2-p" style={{ fontSize: 13, marginBottom: 0, marginTop: 4 }}>
                      Every bid teaches us who supplies what, at what price, at what lead time. We&apos;re building the most comprehensive market intelligence engine in the industry.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 5 — MANUFACTURING VISION ========== */}
        <section className="d2-slide d2-slide-dark" ref={s6.ref}>
          <div className="d2-bg-img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1619885067109-e1dbec4e7cd0?w=1920&q=80)' }} />
          <div className={`d2-content ${s6.inView ? "in" : ""}`}>
            <div className="d2-slide-label">THE PRODUCT</div>
            <h2 className="d2-h2">Perfect the Process</h2>
            <p className="d2-p" style={{ maxWidth: 800, marginBottom: 24 }}>
              The transformer is proven technology. What&apos;s broken is <strong>how they&apos;re built</strong> &mdash; hand-cut steel, hand-stacked cores, hand-wound coils. We use <strong>non-deterministic automation</strong> so a custom product flows through the line like a repetitive one.
            </p>
            <div className="d2-tech-grid">
              {[
                { icon: <Cpu className="w-5 h-5" />, title: "CNC Laser Cutting", desc: "Precision electrical steel. Sub-mm tolerances, no die changes." },
                { icon: <Bot className="w-5 h-5" />, title: "Vision-Guided Stacking", desc: "Robotic arms adapt to any core geometry. Thousands of laminations." },
                { icon: <Wrench className="w-5 h-5" />, title: "Adaptive CNC Winding", desc: "Any coil spec without retooling. Recipe-driven, not jig-driven." },
                { icon: <Eye className="w-5 h-5" />, title: "AI Quality Control", desc: "Machine vision on every part. Automated PD and impedance testing." },
              ].map((t, i) => (
                <div key={t.title} className="d2-tech-card" style={{ animationDelay: `${0.3 + i * 0.12}s` }}>
                  <div className="d2-tech-icon">{t.icon}</div>
                  <strong>{t.title}</strong>
                  <span>{t.desc}</span>
                </div>
              ))}
            </div>
            <div className="d2-metric-row">
              {[
                { value: `-${c60}%`, label: "Production Time" },
                { value: `-${c40}%`, label: "Labor Cost" },
                { value: "\u221E", label: "Variants" },
                { value: "100%", label: "Inspected" },
              ].map((m, i) => (
                <div key={m.label} className="d2-metric" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                  <div className="d2-metric-val">{m.value}</div>
                  <div className="d2-metric-label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== SLIDE 6 — LEAPFROG ========== */}
        <section className="d2-slide d2-slide-dark" ref={s7.ref}>
          <div className="d2-bg-img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1647427060118-4911c9821b82?w=1920&q=80)' }} />
          <div className={`d2-content ${s7.inView ? "in" : ""}`}>
            <div className="d2-slide-label">THE ADVANTAGE</div>
            <h2 className="d2-h2">The Industrial Leapfrog</h2>
            <p className="d2-p" style={{ maxWidth: 800, marginBottom: 32 }}>
              Incumbents invested billions in <strong>manual-labor factories</strong> they can&apos;t walk away from. Their process hasn&apos;t changed in decades. <strong>FluxCo starts unencumbered.</strong>
            </p>
            <div className="d2-compare">
              <div className="d2-compare-box d2-compare-legacy">
                <div className="d2-compare-header">Legacy Process</div>
                {["Manual die cutting & hand stacking", "Fixed tooling per design", "One-off engineering per order", "Human visual inspection", "Weeks-long test cycles", "Billions in sunk CapEx"].map((item, i) => (
                  <div key={i} className="d2-compare-item" style={{ animationDelay: `${0.4 + i * 0.08}s` }}>{item}</div>
                ))}
              </div>
              <div className="d2-compare-arrow">
                <ArrowRight className="w-8 h-8" />
              </div>
              <div className="d2-compare-box d2-compare-flux">
                <div className="d2-compare-header">FluxCo Process</div>
                {["CNC laser cut + robotic stacking", "Vision-guided adaptive automation", "Recipe-driven, infinite variations", "AI inspection at line speed", "Automated test in hours", "Zero legacy baggage"].map((item, i) => (
                  <div key={i} className="d2-compare-item" style={{ animationDelay: `${0.5 + i * 0.08}s` }}>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 7 — MOATS ========== */}
        <section className="d2-slide" ref={s8.ref}>
          <div className="d2-glow d2-glow-5" />
          <div className={`d2-content ${s8.inView ? "in" : ""}`}>
            <div className="d2-slide-label">DEFENSIBILITY</div>
            <h2 className="d2-h2">Structural Moats</h2>
            <div className="d2-moats">
              {[
                { icon: <Shield className="w-6 h-6" />, title: "Industrial Security", points: ["100% domestic, FEOC-free — the only safe choice for tax-credit projects.", "IRA 45X credits strip 30–50% from FEOC-tainted projects. We're immune.", "Zero tariff exposure. Zero trade war risk."] },
                { icon: <Sparkles className="w-6 h-6" />, title: "Efficiency Mandate", points: ["DOE 2029 standards require leaps legacy GOES steel can't meet.", "Industry must shift to amorphous steel. Incumbents can't retool.", "Smart bolt-on tech (monitoring, SCADA) adds differentiation."] },
                { icon: <Bot className="w-6 h-6" />, title: "Automation Advantage", points: ["Robotics neutralize Asian labor arbitrage.", "Building locally saves ~20% on shipping massive steel units.", "Vertical integration from raw amorphous steel to finished product."] },
                { icon: <BarChart3 className="w-6 h-6" />, title: "Market Intelligence", points: ["Real-time pricing, lead time, and capacity data across 100+ OEMs.", "We know exactly what to build and where the margin is.", "No other manufacturer has this data advantage."] },
              ].map((moat, i) => (
                <div key={moat.title} className="d2-moat" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
                  <div className="d2-moat-icon">{moat.icon}</div>
                  <h3 className="d2-moat-title">{moat.title}</h3>
                  <ul className="d2-moat-list">
                    {moat.points.map((p, j) => <li key={j}>{p}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <p className="d2-source">Sources: U.S. Treasury (IRA 45X), DOE Efficiency Standards (2024), NIST MEP</p>
          </div>
        </section>

        {/* ========== SLIDE 8 — MONETIZATION ========== */}
        <section className="d2-slide" ref={s8b.ref}>
          <div className="d2-glow d2-glow-5" />
          <div className={`d2-content ${s8b.inView ? "in" : ""}`}>
            <div className="d2-slide-label">MONETIZATION</div>
            <h2 className="d2-h2">How We Make Money</h2>

            <div className="d2-rev-stats">
              {[
                { value: "15–25%", label: "Marketplace Take Rate" },
                { value: "$20B+", label: "Addressable Market" },
                { value: "Recurring", label: "TaaS Revenue" },
              ].map((stat) => (
                <div key={stat.label} className="d2-rev-stat">
                  <div className="d2-rev-stat-value">{stat.value}</div>
                  <div className="d2-rev-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="d2-rev-grid">
              {[
                { icon: <DollarSign className="w-6 h-6" />, title: "Marketplace Commission", points: ["15–25% take rate on every transaction.", "Volume grows as OEM network expands.", "Higher margins on complex/custom specs."] },
                { icon: <TrendingUp className="w-6 h-6" />, title: "OEM Volume Pricing", points: ["Negotiate volume discounts across OEM network.", "Customer sees market price, FluxCo captures the spread.", "Looks custom to buyer — commodity to us."] },
                { icon: <Repeat className="w-6 h-6" />, title: "Transformer as a Service", points: ["Leasing model for companies that don't want to own.", "Recurring monthly revenue per unit.", "Lower barrier to entry for customers."] },
                { icon: <Wrench className="w-6 h-6" />, title: "Warranty & Fleet Service", points: ["Service contracts across full deployed fleet.", "Scale advantage: hundreds of units = predictable revenue.", "Cross-sell upgrades, monitoring, replacements."] },
              ].map((card, i) => (
                <div key={card.title} className="d2-rev-card" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
                  <div className="d2-rev-card-icon">{card.icon}</div>
                  <h3 className="d2-rev-card-title">{card.title}</h3>
                  <ul className="d2-rev-card-list">
                    {card.points.map((p, j) => <li key={j}>{p}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            <div className="d2-rev-insight">
              &ldquo;Every unit looks like a custom order to the customer. To us, it&apos;s a commodity we&apos;ve seen a thousand times.&rdquo;
            </div>
          </div>
        </section>

        {/* ========== SLIDE 9 — TEAM ========== */}
        <section className="d2-slide" ref={s9.ref}>
          <div className="d2-glow d2-glow-6" />
          <div className={`d2-content ${s9.inView ? "in" : ""}`}>
            <div className="d2-slide-label">THE TEAM</div>
            <h2 className="d2-h2">Built to Execute</h2>
            <div className="d2-team-grid">
              {[
                {
                  photo: "/team/brian.jpg",
                  name: "Brian Tochman",
                  title: "CEO",
                  bio: "Co-Founder of Trust Ventures. Operator and investor across deep tech, energy, and industrial sectors.",
                  linkedin: "https://www.linkedin.com/in/briantochman/",
                },
                {
                  photo: "/team/eric.jpg",
                  name: "Eric Hobby",
                  title: "Head of Manufacturing",
                  bio: "Deep tech specialist with transformer industry expertise. UT McCombs MBA.",
                  linkedin: "https://www.linkedin.com/in/eric-hobby-8261a4101/",
                },
                {
                  photo: "/team/casey.jpg",
                  name: "Casey Wu",
                  title: "CFO",
                  bio: "Venture capital and finance background. Texas A&M engineering. Oversees capital strategy and operations.",
                  linkedin: "https://www.linkedin.com/in/casey-wu-486a751/",
                },
                {
                  photo: "/team/benji.jpg",
                  name: "Benji Miller",
                  title: "CTO",
                  bio: "Technical operations leader in transformer manufacturing. Johns Hopkins engineering.",
                  linkedin: "https://www.linkedin.com/in/benjimiller-1/",
                },
              ].map((member, i) => (
                <a
                  key={member.name}
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="d2-team-card"
                  style={{ animationDelay: `${0.2 + i * 0.15}s`, textDecoration: "none" }}
                >
                  <div className="d2-team-photo">
                    <img src={member.photo} alt={member.name} />
                  </div>
                  <div className="d2-team-name">{member.name}</div>
                  <div className="d2-team-title">{member.title}</div>
                  <div className="d2-team-bio">{member.bio}</div>
                </a>
              ))}
            </div>

            <div className="d2-logo-strip">
              <div className="d2-logo-strip-label">Previously at</div>
              <div className="d2-logo-row">
                {([
                  { src: "/logos/platinum-equity.png", alt: "Platinum Equity", withText: "", stacked: false },
                  { src: "/logos/trust-ventures.svg", alt: "Trust Ventures", withText: "TRUST VENTURES", stacked: true },
                  { src: "/logos/bell.png", alt: "Bell Helicopter", withText: "BELL", stacked: false },
                  { src: "/logos/cia.png", alt: "CIA", withText: "CENTRAL\nINTELLIGENCE\nAGENCY", stacked: false },
                  { src: "/logos/houlihan-lokey.png", alt: "Houlihan Lokey", withText: "", stacked: false },
                  { src: "/logos/tesla.png", alt: "Tesla", withText: "", stacked: false },
                ] as const).map((logo) => (
                  <div key={logo.alt} className={`d2-logo-item ${logo.withText ? "d2-logo-combo" : ""} ${logo.stacked ? "d2-logo-stacked" : ""}`}>
                    {logo.withText ? (
                      <>
                        <img src={logo.src} alt={logo.alt} className="d2-logo-color" />
                        <span className="d2-logo-text d2-logo-text-sm">{logo.withText}</span>
                      </>
                    ) : (
                      <img src={logo.src} alt={logo.alt} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 9 — ROADMAP ========== */}
        <section className="d2-slide d2-slide-dark" ref={s10.ref}>
          <div className="d2-bg-img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1745448797901-2a4c9d9af1c1?w=1920&q=80)' }} />
          <div className={`d2-content ${s10.inView ? "in" : ""}`}>
            <div className="d2-slide-label">THE PLAN</div>
            <h2 className="d2-h2">Roadmap to Independence</h2>
            <div className="d2-timeline">
              {[
                { year: "2026", title: "Marketplace & Assembly", desc: "Launch marketplace to aggregate demand and collect intelligence. First US assembly lines for immediate FEOC-compliant delivery. Revenue from day one." },
                { year: "2027", title: "Vertical Integration", desc: "Break ground on automated factory: CNC laser cutting, vision-guided robotic stacking, and adaptive CNC winding. Full domestic production." },
                { year: "2028+", title: "Gigafactory Scale", desc: "Full robotic production. Raw material independence. Largest domestic transformer manufacturer delivering thousands of units annually." },
              ].map((item, i) => (
                <div key={item.year} className="d2-tl-item" style={{ animationDelay: `${0.3 + i * 0.25}s` }}>
                  <div className="d2-tl-dot" />
                  <div className="d2-tl-year">{item.year}</div>
                  <div className="d2-tl-title">{item.title}</div>
                  <div className="d2-tl-desc">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== SLIDE 10 — CLOSING ========== */}
        <section className="d2-slide d2-slide-dark" ref={s11.ref}>
          <div className="d2-bg-img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1641618640134-fd5a58f1d225?w=1920&q=80)' }} />
          <div className={`d2-closing ${s11.inView ? "in" : ""}`}>
            <div className="d2-logo-icon d2-closing-logo"><Zap className="w-10 h-10" /></div>
            <h2 className="d2-closing-h2">Powering the Renaissance</h2>
            <p className="d2-closing-p">
              Transformers are the backbone of the American grid. The product is proven. We&apos;re making it great &mdash; by building the most advanced manufacturing process the industry has ever seen, starting with the smartest marketplace.
            </p>
            <a href="mailto:brian@fluxco.com" className="d2-cta">
              Let&apos;s Talk <ArrowRight className="w-4 h-4" />
            </a>
            <div className="d2-closing-contact">
              <span>brian@fluxco.com</span>
              <span className="d2-dot" />
              <span>fluxco.com</span>
            </div>
          </div>
        </section>

        {/* ========== APPENDIX — THE CRISIS ========== */}
        <section className="d2-slide d2-slide-dark" ref={s3.ref}>
          <div className="d2-bg-img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1619033476025-71cc6bd8c3f5?w=1920&q=80)' }} />
          <div className={`d2-content ${s3.inView ? "in" : ""}`}>
            <div className="d2-slide-label">APPENDIX</div>
            <h2 className="d2-h2">Everything Is Offshore</h2>
            <div className="d2-grid-2">
              <div className="d2-text-col">
                <p className="d2-p">
                  Over decades, the US outsourced virtually all transformer manufacturing to India, China, and Southeast Asia. What little &ldquo;domestic&rdquo; supply remains is largely Mexican assembly.
                </p>
                <p className="d2-p">
                  Demand has exploded. Lead times have gone from <strong>12 months to 48+ months</strong>. Every utility and data center operator in the country is desperate for supply.
                </p>
                <ul className="d2-checklist">
                  <li><strong>Tariffs:</strong> 25%+ on imported units, rising under every administration.</li>
                  <li><strong>IRA 45X Credits:</strong> Only for domestically manufactured, FEOC-compliant equipment.</li>
                  <li><strong>National Security:</strong> Executive orders classify transformers as critical infrastructure.</li>
                </ul>
                <p className="d2-p d2-highlight">Everyone wants American-made. It barely exists.</p>
              </div>
              <div className="d2-stats-col">
                {[
                  { value: c85, suffix: "%", label: "Production Offshore" },
                  { value: c48, suffix: "mo", label: "Average Lead Time" },
                  { value: c6, suffix: "x", label: "Price Spread, Same Unit" },
                ].map((s, i) => (
                  <div key={s.label} className="d2-big-stat" style={{ animationDelay: `${0.4 + i * 0.2}s` }}>
                    <div className="d2-big-stat-num">{s.value}<span className="d2-big-stat-suffix">{s.suffix}</span></div>
                    <div className="d2-big-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="d2-source">Sources: DOE, U.S. Treasury (IRA 30D/45X), ACORE, T&amp;D World</p>
          </div>
        </section>

      </div>
    </>
  );
}

/* =====================================================================
   STYLES
   ===================================================================== */
const deck2Styles = `
  :root {
    --d2-blue: #2d8cff;
    --d2-red: #e63946;
    --d2-bg: #08090a;
    --d2-surface: rgba(255,255,255,0.04);
    --d2-border: rgba(255,255,255,0.08);
    --d2-text: rgba(255,255,255,0.7);
    --d2-text-dim: rgba(255,255,255,0.4);
    --d2-radius: 12px;
  }

  *, *::before, *::after { box-sizing: border-box; }
  html, body { background: var(--d2-bg) !important; overflow: hidden !important; max-width: 100vw; }

  /* ---- SCROLL CONTAINER ---- */
  .d2-container {
    position: fixed; inset: 0;
    overflow-y: scroll; overflow-x: hidden;
    scroll-snap-type: y mandatory;
    -webkit-overflow-scrolling: touch;
    z-index: 1;
  }

  .d2-slide {
    min-height: 100vh; min-height: 100dvh;
    width: 100%; display: flex;
    flex-direction: column; justify-content: center; align-items: center;
    scroll-snap-align: start;
    position: relative; overflow: hidden;
    background: var(--d2-bg);
  }

  /* ---- BACKGROUNDS ---- */
  .d2-bg-img {
    position: absolute; inset: 0;
    background-size: cover; background-position: center;
    opacity: 0.15;
  }
  .d2-slide-dark::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(8,9,10,0.6) 0%, rgba(8,9,10,0.92) 100%);
    z-index: 0;
  }
  .d2-slide-dark .d2-content,
  .d2-slide-dark .d2-closing { position: relative; z-index: 1; }

  .grid-bg {
    position: absolute; inset: 0; z-index: 0;
    opacity: 0.8;
  }

  /* Glowing orbs */
  .d2-glow {
    position: absolute; border-radius: 50%;
    filter: blur(120px); pointer-events: none; z-index: 0;
  }
  .d2-glow-1 {
    width: 600px; height: 600px; top: -100px; right: -100px;
    background: rgba(45,140,255,0.08);
    animation: d2-float 8s ease-in-out infinite;
  }
  .d2-glow-2 {
    width: 400px; height: 400px; bottom: -50px; left: 10%;
    background: rgba(230,57,70,0.05);
    animation: d2-float 10s ease-in-out infinite reverse;
  }
  .d2-glow-3 {
    width: 500px; height: 500px; top: 20%; right: -100px;
    background: rgba(45,140,255,0.06);
    animation: d2-float 9s ease-in-out infinite;
  }
  .d2-glow-4 {
    width: 500px; height: 500px; bottom: 10%; left: -100px;
    background: rgba(45,140,255,0.05);
    animation: d2-float 11s ease-in-out infinite reverse;
  }
  .d2-glow-5 {
    width: 600px; height: 600px; top: 30%; left: 30%;
    background: rgba(45,140,255,0.04);
    animation: d2-float 12s ease-in-out infinite;
  }

  @keyframes d2-float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -20px) scale(1.05); }
  }

  /* ---- PROGRESS BAR ---- */
  .d2-progress {
    position: fixed; right: 24px; top: 50%; transform: translateY(-50%);
    z-index: 100; display: flex; flex-direction: column; gap: 8px;
  }
  .d2-progress-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: rgba(255,255,255,0.15); border: none;
    cursor: pointer; padding: 0;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .d2-progress-dot.active {
    background: var(--d2-blue);
    height: 24px; border-radius: 4px;
    box-shadow: 0 0 12px rgba(45,140,255,0.4);
  }
  .d2-progress-dot.past { background: rgba(45,140,255,0.3); }
  .d2-progress-dot:hover { background: rgba(255,255,255,0.4); }

  /* ---- NAV ---- */
  .d2-nav {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    z-index: 100; display: flex; align-items: center; gap: 12px;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(20px);
    border: 1px solid var(--d2-border); border-radius: 100px;
    padding: 8px 8px 8px 8px;
  }
  .d2-nav-btn {
    width: 36px; height: 36px; border-radius: 50%;
    background: transparent; border: 1px solid var(--d2-border);
    color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .d2-nav-btn:hover { background: var(--d2-blue); border-color: var(--d2-blue); }
  .d2-nav-count {
    font-family: 'JetBrains Mono', monospace; font-size: 12px;
    color: var(--d2-text-dim); padding: 0 8px;
    letter-spacing: 1px;
  }

  .d2-scroll-hint {
    position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
    z-index: 100; color: var(--d2-text-dim); cursor: pointer;
    animation: d2-bounce 2s ease-in-out infinite;
  }
  @keyframes d2-bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(8px); }
  }

  /* ---- CONTENT WRAPPER ---- */
  .d2-content {
    padding: 60px 80px; width: 100%; max-width: 1300px;
    margin: 0 auto; z-index: 1;
  }

  /* ---- ANIMATIONS ---- */
  .d2-content.in .d2-slide-label,
  .d2-content.in .d2-h2,
  .d2-content.in .d2-grid-2,
  .d2-content.in .d2-quotes-row,
  .d2-content.in .d2-source,
  .d2-content.in .d2-tech-grid,
  .d2-content.in .d2-metric-row,
  .d2-content.in .d2-compare,
  .d2-content.in .d2-moats,
  .d2-content.in .d2-rev-stats,
  .d2-content.in .d2-rev-grid,
  .d2-content.in .d2-rev-insight,
  .d2-content.in .d2-team-grid,
  .d2-content.in .d2-logo-strip,
  .d2-content.in .d2-timeline,
  .d2-content.in > .d2-p {
    animation: d2-fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .d2-content .d2-slide-label { opacity: 0; animation-delay: 0s; }
  .d2-content .d2-h2 { opacity: 0; animation-delay: 0.1s; }
  .d2-content > .d2-p { opacity: 0; animation-delay: 0.2s; }
  .d2-content .d2-grid-2 { opacity: 0; animation-delay: 0.15s; }
  .d2-content .d2-quotes-row { opacity: 0; animation-delay: 0.3s; }
  .d2-content .d2-source { opacity: 0; animation-delay: 0.35s; }
  .d2-content .d2-tech-grid { opacity: 0; animation-delay: 0.2s; }
  .d2-content .d2-metric-row { opacity: 0; animation-delay: 0.4s; }
  .d2-content .d2-compare { opacity: 0; animation-delay: 0.2s; }
  .d2-content .d2-moats { opacity: 0; animation-delay: 0.15s; }
  .d2-content .d2-rev-stats { opacity: 0; animation-delay: 0.15s; }
  .d2-content .d2-rev-grid { opacity: 0; animation-delay: 0.25s; }
  .d2-content .d2-rev-insight { opacity: 0; animation-delay: 0.5s; }
  .d2-content .d2-team-grid { opacity: 0; animation-delay: 0.2s; }
  .d2-content .d2-logo-strip { opacity: 0; animation-delay: 0.8s; }
  .d2-content .d2-timeline { opacity: 0; animation-delay: 0.2s; }

  @keyframes d2-fade-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .d2-title-content {
    position: relative; z-index: 2;
    padding: 80px; max-width: 900px;
  }
  .d2-title-content .d2-logo,
  .d2-title-content .d2-h1-line,
  .d2-title-content .d2-subtitle {
    opacity: 0; transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .d2-title-content.in .d2-logo { opacity: 1; transform: translateY(0); transition-delay: 0.1s; }
  .d2-title-content.in .d2-h1-1 { opacity: 1; transform: translateY(0); transition-delay: 0.25s; }
  .d2-title-content.in .d2-h1-2 { opacity: 1; transform: translateY(0); transition-delay: 0.45s; }
  .d2-title-content.in .d2-subtitle { opacity: 1; transform: translateY(0); transition-delay: 0.65s; }

  /* ---- LOGO ---- */
  .d2-logo {
    display: flex; align-items: center; gap: 12px;
    font-family: 'Oswald', sans-serif; font-weight: 700;
    font-size: 28px; color: #fff; letter-spacing: 3px;
    text-transform: uppercase; margin-bottom: 32px;
  }
  .d2-logo-icon {
    width: 48px; height: 48px; border-radius: 10px;
    background: linear-gradient(135deg, var(--d2-blue), rgba(45,140,255,0.3));
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    box-shadow: 0 0 30px rgba(45,140,255,0.3);
    animation: d2-pulse 3s ease-in-out infinite;
  }
  @keyframes d2-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(45,140,255,0.2); }
    50% { box-shadow: 0 0 40px rgba(45,140,255,0.4); }
  }

  /* ---- TYPOGRAPHY ---- */
  .d2-h1 {
    display: flex; flex-direction: column; gap: 0;
    margin: 0 0 32px 0;
  }
  .d2-h1-line {
    font-family: 'Oswald', sans-serif; font-weight: 700;
    font-size: clamp(56px, 9vw, 100px); line-height: 0.95;
    text-transform: uppercase; display: block;
  }
  .d2-h1-1 { color: #fff; }
  .d2-h1-2 { color: var(--d2-blue); }

  .d2-subtitle {
    font-family: 'Inter', sans-serif; font-size: clamp(16px, 1.8vw, 20px);
    color: var(--d2-text); max-width: 600px; line-height: 1.6; font-weight: 400;
  }

  .d2-slide-label {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: var(--d2-blue); letter-spacing: 3px; text-transform: uppercase;
    font-weight: 500; margin-bottom: 12px;
  }

  .d2-h2 {
    font-family: 'Oswald', sans-serif; color: #fff;
    font-size: clamp(32px, 4.5vw, 48px); font-weight: 700;
    text-transform: uppercase; margin: 0 0 28px 0; line-height: 1.1;
  }

  .d2-h3 {
    font-family: 'Oswald', sans-serif; color: #fff;
    font-size: 20px; font-weight: 500;
    text-transform: uppercase; margin-bottom: 14px;
    letter-spacing: 0.5px;
  }

  .d2-p {
    color: var(--d2-text); font-size: 15px; line-height: 1.7;
    margin-bottom: 14px; font-family: 'Inter', sans-serif;
  }
  .d2-p strong { color: #fff; font-weight: 600; }
  .d2-highlight { color: var(--d2-blue) !important; font-weight: 500 !important; }

  .d2-checklist { list-style: none; padding: 0; margin: 16px 0; }
  .d2-checklist li {
    position: relative; padding-left: 28px; margin-bottom: 12px;
    color: var(--d2-text); font-size: 14px; line-height: 1.6;
    font-family: 'Inter', sans-serif;
  }
  .d2-checklist li::before {
    content: ''; position: absolute; left: 0; top: 4px;
    width: 16px; height: 16px; border-radius: 50%;
    background: rgba(45,140,255,0.1); border: 1.5px solid var(--d2-blue);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232d8cff' stroke-width='3'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E");
    background-size: 10px; background-position: center; background-repeat: no-repeat;
  }
  .d2-checklist li strong { color: #fff; }

  .d2-source {
    font-family: 'Inter', sans-serif; font-size: 10px;
    color: var(--d2-text-dim); margin-top: 24px;
    text-transform: uppercase; letter-spacing: 1px;
  }

  /* ---- LAYOUTS ---- */
  .d2-grid-2 {
    display: grid; grid-template-columns: 1fr 1.1fr;
    gap: 48px; align-items: start;
  }

  /* ---- DRIVER CARDS (slide 2) ---- */
  .d2-drivers { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
  .d2-driver {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px; border-radius: var(--d2-radius);
    background: var(--d2-surface); border: 1px solid var(--d2-border);
    transition: all 0.3s;
  }
  .d2-driver:hover { border-color: rgba(45,140,255,0.3); background: rgba(45,140,255,0.05); }
  .d2-driver-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: rgba(45,140,255,0.1);
    display: flex; align-items: center; justify-content: center;
    color: var(--d2-blue); flex-shrink: 0;
  }
  .d2-driver-info { display: flex; flex-direction: column; gap: 2px; }
  .d2-driver-name { font-family: 'Inter', sans-serif; font-size: 14px; color: #fff; font-weight: 600; }
  .d2-driver-stat { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--d2-red); font-weight: 600; }

  /* ---- CHART ---- */
  .d2-chart-wrap { display: flex; flex-direction: column; }
  .d2-chart {
    background: rgba(255,255,255,0.02); border: 1px solid var(--d2-border);
    border-radius: var(--d2-radius) var(--d2-radius) 0 0;
    padding: 20px; aspect-ratio: 3 / 2;
    display: flex; align-items: center; justify-content: center;
  }
  .d2-chart-legend {
    display: flex; justify-content: center; gap: 24px;
    padding: 10px 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid var(--d2-border); border-top: none;
    border-radius: 0 0 var(--d2-radius) var(--d2-radius);
  }
  .d2-legend {
    font-family: 'Inter', sans-serif; font-size: 10px;
    color: var(--d2-text-dim); text-transform: uppercase; font-weight: 600;
    display: flex; align-items: center; gap: 6px; letter-spacing: 0.5px;
  }
  .d2-legend-swatch { width: 10px; height: 10px; border-radius: 2px; }
  .d2-legend-line { height: 2px !important; width: 14px !important; border-radius: 1px; }

  .d2-bar-anim { animation: d2-bar-grow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-origin: bottom; }
  @keyframes d2-bar-grow {
    from { transform: scaleY(0); opacity: 0; }
    to { transform: scaleY(1); opacity: 1; }
  }

  /* ---- QUOTES ---- */
  .d2-quotes-row { display: flex; gap: 16px; margin-top: 20px; }
  .d2-quote {
    flex: 1; padding: 16px 20px;
    border: 1px solid rgba(230,57,70,0.2); border-radius: var(--d2-radius);
    background: rgba(230,57,70,0.03);
    text-decoration: none; transition: all 0.3s; cursor: pointer;
  }
  .d2-quote:hover { background: rgba(230,57,70,0.08); border-color: rgba(230,57,70,0.4); transform: translateY(-2px); }
  .d2-quote-who {
    font-family: 'Inter', sans-serif; font-size: 10px;
    color: var(--d2-red); text-transform: uppercase; letter-spacing: 1.5px;
    font-weight: 700; margin-bottom: 6px;
  }
  .d2-quote-text {
    font-family: 'Inter', sans-serif; font-size: 14px;
    color: rgba(255,255,255,0.8); font-style: italic; line-height: 1.5;
  }

  /* ---- BIG STATS (slide 3) ---- */
  .d2-stats-col {
    display: flex; flex-direction: column; gap: 0;
    background: var(--d2-surface); border: 1px solid var(--d2-border);
    border-radius: var(--d2-radius); overflow: hidden;
  }
  .d2-big-stat {
    text-align: center; padding: 32px 24px;
    border-bottom: 1px solid var(--d2-border);
  }
  .d2-big-stat:last-child { border-bottom: none; }
  .d2-big-stat-num {
    font-family: 'Oswald', sans-serif; font-size: 64px; font-weight: 700;
    color: var(--d2-red); line-height: 1;
  }
  .d2-big-stat-suffix { font-size: 32px; opacity: 0.6; }
  .d2-big-stat-label {
    font-family: 'Inter', sans-serif; font-size: 11px;
    color: var(--d2-text-dim); text-transform: uppercase;
    letter-spacing: 1.5px; margin-top: 8px;
  }

  /* ---- CALLOUT ---- */
  .d2-callout {
    display: flex; gap: 14px; padding: 16px 20px;
    background: rgba(45,140,255,0.04); border: 1px solid rgba(45,140,255,0.15);
    border-radius: var(--d2-radius); margin-top: 16px;
    color: var(--d2-text); font-family: 'Inter', sans-serif; font-size: 14px;
    line-height: 1.6;
  }
  .d2-callout svg { color: var(--d2-blue); flex-shrink: 0; margin-top: 2px; }
  .d2-callout strong { color: #fff; }

  /* ---- PROBLEM CARDS (slide 4) ---- */
  .d2-problem-cards { display: flex; flex-direction: column; gap: 12px; }
  .d2-problem-card {
    display: flex; align-items: center; gap: 16px;
    padding: 18px 20px; border-radius: var(--d2-radius);
    background: var(--d2-surface); border: 1px solid var(--d2-border);
    font-family: 'Inter', sans-serif; font-size: 14px; color: var(--d2-text);
    transition: all 0.3s;
  }
  .d2-problem-card:hover { border-color: rgba(45,140,255,0.3); transform: translateX(4px); }
  .d2-problem-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: rgba(230,57,70,0.08); border: 1px solid rgba(230,57,70,0.15);
    display: flex; align-items: center; justify-content: center;
    color: var(--d2-red); flex-shrink: 0;
  }

  /* ---- FLOW (slide 5) ---- */
  .d2-flow-col { display: flex; flex-direction: column; gap: 24px; }
  .d2-flow { display: flex; align-items: center; justify-content: center; gap: 0; }
  .d2-flow-group { display: flex; align-items: center; gap: 0; }
  .d2-flow-arrow { color: var(--d2-text-dim); padding: 0 12px; }
  .d2-flow-step {
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    padding: 24px 20px; border-radius: var(--d2-radius);
    background: var(--d2-surface); border: 1px solid var(--d2-border);
    min-width: 130px; transition: all 0.3s;
  }
  .d2-flow-step.active {
    border-color: var(--d2-blue);
    background: rgba(45,140,255,0.06);
    box-shadow: 0 0 30px rgba(45,140,255,0.1);
  }
  .d2-flow-icon { color: var(--d2-blue); }
  .d2-flow-label {
    font-family: 'Inter', sans-serif; font-size: 11px;
    color: #fff; text-align: center; text-transform: uppercase;
    font-weight: 600; letter-spacing: 0.5px;
  }

  .d2-pulse-glow {
    animation: d2-spec-pulse 2.5s ease-in-out infinite !important;
  }
  @keyframes d2-spec-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(45,140,255,0.15); }
    50% { box-shadow: 0 0 40px rgba(45,140,255,0.4), 0 0 60px rgba(45,140,255,0.15); }
  }
  .d2-try-it {
    font-family: 'Inter', sans-serif; font-size: 10px;
    color: var(--d2-blue); text-transform: uppercase;
    letter-spacing: 1px; font-weight: 600; margin-top: 4px;
    opacity: 0.8;
  }
  .d2-pulse-glow:hover { transform: translateY(-3px); }
  .d2-pulse-glow:hover .d2-try-it { opacity: 1; }

  .d2-intel-card {
    display: flex; gap: 14px; padding: 20px;
    background: rgba(45,140,255,0.04); border: 1px solid rgba(45,140,255,0.15);
    border-radius: var(--d2-radius);
  }
  .d2-intel-card svg { color: var(--d2-blue); margin-top: 2px; }
  .d2-intel-card strong {
    font-family: 'Inter', sans-serif; font-size: 14px; color: #fff;
    display: block;
  }

  /* ---- TECH GRID (slide 6) ---- */
  .d2-tech-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 14px; margin-bottom: 20px;
  }
  .d2-tech-card {
    display: flex; flex-direction: column; gap: 8px;
    padding: 20px; border-radius: var(--d2-radius);
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--d2-border);
    backdrop-filter: blur(10px);
    transition: all 0.3s;
  }
  .d2-tech-card:hover { border-color: rgba(45,140,255,0.3); transform: translateY(-3px); }
  .d2-tech-icon { color: var(--d2-blue); }
  .d2-tech-card strong { color: #fff; font-family: 'Inter', sans-serif; font-size: 13px; }
  .d2-tech-card span { color: var(--d2-text-dim); font-family: 'Inter', sans-serif; font-size: 12px; line-height: 1.5; }

  .d2-metric-row { display: flex; gap: 14px; }
  .d2-metric {
    flex: 1; text-align: center; padding: 16px 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--d2-border); border-radius: var(--d2-radius);
  }
  .d2-metric-val {
    font-family: 'Oswald', sans-serif; font-size: 28px; font-weight: 700;
    color: #fff; line-height: 1;
  }
  .d2-metric-label {
    font-family: 'Inter', sans-serif; font-size: 10px;
    color: var(--d2-text-dim); text-transform: uppercase;
    letter-spacing: 0.5px; margin-top: 6px;
  }

  /* ---- COMPARE (slide 7) ---- */
  .d2-compare {
    display: flex; align-items: stretch; gap: 24px;
    max-width: 900px; margin: 0 auto;
  }
  .d2-compare-box {
    flex: 1; border-radius: var(--d2-radius); padding: 28px; overflow: hidden;
  }
  .d2-compare-legacy {
    background: rgba(255,255,255,0.03); border: 1px solid var(--d2-border);
  }
  .d2-compare-flux {
    background: rgba(45,140,255,0.04); border: 1px solid rgba(45,140,255,0.2);
  }
  .d2-compare-header {
    font-family: 'Oswald', sans-serif; font-size: 14px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;
  }
  .d2-compare-legacy .d2-compare-header { color: var(--d2-text-dim); }
  .d2-compare-flux .d2-compare-header { color: var(--d2-blue); }
  .d2-compare-item {
    font-family: 'Inter', sans-serif; font-size: 13px;
    padding: 10px 0; border-bottom: 1px solid var(--d2-border);
  }
  .d2-compare-legacy .d2-compare-item { color: var(--d2-text-dim); }
  .d2-compare-flux .d2-compare-item { color: rgba(255,255,255,0.8); border-color: rgba(45,140,255,0.1); }
  .d2-compare-item:last-child { border-bottom: none; }
  .d2-compare-arrow {
    display: flex; align-items: center; color: var(--d2-blue); flex-shrink: 0;
  }

  /* ---- MOATS (slide 8) ---- */
  .d2-moats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .d2-moat {
    padding: 28px; border-radius: var(--d2-radius);
    background: var(--d2-surface); border: 1px solid var(--d2-border);
    transition: all 0.3s;
  }
  .d2-moat:hover { border-color: rgba(45,140,255,0.3); transform: translateY(-2px); }
  .d2-moat-icon { color: var(--d2-blue); margin-bottom: 14px; }
  .d2-moat-title {
    font-family: 'Oswald', sans-serif; font-size: 16px; font-weight: 600;
    color: #fff; text-transform: uppercase; margin-bottom: 12px;
    letter-spacing: 0.5px;
  }
  .d2-moat-list { list-style: none; padding: 0; margin: 0; }
  .d2-moat-list li {
    font-family: 'Inter', sans-serif; font-size: 13px;
    color: var(--d2-text); line-height: 1.6;
    padding: 6px 0 6px 20px; position: relative;
  }
  .d2-moat-list li::before {
    content: ''; position: absolute; left: 0; top: 12px;
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(45,140,255,0.4);
  }

  /* ---- MONETIZATION (slide 8) ---- */
  .d2-rev-stats {
    display: flex; gap: 24px; margin-bottom: 28px;
  }
  .d2-rev-stat {
    flex: 1; text-align: center; padding: 20px;
    border-radius: var(--d2-radius); background: var(--d2-surface);
    border: 1px solid var(--d2-border);
  }
  .d2-rev-stat-value {
    font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 700;
    color: var(--d2-blue); margin-bottom: 4px;
  }
  .d2-rev-stat-label {
    font-family: 'Inter', sans-serif; font-size: 13px;
    color: var(--d2-text); text-transform: uppercase; letter-spacing: 0.5px;
  }
  .d2-rev-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .d2-rev-card {
    padding: 28px; border-radius: var(--d2-radius);
    background: var(--d2-surface); border: 1px solid var(--d2-border);
    transition: all 0.3s;
  }
  .d2-rev-card:hover { border-color: rgba(45,140,255,0.3); transform: translateY(-2px); }
  .d2-rev-card-icon { color: var(--d2-blue); margin-bottom: 14px; }
  .d2-rev-card-title {
    font-family: 'Oswald', sans-serif; font-size: 16px; font-weight: 600;
    color: #fff; text-transform: uppercase; margin-bottom: 12px;
    letter-spacing: 0.5px;
  }
  .d2-rev-card-list { list-style: none; padding: 0; margin: 0; }
  .d2-rev-card-list li {
    font-family: 'Inter', sans-serif; font-size: 13px;
    color: var(--d2-text); line-height: 1.6;
    padding: 6px 0 6px 20px; position: relative;
  }
  .d2-rev-card-list li::before {
    content: ''; position: absolute; left: 0; top: 12px;
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(45,140,255,0.4);
  }
  .d2-rev-insight {
    margin-top: 24px; padding: 20px 24px;
    border-left: 3px solid var(--d2-blue);
    background: rgba(45,140,255,0.05); border-radius: 0 var(--d2-radius) var(--d2-radius) 0;
    font-family: 'Inter', sans-serif; font-size: 15px; font-style: italic;
    color: rgba(255,255,255,0.85); line-height: 1.6;
  }

  /* ---- TEAM (slide 9) ---- */
  .d2-team-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  .d2-team-card {
    display: flex; flex-direction: column; align-items: center;
    gap: 12px; padding: 32px 20px; border-radius: var(--d2-radius);
    background: var(--d2-surface); border: 1px solid var(--d2-border);
    text-align: center; transition: all 0.3s; cursor: pointer;
  }
  .d2-team-card:hover { border-color: rgba(45,140,255,0.3); transform: translateY(-4px); box-shadow: 0 0 30px rgba(45,140,255,0.1); }
  .d2-team-photo {
    width: 100px; height: 100px; border-radius: 50%; overflow: hidden;
    border: 2px solid rgba(45,140,255,0.3);
    box-shadow: 0 0 20px rgba(45,140,255,0.1);
  }
  .d2-team-photo img { width: 100%; height: 100%; object-fit: cover; }
  .d2-team-name {
    font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600;
    color: #fff;
  }
  .d2-team-title {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: var(--d2-blue); text-transform: uppercase; letter-spacing: 1.5px;
    font-weight: 500;
  }
  .d2-team-bio {
    font-family: 'Inter', sans-serif; font-size: 13px;
    color: var(--d2-text); line-height: 1.5;
  }
  .d2-glow-6 {
    width: 500px; height: 500px; top: 20%; right: 10%;
    background: rgba(45,140,255,0.05);
    animation: d2-float 10s ease-in-out infinite;
  }

  /* ---- LOGO STRIP (team slide) ---- */
  .d2-logo-strip {
    margin-top: 40px; text-align: center; width: 100%;
  }
  .d2-logo-strip-label {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: var(--d2-text); text-transform: uppercase; letter-spacing: 2px;
    margin-bottom: 20px; opacity: 0.6;
  }
  .d2-logo-row {
    display: flex; align-items: center; justify-content: center;
    gap: 36px; flex-wrap: wrap;
  }
  .d2-logo-item {
    height: 32px; display: flex; align-items: center;
  }
  .d2-logo-item img {
    height: 100%; width: auto; object-fit: contain;
    filter: brightness(0) invert(1); opacity: 0.45;
    transition: opacity 0.3s;
  }
  .d2-logo-item:hover img { opacity: 0.8; }
  .d2-logo-text {
    font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 700;
    letter-spacing: 3px; color: #fff; opacity: 0.45;
    transition: opacity 0.3s;
  }
  .d2-logo-item:hover .d2-logo-text { opacity: 0.8; }
  .d2-logo-combo {
    display: flex; align-items: center; gap: 8px; height: auto;
  }
  .d2-logo-combo img.d2-logo-color {
    height: 36px; width: auto; object-fit: contain;
    filter: brightness(0) invert(1) !important; opacity: 0.45; transition: opacity 0.3s;
  }
  .d2-logo-combo:hover img.d2-logo-color { opacity: 0.8; }
  .d2-logo-text-sm {
    font-size: 10px; letter-spacing: 2px; line-height: 1.3;
    white-space: pre-line; text-align: left;
  }
  .d2-logo-stacked {
    flex-direction: column; gap: 4px; height: auto;
  }
  .d2-logo-stacked .d2-logo-text-sm {
    text-align: center; font-size: 8px; letter-spacing: 2.5px;
  }

  /* ---- TIMELINE (slide 9) ---- */
  .d2-timeline {
    display: flex; gap: 0; position: relative;
    margin-top: 48px; padding-top: 40px;
  }
  .d2-timeline::before {
    content: ''; position: absolute; top: 46px; left: 0; right: 0;
    height: 2px; background: linear-gradient(90deg, var(--d2-blue), rgba(45,140,255,0.1));
  }
  .d2-tl-item {
    flex: 1; position: relative; text-align: center; padding-top: 32px;
  }
  .d2-tl-dot {
    position: absolute; top: -2px; left: 50%; transform: translateX(-50%);
    width: 14px; height: 14px; border-radius: 50%;
    background: var(--d2-bg); border: 3px solid var(--d2-blue);
    box-shadow: 0 0 12px rgba(45,140,255,0.3);
  }
  .d2-tl-year {
    font-family: 'Oswald', sans-serif; font-size: 42px; font-weight: 700;
    color: var(--d2-blue); margin-bottom: 8px;
  }
  .d2-tl-title {
    font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 700;
    color: #fff; margin-bottom: 10px;
  }
  .d2-tl-desc {
    font-family: 'Inter', sans-serif; font-size: 13px;
    color: var(--d2-text); line-height: 1.6;
    max-width: 280px; margin: 0 auto;
  }

  /* ---- CLOSING (slide 10) ---- */
  .d2-closing {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; z-index: 2; padding: 80px; max-width: 800px;
  }
  .d2-closing .d2-logo-icon,
  .d2-closing .d2-closing-h2,
  .d2-closing .d2-closing-p,
  .d2-closing .d2-cta,
  .d2-closing .d2-closing-contact {
    opacity: 0; transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .d2-closing.in .d2-logo-icon { opacity: 1; transform: translateY(0); transition-delay: 0.1s; }
  .d2-closing.in .d2-closing-h2 { opacity: 1; transform: translateY(0); transition-delay: 0.3s; }
  .d2-closing.in .d2-closing-p { opacity: 1; transform: translateY(0); transition-delay: 0.5s; }
  .d2-closing.in .d2-cta { opacity: 1; transform: translateY(0); transition-delay: 0.7s; }
  .d2-closing.in .d2-closing-contact { opacity: 1; transform: translateY(0); transition-delay: 0.85s; }

  .d2-closing-logo { margin-bottom: 24px; }
  .d2-closing-h2 {
    font-family: 'Oswald', sans-serif; font-size: clamp(36px, 5vw, 56px);
    font-weight: 700; color: #fff; text-transform: uppercase;
    margin-bottom: 20px;
  }
  .d2-closing-p {
    font-family: 'Inter', sans-serif; font-size: 17px;
    color: var(--d2-text); line-height: 1.6; margin-bottom: 32px;
  }
  .d2-cta {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
    color: #fff; letter-spacing: 2px; text-transform: uppercase;
    padding: 16px 32px; border-radius: 100px;
    background: linear-gradient(135deg, var(--d2-blue), rgba(45,140,255,0.7));
    text-decoration: none; transition: all 0.3s;
    box-shadow: 0 0 30px rgba(45,140,255,0.2);
  }
  .d2-cta:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(45,140,255,0.4); }
  .d2-closing-contact {
    display: flex; align-items: center; gap: 16px;
    margin-top: 32px;
    font-family: 'Inter', sans-serif; font-size: 14px; color: var(--d2-text-dim);
  }
  .d2-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--d2-text-dim); }

  /* ---- MOBILE ---- */
  @media (max-width: 768px) {
    html, body { overflow: auto !important; }
    .d2-container {
      position: relative !important; inset: auto !important;
      overflow-y: visible !important; scroll-snap-type: none !important;
    }
    .d2-slide {
      min-height: auto; padding: 48px 0;
      scroll-snap-align: none;
    }
    .d2-slide:first-child, .d2-slide:last-child { min-height: 100vh; min-height: 100svh; padding: 0; }
    .d2-content { padding: 24px 20px; }
    .d2-title-content { padding: 40px 24px; }
    .d2-grid-2 { grid-template-columns: 1fr; gap: 24px; }
    .d2-h2 { font-size: 28px; }
    .d2-h3 { font-size: 17px; }
    .d2-p { font-size: 14px; }
    .d2-tech-grid { grid-template-columns: 1fr 1fr; }
    .d2-moats { grid-template-columns: 1fr; }
    .d2-rev-stats { flex-wrap: wrap; }
    .d2-rev-stat { min-width: calc(50% - 12px); }
    .d2-rev-grid { grid-template-columns: 1fr; }
    .d2-team-grid { grid-template-columns: 1fr 1fr; }
    .d2-logo-row { gap: 24px; }
    .d2-logo-item { height: 24px; }
    .d2-compare { flex-direction: column; }
    .d2-compare-arrow { transform: rotate(90deg); justify-content: center; }
    .d2-flow { flex-direction: column; }
    .d2-flow-arrow { transform: rotate(90deg); }
    .d2-flow-step { width: 100%; min-width: 0; }
    .d2-timeline { flex-direction: column; gap: 32px; }
    .d2-timeline::before { display: none; }
    .d2-tl-item { text-align: left; padding-left: 30px; padding-top: 0; border-left: 2px solid rgba(45,140,255,0.3); }
    .d2-tl-dot { left: -8px; top: 4px; transform: none; width: 12px; height: 12px; }
    .d2-progress { display: none; }
    .d2-nav { display: none; }
    .d2-scroll-hint { display: none; }
    .d2-quotes-row { flex-direction: column; }
    .d2-closing { padding: 48px 24px; }
    .d2-metric-row { flex-wrap: wrap; }
    .d2-metric { min-width: calc(50% - 7px); }
    .d2-big-stat-num { font-size: 48px; }
  }
`;
