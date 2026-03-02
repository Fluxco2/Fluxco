"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Zap, ArrowRight, ArrowLeft, ChevronDown, Globe, Clock,
  DollarSign, CheckCircle, Factory, Search, FileText, Shield,
  Award, MapPin, Users, AlertTriangle, Package,
} from "lucide-react";
import type { ProposalProject, ProposalQuote, ProposalStats } from "@/types/notion";

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                  */
/* ------------------------------------------------------------------ */
function formatCurrency(n: number | null): string {
  if (n == null) return "\u2014";
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function weeksFromNow(dateStr: string | null): number {
  if (!dateStr) return 0;
  const now = new Date();
  const target = new Date(dateStr + "T00:00:00");
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.round(diff / (7 * 24 * 60 * 60 * 1000)));
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
/*  Animated grid background                                           */
/* ------------------------------------------------------------------ */
function GridBackground() {
  return (
    <div className="ap-grid-bg">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="ap-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(45,140,255,0.06)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="ap-grid-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="ap-grid-mask">
            <rect width="100%" height="100%" fill="url(#ap-grid-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#ap-grid)" mask="url(#ap-grid-mask)" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  World map background with OEM location pins                         */
/*  Equirectangular projection: x = (lon+180)/360*1000, y = (90-lat)/180*500 */
/* ------------------------------------------------------------------ */
function lonLatToXY(lon: number, lat: number): [number, number] {
  return [(lon + 180) / 360 * 1000, (90 - lat) / 180 * 500];
}

const OEM_LOCATIONS: { lon: number; lat: number; label: string }[] = [
  // China
  { lon: 113.3, lat: 23.1, label: "Guangdong" },
  { lon: 119.4, lat: 32.4, label: "Jiangsu/Yawei" },
  { lon: 118.8, lat: 32.1, label: "Nanjing/CEEG" },
  { lon: 116.4, lat: 39.9, label: "Beijing/Daelim" },
  { lon: 114.1, lat: 22.5, label: "Shenzhen/VaOpto" },
  { lon: 120.6, lat: 28.0, label: "Wenzhou" },
  { lon: 117.0, lat: 36.7, label: "Shandong/Fudao" },
  // South Korea
  { lon: 127.0, lat: 37.6, label: "South Korea" },
  // Japan
  { lon: 139.7, lat: 35.7, label: "Japan/Toshiba" },
  // India
  { lon: 77.2, lat: 28.6, label: "India/TX Xfmr" },
  // Pakistan
  { lon: 74.3, lat: 31.5, label: "Lahore/PEL" },
  // UAE
  { lon: 55.3, lat: 25.3, label: "Dubai/Bolt" },
  // Turkey
  { lon: 29.0, lat: 41.0, label: "Turkey/Astor" },
  // Portugal
  { lon: -8.6, lat: 41.2, label: "Porto/EFACEC" },
  // Mexico
  { lon: -99.1, lat: 19.4, label: "Mexico/Edmar" },
  // US
  { lon: -79.9, lat: 37.3, label: "Virginia/VTC" },
  { lon: -96.7, lat: 44.0, label: "SD/T&R" },
  { lon: -97.7, lat: 30.3, label: "Texas" },
];

function WorldMapBackground() {
  const pins = OEM_LOCATIONS.map(loc => {
    const [x, y] = lonLatToXY(loc.lon, loc.lat);
    return { x, y, label: loc.label };
  });

  return (
    <div className="ap-map-bg">
      {/* Real world map from Natural Earth data (equirectangular projection) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/world-map-bg.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />
      {/* OEM location pins overlay */}
      <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {pins.map((pin, i) => (
          <g key={i}>
            {/* Outer pulse */}
            <circle cx={pin.x} cy={pin.y} r="8" fill="none" stroke="rgba(45,140,255,0.4)" strokeWidth="1">
              <animate attributeName="r" from="4" to="18" dur={`${2 + (i % 3) * 0.7}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.6" to="0" dur={`${2 + (i % 3) * 0.7}s`} repeatCount="indefinite" />
            </circle>
            {/* Pin marker */}
            <circle cx={pin.x} cy={pin.y} r="4" fill="#2d8cff" opacity="0.8" />
            <circle cx={pin.x} cy={pin.y} r="2" fill="#fff" opacity="0.9" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Scatter chart component                                             */
/* ------------------------------------------------------------------ */
interface ChartDatum {
  name: string;
  price: number;
  weeks: number;
  type: "fluxco" | "antora";
  recommended?: boolean;
}

function ScatterChart({ inView, data, maxPrice, maxWeeks, deliveryWeek, deliveryLabel }: {
  inView: boolean;
  data: ChartDatum[];
  maxPrice: number;
  maxWeeks: number;
  deliveryWeek: number;
  deliveryLabel: string;
}) {
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

  // Compute sensible tick marks
  const priceStep = maxPrice <= 1000000 ? 200000 : 500000;
  const priceTicks: number[] = [];
  for (let p = 0; p <= maxPrice; p += priceStep) priceTicks.push(p);

  const weekStep = maxWeeks <= 60 ? 10 : maxWeeks <= 120 ? 20 : 50;
  const weekTicks: number[] = [];
  for (let w = 0; w <= maxWeeks; w += weekStep) weekTicks.push(w);

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="ap-scatter-svg" style={{ width: "100%", height: "auto" }}>
      {/* Grid lines */}
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

      {/* Delivery deadline line */}
      {deliveryWeek > 0 && deliveryWeek <= maxWeeks && (
        <>
          <line x1={x(deliveryWeek)} y1={padT} x2={x(deliveryWeek)} y2={chartH - padB} stroke="rgba(230,57,70,0.5)" strokeWidth="1.5" strokeDasharray="4,4" />
          <text x={x(deliveryWeek) + 6} y={padT + 14} fill="#e63946" fontSize="8" fontFamily="JetBrains Mono" fontWeight="600">
            {deliveryLabel} DELIVERY
          </text>
        </>
      )}

      {/* Axis labels */}
      <text x={chartW / 2} y={chartH - 5} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Inter" fontWeight="600" letterSpacing="1">
        TOTAL LEAD TIME (WEEKS)
      </text>
      <text x={14} y={chartH / 2} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Inter" fontWeight="600" letterSpacing="1" transform={`rotate(-90, 14, ${chartH / 2})`}>
        QUOTED PRICE ($)
      </text>

      {/* Data points */}
      {data.map((d, i) => {
        const cx = x(d.weeks);
        const cy = y(d.price);
        const isAntora = d.type === "antora";
        const isRec = d.recommended;
        return (
          <g key={d.name} style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "scale(1)" : "scale(0)",
            transformOrigin: `${cx}px ${cy}px`,
            transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.04}s`,
          }}>
            {isRec && <circle cx={cx} cy={cy} r="12" fill="rgba(45,140,255,0.1)" stroke="rgba(45,140,255,0.3)" strokeWidth="0.5" />}
            <circle
              cx={cx} cy={cy}
              r={isRec ? "6" : "5"}
              fill={isAntora ? "#e63946" : isRec ? "#2d8cff" : "rgba(45,140,255,0.6)"}
              stroke={isRec ? "#2d8cff" : "none"}
              strokeWidth={isRec ? "1.5" : "0"}
            />
            <text
              x={cx}
              y={cy - 10}
              textAnchor="middle"
              fill={isAntora ? "#e63946" : isRec ? "#2d8cff" : "rgba(255,255,255,0.45)"}
              fontSize="7.5"
              fontFamily="Inter"
              fontWeight={isRec ? "600" : "400"}
            >
              {d.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}


/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */
interface ProposalClientProps {
  project: ProposalProject;
  quotes: ProposalQuote[];
  stats: ProposalStats;
}

export function ProposalClient({ project, quotes, stats }: ProposalClientProps) {
  /* ---- Derived data ---- */

  // Recommended quotes
  const recommendedQuotes = quotes.filter(q => q.recommended);

  // Received quotes (for chart, table)
  const receivedQuotes = quotes.filter(q => q.status === "Quote Received");

  // Pending quotes
  const pendingQuotes = quotes.filter(q => q.status === "Preparing Proposal");

  // Other candidates: received but not recommended
  const otherCandidates = receivedQuotes.filter(q => !q.recommended);

  // Chart data: received quotes with both price and weeks
  const chartData: ChartDatum[] = receivedQuotes
    .filter(q => q.totalPrice != null && q.totalWeeks != null)
    .map(q => ({
      name: q.shortName || q.name,
      price: q.totalPrice!,
      weeks: q.totalWeeks!,
      type: (q.bidSource === "Antora" ? "antora" : "fluxco") as "fluxco" | "antora",
      recommended: q.recommended,
    }));

  // Chart axis bounds (with padding)
  const chartMaxPrice = chartData.length > 0
    ? Math.ceil(Math.max(...chartData.map(d => d.price)) * 1.15 / 500000) * 500000
    : 3000000;
  const chartMaxWeeks = chartData.length > 0
    ? Math.ceil(Math.max(...chartData.map(d => d.weeks)) * 1.15 / 10) * 10
    : 220;

  // Delivery deadline in weeks from now
  const deliveryWeek = weeksFromNow(project.deliveryDate);
  const deliveryLabel = project.deliveryDate
    ? new Date(project.deliveryDate + "T00:00:00").toLocaleDateString("en-US", { month: "numeric", day: "numeric" })
    : "";

  // Sorted received quotes for table (by totalPrice ascending)
  const sortedReceivedQuotes = [...receivedQuotes].sort((a, b) => (a.totalPrice ?? Infinity) - (b.totalPrice ?? Infinity));

  // Title split: split productDescription into two lines
  const descWords = project.productDescription.split(" ");
  const titleLine1 = descWords.length > 1 ? descWords.slice(0, -1).join(" ") : descWords[0];
  const titleLine2 = descWords.length > 1 ? descWords[descWords.length - 1] : "";

  // Icons for recommendation cards (cycle through)
  const recIcons = [Award, Factory, Shield];

  /* ---- Dynamic section count ---- */
  const hasRecommendations = recommendedQuotes.length > 0;
  const hasPending = pendingQuotes.length > 0;
  const hasOtherCandidates = otherCandidates.length > 0;

  // Build ordered list of sections
  // Always: title, process, chart
  // Conditionally: recommendations (slide 4), recommendation details (slide 5)
  // Always: full quote table
  // Conditionally: pending, other candidates
  // Always: closing
  const sections: string[] = [
    "title",        // 0
    "process",      // 1
    "chart",        // 2
  ];
  if (hasRecommendations) {
    sections.push("recommendations");     // 3 (conditional)
    sections.push("recommendation-details"); // 4 (conditional)
  }
  sections.push("quote-table");           // next
  if (hasPending) sections.push("pending");
  if (hasOtherCandidates) sections.push("other-candidates");
  sections.push("closing");

  const TOTAL_SECTIONS = sections.length;

  /* ---- Navigation state ---- */
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
  }, [TOTAL_SECTIONS]);

  const goTo = useCallback((index: number) => {
    containerRef.current?.scrollTo({
      top: index * window.innerHeight,
      behavior: "smooth",
    });
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
  }, [currentSection, TOTAL_SECTIONS, goTo]);

  /* Slide in-view trackers */
  const s1 = useInView(0.3);
  const s2 = useInView(0.2);
  const s3 = useInView(0.2);
  const s4 = useInView(0.2);
  const s5 = useInView(0.2);
  const s6 = useInView(0.2);
  const s7 = useInView(0.2);
  const s8 = useInView(0.2);
  const s9 = useInView(0.2);

  /* Animated counters */
  const cContacted = useCountUp(stats.totalContacted, 1800, s2.inView);
  const cCountries = useCountUp(stats.countries, 1200, s2.inView);
  const cReceived = useCountUp(stats.quotesReceived, 1400, s2.inView);
  const cInProcess = useCountUp(stats.inProcess, 1400, s2.inView);
  const cDeclined = useCountUp(stats.declined, 1800, s2.inView);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Oswald:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <style>{apStyles}</style>

      {/* ---- PROGRESS BAR ---- */}
      <div className="ap-progress">
        {Array.from({ length: TOTAL_SECTIONS }).map((_, i) => (
          <button
            key={i}
            className={`ap-progress-dot ${i === currentSection ? "active" : ""} ${i < currentSection ? "past" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ---- NAV ---- */}
      <div className="ap-nav">
        <button className="ap-nav-btn" onClick={() => goTo(Math.max(currentSection - 1, 0))} aria-label="Previous">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="ap-nav-count">{String(currentSection + 1).padStart(2, "0")} / {String(TOTAL_SECTIONS).padStart(2, "0")}</span>
        <button className="ap-nav-btn" onClick={() => goTo(Math.min(currentSection + 1, TOTAL_SECTIONS - 1))} aria-label="Next">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {currentSection === 0 && (
        <div className="ap-scroll-hint" onClick={() => goTo(1)}>
          <ChevronDown className="w-5 h-5" />
        </div>
      )}

      <div ref={containerRef} className="ap-container">

        {/* ========== SLIDE 1 -- TITLE ========== */}
        <section className="ap-slide" ref={s1.ref}>
          <GridBackground />
          <div className="ap-glow ap-glow-1" />
          <div className="ap-glow ap-glow-2" />
          <div className={`ap-title-content ${s1.inView ? "in" : ""}`}>
            <div className="ap-logo">
              <div className="ap-logo-icon"><Zap className="w-8 h-8" /></div>
              <span>FLUXCO</span>
            </div>
            <div className="ap-badge">PROCUREMENT PROPOSAL</div>
            <h1 className="ap-h1">
              <span className="ap-h1-line ap-h1-1">{titleLine1}</span>
              {titleLine2 && <span className="ap-h1-line ap-h1-2">{titleLine2}</span>}
            </h1>
            <p className="ap-subtitle">
              Prepared for <strong>{project.customerName}</strong> &mdash; {project.location}
            </p>
            <div className="ap-title-meta">
              <span><Clock className="w-4 h-4" /> Target Delivery: {formatDate(project.deliveryDate)}</span>
              <span><MapPin className="w-4 h-4" /> {project.location}</span>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 2 -- PROCESS OVERVIEW ========== */}
        <section className="ap-slide" ref={s2.ref}>
          <WorldMapBackground />
          <div className="ap-glow ap-glow-3" />
          <div className={`ap-content ${s2.inView ? "in" : ""}`}>
            <div className="ap-slide-label">PROCUREMENT PROCESS</div>
            <h2 className="ap-h2">Process Overview</h2>
            <p className="ap-p">
              Outreach for the requirement to procure a <strong>{project.productDescription}</strong> with
              target delivery <strong>{formatDate(project.deliveryDate)}</strong>.
            </p>

            <div className="ap-stats-row">
              <div className="ap-stat-card">
                <div className="ap-stat-num">{cContacted}</div>
                <div className="ap-stat-label">OEMs Contacted</div>
              </div>
              <div className="ap-stat-card">
                <div className="ap-stat-num">{cCountries}</div>
                <div className="ap-stat-label">Countries</div>
              </div>
              <div className="ap-stat-card ap-stat-highlight">
                <div className="ap-stat-num">{cReceived}</div>
                <div className="ap-stat-label">Quotes Received</div>
              </div>
              <div className="ap-stat-card">
                <div className="ap-stat-num">{cInProcess}</div>
                <div className="ap-stat-label">Quotes In-Process</div>
              </div>
              <div className="ap-stat-card ap-stat-dim">
                <div className="ap-stat-num">{cDeclined}</div>
                <div className="ap-stat-label">Declined / No Bid</div>
              </div>
            </div>

            <div className="ap-grid-2">
              <div>
                <h3 className="ap-h3"><CheckCircle className="w-5 h-5" style={{ color: "#22c55e" }} /> Completed</h3>
                <ul className="ap-checklist">
                  <li>Initial Quotes</li>
                  <li>Engineering Q&A</li>
                  <li>DDP Review <span className="ap-note">(tariffs changed mid process)</span></li>
                  <li><strong>Top 3 OEM Recommendations</strong></li>
                  <li className="ap-sub">+1-2 Wildcards</li>
                </ul>
              </div>
              <div>
                <h3 className="ap-h3"><Clock className="w-5 h-5" style={{ color: "var(--ap-blue)" }} /> To Be Completed</h3>
                <ul className="ap-checklist ap-checklist-pending">
                  <li>MFG Drawings</li>
                  <li>PO + Payment Terms Negotiation</li>
                  <li>Third Party Facility Review</li>
                  <li>NRTL Listing / FEOC Confirmation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 3 -- PRICE vs LEAD TIME CHART ========== */}
        <section className="ap-slide" ref={s3.ref}>
          <div className="ap-glow ap-glow-4" />
          <div className={`ap-content ${s3.inView ? "in" : ""}`}>
            <div className="ap-slide-label">MARKET ANALYSIS</div>
            <h2 className="ap-h2">Quoted Price by Lead Time</h2>
            <p className="ap-p">
              All bids plotted by <strong>total lead time</strong> and <strong>quoted price</strong>.
              Recommended suppliers highlighted. Red dotted line marks the {formatDate(project.deliveryDate)} delivery deadline.
            </p>

            <div className="ap-chart-wrap">
              <div className="ap-chart-box">
                <ScatterChart
                  inView={s3.inView}
                  data={chartData}
                  maxPrice={chartMaxPrice}
                  maxWeeks={chartMaxWeeks}
                  deliveryWeek={deliveryWeek}
                  deliveryLabel={deliveryLabel}
                />
              </div>
              <div className="ap-chart-legend">
                <div className="ap-legend">
                  <div className="ap-legend-swatch" style={{ background: "#2d8cff" }} /> FluxCo Bid
                </div>
                <div className="ap-legend">
                  <div className="ap-legend-swatch" style={{ background: "#e63946" }} /> {project.customerName} Bid
                </div>
                <div className="ap-legend">
                  <div className="ap-legend-swatch" style={{ background: "#2d8cff", border: "2px solid #2d8cff", boxShadow: "0 0 0 3px rgba(45,140,255,0.2)" }} /> Recommended
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 4 -- TOP 3 RECOMMENDATIONS ========== */}
        {hasRecommendations && (
          <section className="ap-slide" ref={s4.ref}>
            <div className="ap-glow ap-glow-5" />
            <div className={`ap-content ${s4.inView ? "in" : ""}`}>
              <div className="ap-slide-label">OUR RECOMMENDATIONS</div>
              <h2 className="ap-h2">Top {Math.min(recommendedQuotes.length, 3)} Candidates</h2>

              <div className="ap-rec-grid">
                {recommendedQuotes.slice(0, 3).map((q, idx) => {
                  const IconComp = recIcons[idx % recIcons.length];
                  const isFeatured = idx === 0;
                  return (
                    <div key={q.name} className={`ap-rec-card ${isFeatured ? "ap-rec-featured" : ""}`}>
                      {isFeatured && <div className="ap-rec-badge">BEST VALUE</div>}
                      <div className="ap-rec-header">
                        <div className="ap-rec-icon"><IconComp className="w-6 h-6" /></div>
                        <div>
                          <div className="ap-rec-name">{q.name}</div>
                          <div className="ap-rec-origin"><MapPin className="w-3 h-3" /> {q.country}</div>
                        </div>
                      </div>
                      <div className="ap-rec-price-row">
                        <div className="ap-rec-price">{formatCurrency(q.totalPrice)} <span>DDP Total</span></div>
                        <div className="ap-rec-lt"><Clock className="w-3.5 h-3.5" /> {q.totalWeeks ?? "\u2014"} wks</div>
                      </div>
                      <div className="ap-rec-body">
                        <p>{q.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ========== SLIDE 5 -- RECOMMENDATION DETAILS ========== */}
        {hasRecommendations && (
          <section className="ap-slide" ref={s5.ref}>
            <div className="ap-glow ap-glow-3" />
            <div className={`ap-content ${s5.inView ? "in" : ""}`}>
              <div className="ap-slide-label">WHY THESE {Math.min(recommendedQuotes.length, 3) === 1 ? "ONE" : Math.min(recommendedQuotes.length, 3) === 2 ? "TWO" : "THREE"}</div>
              <h2 className="ap-h2">Detailed Recommendations</h2>

              <div className="ap-detail-grid">
                {recommendedQuotes.slice(0, 3).map((q) => {
                  const priceLabel = q.ddp != null && q.ddp > 0 ? "DDP" : "FOB";
                  const priceVal = priceLabel === "DDP" ? q.totalPrice : q.quotedPrice;
                  return (
                    <div key={q.name} className="ap-detail-card">
                      <h3 className="ap-h3">{q.name} <span className="ap-price-tag">{formatCurrency(priceVal)} {priceLabel}</span></h3>
                      <p className="ap-p">{q.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ========== SLIDE 6 -- FULL QUOTE TABLE ========== */}
        <section className="ap-slide ap-slide-table" ref={s6.ref}>
          <div className={`ap-content ${s6.inView ? "in" : ""}`}>
            <div className="ap-slide-label">ALL QUOTES</div>
            <h2 className="ap-h2">Overview of Quotes</h2>

            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>OEM</th>
                    <th>Country</th>
                    <th>Lead Time</th>
                    <th>Quoted Price</th>
                    <th>+ DDP</th>
                    <th>DDP Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedReceivedQuotes.map((q) => (
                    <tr key={q.name} className={q.recommended ? "ap-row-rec" : ""}>
                      <td>{q.name}</td>
                      <td>{q.country}</td>
                      <td>{q.totalWeeks != null ? `${q.totalWeeks} wks` : "\u2014"}</td>
                      <td>{formatCurrency(q.quotedPrice)}</td>
                      <td>{q.ddp != null ? (q.ddp === 0 ? "$0" : formatCurrency(q.ddp)) : "\u2014"}</td>
                      <td className={q.recommended ? "ap-price-cell" : ""}>{formatCurrency(q.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 7 -- PENDING QUOTES ========== */}
        {hasPending && (
          <section className="ap-slide" ref={s7.ref}>
            <div className="ap-glow ap-glow-4" />
            <div className={`ap-content ${s7.inView ? "in" : ""}`}>
              <div className="ap-slide-label">IN PROGRESS</div>
              <h2 className="ap-h2">Pending Quotes</h2>
              <p className="ap-p">Specs have been shared and are under review with the following manufacturers:</p>

              <div className="ap-pending-grid">
                {pendingQuotes.map((q) => {
                  const isUS = q.country === "US" || q.country === "USA" || q.country === "United States";
                  const icon = isUS ? <Factory className="w-5 h-5" /> : <Globe className="w-5 h-5" />;
                  return (
                    <div key={q.name} className="ap-pending-card">
                      <div className="ap-pending-icon">{icon}</div>
                      <div>
                        <div className="ap-pending-name">{q.name}</div>
                        <div className="ap-pending-country">{q.country}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ========== SLIDE 8 -- OTHER CANDIDATES ========== */}
        {hasOtherCandidates && (
          <section className="ap-slide ap-slide-table" ref={s8.ref}>
            <div className={`ap-content ${s8.inView ? "in" : ""}`}>
              <div className="ap-slide-label">APPENDIX</div>
              <h2 className="ap-h2">Other Candidates</h2>

              <div className="ap-table-wrap">
                <table className="ap-table ap-table-detail">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Country</th>
                      <th>Price / Lead Time</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherCandidates
                      .sort((a, b) => (a.totalPrice ?? Infinity) - (b.totalPrice ?? Infinity))
                      .map((q) => (
                        <tr key={q.name}>
                          <td className="ap-td-name">{q.name}</td>
                          <td>{q.country}</td>
                          <td>{formatCurrency(q.totalPrice)}<br/><span className="ap-td-lt">{q.totalWeeks != null ? `${q.totalWeeks} wks` : "\u2014"}</span></td>
                          <td>{q.description || "\u2014"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ========== SLIDE 9 -- CLOSING ========== */}
        <section className="ap-slide" ref={s9.ref}>
          <GridBackground />
          <div className="ap-glow ap-glow-1" />
          <div className="ap-glow ap-glow-2" />
          <div className={`ap-closing ${s9.inView ? "in" : ""}`}>
            <div className="ap-closing-logo">
              <div className="ap-logo-icon"><Zap className="w-8 h-8" /></div>
            </div>
            <h2 className="ap-closing-h2">Next Steps</h2>
            <p className="ap-closing-p">
              Ready to proceed with MFG drawings, PO negotiations, and facility reviews
              for the recommended suppliers.
            </p>
            <a href="mailto:brian@fluxco.com" className="ap-cta">
              Contact FluxCo <ArrowRight className="w-4 h-4" />
            </a>
            <div className="ap-closing-contact">
              <span>FluxCo</span>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}


/* =====================================================================
   STYLES
   ===================================================================== */
const apStyles = `
  :root {
    --ap-blue: #2d8cff;
    --ap-red: #e63946;
    --ap-green: #22c55e;
    --ap-bg: #08090a;
    --ap-surface: rgba(255,255,255,0.04);
    --ap-border: rgba(255,255,255,0.08);
    --ap-text: rgba(255,255,255,0.7);
    --ap-text-dim: rgba(255,255,255,0.4);
    --ap-radius: 12px;
  }

  *, *::before, *::after { box-sizing: border-box; }
  html, body { background: var(--ap-bg) !important; overflow: hidden !important; max-width: 100vw; }

  .ap-container {
    position: fixed; inset: 0;
    overflow-y: scroll; overflow-x: hidden;
    scroll-snap-type: y mandatory;
    -webkit-overflow-scrolling: touch;
    z-index: 1;
  }

  .ap-slide {
    min-height: 100vh; min-height: 100dvh;
    width: 100%; display: flex;
    flex-direction: column; justify-content: center; align-items: center;
    scroll-snap-align: start;
    position: relative; overflow: hidden;
    background: var(--ap-bg);
  }
  .ap-slide-table {
    justify-content: flex-start;
    padding-top: 60px;
  }

  /* ---- BACKGROUNDS ---- */
  .ap-grid-bg { position: absolute; inset: 0; z-index: 0; opacity: 0.8; }
  .ap-map-bg {
    position: absolute; inset: 0; z-index: 0;
    opacity: 0.7;
    display: flex; align-items: center; justify-content: center;
  }
  .ap-map-bg svg {
    width: 100%; height: 100%;
  }

  .ap-glow {
    position: absolute; border-radius: 50%;
    filter: blur(120px); pointer-events: none; z-index: 0;
  }
  .ap-glow-1 { width: 600px; height: 600px; top: -100px; right: -100px; background: rgba(45,140,255,0.08); animation: ap-float 8s ease-in-out infinite; }
  .ap-glow-2 { width: 400px; height: 400px; bottom: -50px; left: 10%; background: rgba(230,57,70,0.05); animation: ap-float 10s ease-in-out infinite reverse; }
  .ap-glow-3 { width: 500px; height: 500px; top: 20%; right: -100px; background: rgba(45,140,255,0.06); animation: ap-float 9s ease-in-out infinite; }
  .ap-glow-4 { width: 500px; height: 500px; bottom: 10%; left: -100px; background: rgba(45,140,255,0.05); animation: ap-float 11s ease-in-out infinite reverse; }
  .ap-glow-5 { width: 600px; height: 600px; top: 30%; left: 30%; background: rgba(45,140,255,0.04); animation: ap-float 12s ease-in-out infinite; }

  @keyframes ap-float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -20px) scale(1.05); }
  }

  /* ---- PROGRESS BAR ---- */
  .ap-progress {
    position: fixed; right: 24px; top: 50%; transform: translateY(-50%);
    z-index: 100; display: flex; flex-direction: column; gap: 8px;
  }
  .ap-progress-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: rgba(255,255,255,0.15); border: none;
    cursor: pointer; padding: 0;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ap-progress-dot.active { background: var(--ap-blue); height: 24px; border-radius: 4px; box-shadow: 0 0 12px rgba(45,140,255,0.4); }
  .ap-progress-dot.past { background: rgba(45,140,255,0.3); }
  .ap-progress-dot:hover { background: rgba(255,255,255,0.4); }

  /* ---- NAV ---- */
  .ap-nav {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    z-index: 100; display: flex; align-items: center; gap: 12px;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(20px);
    border: 1px solid var(--ap-border); border-radius: 100px;
    padding: 8px;
  }
  .ap-nav-btn {
    width: 36px; height: 36px; border-radius: 50%;
    background: transparent; border: 1px solid var(--ap-border);
    color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .ap-nav-btn:hover { background: var(--ap-blue); border-color: var(--ap-blue); }
  .ap-nav-count {
    font-family: 'JetBrains Mono', monospace; font-size: 12px;
    color: var(--ap-text-dim); padding: 0 8px; letter-spacing: 1px;
  }

  .ap-scroll-hint {
    position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
    z-index: 100; color: var(--ap-text-dim); cursor: pointer;
    animation: ap-bounce 2s ease-in-out infinite;
  }
  @keyframes ap-bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(8px); }
  }

  /* ---- CONTENT WRAPPER ---- */
  .ap-content {
    padding: 60px 80px; width: 100%; max-width: 1300px;
    margin: 0 auto; z-index: 1;
  }

  /* ---- ANIMATIONS ---- */
  .ap-content.in .ap-slide-label,
  .ap-content.in .ap-h2,
  .ap-content.in > .ap-p,
  .ap-content.in .ap-stats-row,
  .ap-content.in .ap-grid-2,
  .ap-content.in .ap-chart-wrap,
  .ap-content.in .ap-rec-grid,
  .ap-content.in .ap-detail-grid,
  .ap-content.in .ap-table-wrap,
  .ap-content.in .ap-pending-grid {
    animation: ap-fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .ap-content .ap-slide-label { opacity: 0; animation-delay: 0s; }
  .ap-content .ap-h2 { opacity: 0; animation-delay: 0.1s; }
  .ap-content > .ap-p { opacity: 0; animation-delay: 0.2s; }
  .ap-content .ap-stats-row { opacity: 0; animation-delay: 0.25s; }
  .ap-content .ap-grid-2 { opacity: 0; animation-delay: 0.35s; }
  .ap-content .ap-chart-wrap { opacity: 0; animation-delay: 0.2s; }
  .ap-content .ap-rec-grid { opacity: 0; animation-delay: 0.2s; }
  .ap-content .ap-detail-grid { opacity: 0; animation-delay: 0.2s; }
  .ap-content .ap-table-wrap { opacity: 0; animation-delay: 0.15s; }
  .ap-content .ap-pending-grid { opacity: 0; animation-delay: 0.2s; }

  @keyframes ap-fade-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ---- TITLE SLIDE ---- */
  .ap-title-content {
    position: relative; z-index: 2;
    padding: 80px; max-width: 900px;
  }
  .ap-title-content .ap-logo,
  .ap-title-content .ap-badge,
  .ap-title-content .ap-h1-line,
  .ap-title-content .ap-subtitle,
  .ap-title-content .ap-title-meta {
    opacity: 0; transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ap-title-content.in .ap-logo { opacity: 1; transform: translateY(0); transition-delay: 0.1s; }
  .ap-title-content.in .ap-badge { opacity: 1; transform: translateY(0); transition-delay: 0.2s; }
  .ap-title-content.in .ap-h1-1 { opacity: 1; transform: translateY(0); transition-delay: 0.35s; }
  .ap-title-content.in .ap-h1-2 { opacity: 1; transform: translateY(0); transition-delay: 0.55s; }
  .ap-title-content.in .ap-subtitle { opacity: 1; transform: translateY(0); transition-delay: 0.7s; }
  .ap-title-content.in .ap-title-meta { opacity: 1; transform: translateY(0); transition-delay: 0.85s; }

  /* ---- LOGO ---- */
  .ap-logo {
    display: flex; align-items: center; gap: 12px;
    font-family: 'Oswald', sans-serif; font-weight: 700;
    font-size: 28px; color: #fff; letter-spacing: 3px;
    text-transform: uppercase; margin-bottom: 24px;
  }
  .ap-logo-icon {
    width: 48px; height: 48px; border-radius: 10px;
    background: linear-gradient(135deg, var(--ap-blue), rgba(45,140,255,0.3));
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    box-shadow: 0 0 30px rgba(45,140,255,0.3);
    animation: ap-pulse 3s ease-in-out infinite;
  }
  @keyframes ap-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(45,140,255,0.2); }
    50% { box-shadow: 0 0 40px rgba(45,140,255,0.4); }
  }

  .ap-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: var(--ap-blue); letter-spacing: 4px; text-transform: uppercase;
    font-weight: 600; margin-bottom: 16px;
    padding: 6px 14px; border-radius: 100px;
    background: rgba(45,140,255,0.08); border: 1px solid rgba(45,140,255,0.2);
    display: inline-block;
  }

  /* ---- TYPOGRAPHY ---- */
  .ap-h1 { display: flex; flex-direction: column; gap: 0; margin: 0 0 32px 0; }
  .ap-h1-line {
    font-family: 'Oswald', sans-serif; font-weight: 700;
    font-size: clamp(48px, 8vw, 88px); line-height: 0.95;
    text-transform: uppercase; display: block;
  }
  .ap-h1-1 { color: #fff; }
  .ap-h1-2 { color: var(--ap-blue); }

  .ap-subtitle {
    font-family: 'Inter', sans-serif; font-size: clamp(16px, 1.8vw, 20px);
    color: var(--ap-text); max-width: 600px; line-height: 1.6; font-weight: 400;
  }
  .ap-subtitle strong { color: #fff; }

  .ap-title-meta {
    display: flex; gap: 24px; margin-top: 24px;
    font-family: 'JetBrains Mono', monospace; font-size: 12px;
    color: var(--ap-text-dim); letter-spacing: 0.5px;
  }
  .ap-title-meta span {
    display: flex; align-items: center; gap: 6px;
  }
  .ap-title-meta svg { color: var(--ap-blue); }

  .ap-slide-label {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: var(--ap-blue); letter-spacing: 3px; text-transform: uppercase;
    font-weight: 500; margin-bottom: 12px;
  }

  .ap-h2 {
    font-family: 'Oswald', sans-serif; color: #fff;
    font-size: clamp(28px, 4vw, 44px); font-weight: 700;
    text-transform: uppercase; margin: 0 0 20px 0; line-height: 1.1;
  }

  .ap-h3 {
    font-family: 'Oswald', sans-serif; color: #fff;
    font-size: 18px; font-weight: 500;
    text-transform: uppercase; margin-bottom: 14px;
    letter-spacing: 0.5px;
    display: flex; align-items: center; gap: 8px;
  }

  .ap-p {
    color: var(--ap-text); font-size: 14px; line-height: 1.7;
    margin-bottom: 12px; font-family: 'Inter', sans-serif;
  }
  .ap-p strong { color: #fff; font-weight: 600; }
  .ap-note { color: var(--ap-text-dim); font-size: 12px; font-style: italic; }

  /* ---- STATS ROW ---- */
  .ap-stats-row {
    display: flex; gap: 14px; margin: 28px 0;
  }
  .ap-stat-card {
    flex: 1; text-align: center; padding: 24px 16px;
    background: var(--ap-surface); border: 1px solid var(--ap-border);
    border-radius: var(--ap-radius);
    transition: all 0.3s;
  }
  .ap-stat-card:hover { border-color: rgba(45,140,255,0.3); transform: translateY(-2px); }
  .ap-stat-highlight { border-color: rgba(45,140,255,0.3); background: rgba(45,140,255,0.06); }
  .ap-stat-dim { opacity: 0.6; }
  .ap-stat-num {
    font-family: 'Oswald', sans-serif; font-size: 42px; font-weight: 700;
    color: #fff; line-height: 1;
  }
  .ap-stat-highlight .ap-stat-num { color: var(--ap-blue); }
  .ap-stat-label {
    font-family: 'Inter', sans-serif; font-size: 11px;
    color: var(--ap-text-dim); text-transform: uppercase;
    letter-spacing: 1px; margin-top: 8px;
  }

  /* ---- GRID ---- */
  .ap-grid-2 {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 40px; margin-top: 24px;
  }

  /* ---- CHECKLIST ---- */
  .ap-checklist { list-style: none; padding: 0; margin: 16px 0; }
  .ap-checklist li {
    position: relative; padding-left: 28px; margin-bottom: 10px;
    color: var(--ap-text); font-size: 14px; line-height: 1.6;
    font-family: 'Inter', sans-serif;
  }
  .ap-checklist li::before {
    content: ''; position: absolute; left: 0; top: 4px;
    width: 16px; height: 16px; border-radius: 50%;
    background: rgba(34,197,94,0.1); border: 1.5px solid #22c55e;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2322c55e' stroke-width='3'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E");
    background-size: 10px; background-position: center; background-repeat: no-repeat;
  }
  .ap-checklist li strong { color: #fff; }
  .ap-checklist.ap-checklist-pending li::before {
    background: rgba(45,140,255,0.1); border-color: var(--ap-blue);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232d8cff' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='1'/%3E%3C/svg%3E");
  }
  .ap-sub { padding-left: 48px !important; font-size: 13px; color: var(--ap-text-dim); }
  .ap-sub::before { left: 20px !important; }

  /* ---- CHART ---- */
  .ap-chart-wrap { margin-top: 24px; }
  .ap-chart-box {
    background: rgba(255,255,255,0.02); border: 1px solid var(--ap-border);
    border-radius: var(--ap-radius) var(--ap-radius) 0 0;
    padding: 24px 16px 16px;
  }
  .ap-chart-legend {
    display: flex; justify-content: center; gap: 24px;
    padding: 10px 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid var(--ap-border); border-top: none;
    border-radius: 0 0 var(--ap-radius) var(--ap-radius);
  }
  .ap-legend {
    font-family: 'Inter', sans-serif; font-size: 10px;
    color: var(--ap-text-dim); text-transform: uppercase; font-weight: 600;
    display: flex; align-items: center; gap: 6px; letter-spacing: 0.5px;
  }
  .ap-legend-swatch { width: 10px; height: 10px; border-radius: 50%; }

  /* ---- RECOMMENDATION CARDS ---- */
  .ap-rec-grid {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    gap: 20px; margin-top: 24px;
  }
  .ap-rec-card {
    padding: 28px; border-radius: var(--ap-radius);
    background: var(--ap-surface); border: 1px solid var(--ap-border);
    transition: all 0.3s; position: relative;
    display: flex; flex-direction: column; gap: 16px;
  }
  .ap-rec-card:hover { border-color: rgba(45,140,255,0.3); transform: translateY(-3px); }
  .ap-rec-featured {
    border-color: rgba(45,140,255,0.3);
    background: rgba(45,140,255,0.04);
    box-shadow: 0 0 40px rgba(45,140,255,0.08);
  }
  .ap-rec-badge {
    position: absolute; top: -1px; right: 20px;
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    color: #fff; letter-spacing: 2px; text-transform: uppercase;
    font-weight: 700;
    padding: 4px 12px;
    background: linear-gradient(135deg, var(--ap-blue), rgba(45,140,255,0.7));
    border-radius: 0 0 6px 6px;
  }
  .ap-rec-header { display: flex; align-items: center; gap: 14px; }
  .ap-rec-icon {
    width: 44px; height: 44px; border-radius: 10px;
    background: rgba(45,140,255,0.1);
    display: flex; align-items: center; justify-content: center;
    color: var(--ap-blue); flex-shrink: 0;
  }
  .ap-rec-name {
    font-family: 'Oswald', sans-serif; font-size: 18px; font-weight: 600;
    color: #fff; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .ap-rec-origin {
    font-family: 'Inter', sans-serif; font-size: 11px;
    color: var(--ap-text-dim); display: flex; align-items: center; gap: 4px; margin-top: 2px;
  }
  .ap-rec-price-row {
    display: flex; gap: 16px; align-items: baseline;
    padding: 12px 16px; border-radius: 8px;
    background: rgba(255,255,255,0.03);
  }
  .ap-rec-price {
    font-family: 'Oswald', sans-serif; font-size: 22px; font-weight: 700;
    color: var(--ap-blue);
  }
  .ap-rec-price span {
    font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 400;
    color: var(--ap-text-dim); text-transform: uppercase; letter-spacing: 0.5px;
    margin-left: 4px;
  }
  .ap-rec-lt {
    font-family: 'JetBrains Mono', monospace; font-size: 12px;
    color: var(--ap-text); display: flex; align-items: center; gap: 4px;
  }
  .ap-rec-lt span {
    font-size: 10px; color: var(--ap-text-dim); margin-left: 2px;
  }
  .ap-rec-body {
    font-family: 'Inter', sans-serif; font-size: 13px;
    color: var(--ap-text); line-height: 1.65; flex: 1;
  }
  .ap-rec-body p { margin: 0; }
  .ap-rec-body strong { color: #fff; font-weight: 600; }
  .ap-rec-quals {
    display: flex; flex-wrap: wrap; gap: 6px;
  }
  .ap-rec-quals span {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    color: var(--ap-blue); letter-spacing: 0.5px;
    padding: 3px 8px; border-radius: 4px;
    background: rgba(45,140,255,0.08); border: 1px solid rgba(45,140,255,0.15);
  }
  .ap-rec-note {
    font-family: 'Inter', sans-serif; font-size: 11px;
    color: var(--ap-text-dim); line-height: 1.5;
    padding-top: 8px; border-top: 1px solid var(--ap-border);
  }

  /* ---- DETAIL CARDS ---- */
  .ap-detail-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 12px; margin-top: 14px;
  }
  .ap-detail-card {
    padding: 16px 18px; border-radius: var(--ap-radius);
    background: var(--ap-surface); border: 1px solid var(--ap-border);
    transition: all 0.3s;
  }
  .ap-detail-card:hover { border-color: rgba(45,140,255,0.3); }
  .ap-detail-card .ap-h3 { font-size: 15px; margin-bottom: 8px; }
  .ap-detail-card .ap-p { font-size: 12px; line-height: 1.55; margin-bottom: 6px; }
  .ap-detail-card .ap-p:last-child { margin-bottom: 0; }
  .ap-price-tag {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: var(--ap-blue); font-weight: 500; letter-spacing: 0;
    text-transform: none; margin-left: 10px;
  }

  /* ---- TABLE ---- */
  .ap-table-wrap {
    margin-top: 16px;
    border-radius: var(--ap-radius);
    overflow: hidden;
    border: 1px solid var(--ap-border);
  }
  .ap-table {
    width: 100%; border-collapse: collapse;
    font-family: 'Inter', sans-serif; font-size: 13px;
  }
  .ap-table th {
    padding: 14px 16px; text-align: left;
    font-weight: 600; font-size: 10px;
    color: var(--ap-blue); text-transform: uppercase;
    letter-spacing: 1.5px;
    background: rgba(45,140,255,0.06);
    border-bottom: 1px solid rgba(45,140,255,0.15);
  }
  .ap-table td {
    padding: 12px 16px; color: var(--ap-text);
    border-bottom: 1px solid var(--ap-border);
    vertical-align: top;
  }
  .ap-table tr:last-child td { border-bottom: none; }
  .ap-table tr:hover td { background: rgba(255,255,255,0.02); }

  .ap-row-rec td {
    background: rgba(45,140,255,0.03);
    border-color: rgba(45,140,255,0.1);
  }
  .ap-row-rec td:first-child {
    color: #fff; font-weight: 600;
    border-left: 3px solid var(--ap-blue);
  }
  .ap-price-cell { color: var(--ap-blue) !important; font-weight: 600 !important; font-family: 'JetBrains Mono', monospace; }

  .ap-table-detail td { font-size: 12px; line-height: 1.5; }
  .ap-td-name { color: #fff !important; font-weight: 600; white-space: nowrap; }
  .ap-td-lt { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--ap-text-dim); }

  /* ---- PENDING GRID ---- */
  .ap-pending-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 14px; margin-top: 32px;
  }
  .ap-pending-card {
    display: flex; align-items: center; gap: 14px;
    padding: 18px 20px; border-radius: var(--ap-radius);
    background: var(--ap-surface); border: 1px solid var(--ap-border);
    transition: all 0.3s;
  }
  .ap-pending-card:hover { border-color: rgba(45,140,255,0.3); transform: translateX(4px); }
  .ap-pending-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: rgba(45,140,255,0.1);
    display: flex; align-items: center; justify-content: center;
    color: var(--ap-blue); flex-shrink: 0;
  }
  .ap-pending-name {
    font-family: 'Inter', sans-serif; font-size: 14px;
    color: #fff; font-weight: 600;
  }
  .ap-pending-country {
    font-family: 'Inter', sans-serif; font-size: 11px;
    color: var(--ap-text-dim); margin-top: 2px;
  }

  /* ---- CLOSING ---- */
  .ap-closing {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; z-index: 2; padding: 80px; max-width: 800px;
  }
  .ap-closing .ap-logo-icon,
  .ap-closing .ap-closing-h2,
  .ap-closing .ap-closing-p,
  .ap-closing .ap-cta,
  .ap-closing .ap-closing-contact {
    opacity: 0; transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ap-closing.in .ap-logo-icon { opacity: 1; transform: translateY(0); transition-delay: 0.1s; }
  .ap-closing.in .ap-closing-h2 { opacity: 1; transform: translateY(0); transition-delay: 0.3s; }
  .ap-closing.in .ap-closing-p { opacity: 1; transform: translateY(0); transition-delay: 0.5s; }
  .ap-closing.in .ap-cta { opacity: 1; transform: translateY(0); transition-delay: 0.7s; }
  .ap-closing.in .ap-closing-contact { opacity: 1; transform: translateY(0); transition-delay: 0.85s; }

  .ap-closing-logo { margin-bottom: 24px; }
  .ap-closing-h2 {
    font-family: 'Oswald', sans-serif; font-size: clamp(36px, 5vw, 56px);
    font-weight: 700; color: #fff; text-transform: uppercase;
    margin-bottom: 20px;
  }
  .ap-closing-p {
    font-family: 'Inter', sans-serif; font-size: 17px;
    color: var(--ap-text); line-height: 1.6; margin-bottom: 32px;
  }
  .ap-cta {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
    color: #fff; letter-spacing: 2px; text-transform: uppercase;
    padding: 16px 32px; border-radius: 100px;
    background: linear-gradient(135deg, var(--ap-blue), rgba(45,140,255,0.7));
    text-decoration: none; transition: all 0.3s;
    box-shadow: 0 0 30px rgba(45,140,255,0.2);
  }
  .ap-cta:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(45,140,255,0.4); }
  .ap-closing-contact {
    display: flex; align-items: center; gap: 16px; margin-top: 32px;
    font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ap-text-dim);
  }
  .ap-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--ap-text-dim); }

  /* ---- MOBILE ---- */
  @media (max-width: 768px) {
    html, body { overflow: auto !important; }
    .ap-container {
      position: relative !important; inset: auto !important;
      overflow-y: visible !important; scroll-snap-type: none !important;
    }
    .ap-slide { min-height: auto; padding: 48px 0; scroll-snap-align: none; }
    .ap-slide:first-child, .ap-slide:last-child { min-height: 100vh; min-height: 100svh; padding: 0; }
    .ap-content { padding: 24px 20px; }
    .ap-title-content { padding: 40px 24px; }
    .ap-h2 { font-size: 28px; }
    .ap-stats-row { flex-wrap: wrap; }
    .ap-stat-card { min-width: calc(50% - 7px); }
    .ap-grid-2 { grid-template-columns: 1fr; }
    .ap-rec-grid { grid-template-columns: 1fr; }
    .ap-detail-grid { grid-template-columns: 1fr; }
    .ap-pending-grid { grid-template-columns: 1fr; }
    .ap-progress { display: none; }
    .ap-nav { display: none; }
    .ap-scroll-hint { display: none; }
    .ap-closing { padding: 48px 24px; }
    .ap-table-wrap { overflow-x: auto; }
  }
`;
