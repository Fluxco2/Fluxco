"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Zap, ArrowRight, ArrowLeft, ChevronDown, Clock,
  MapPin, CheckCircle,
} from "lucide-react";

const TOTAL_SECTIONS = 4;

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
/*  UL/NRTL check icon                                                  */
/* ------------------------------------------------------------------ */
function ULCheck() {
  return (
    <span className="ap-ul-check">
      <CheckCircle className="w-4 h-4" />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */
export default function Antora2Proposal() {
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

  const s1 = useInView(0.3);
  const s2 = useInView(0.2);
  const s3 = useInView(0.2);
  const s4 = useInView(0.2);

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

        {/* ========== SLIDE 1 — TITLE ========== */}
        <section className="ap-slide" ref={s1.ref}>
          <GridBackground />
          <div className="ap-glow ap-glow-1" />
          <div className="ap-glow ap-glow-2" />
          <div className={`ap-title-content ${s1.inView ? "in" : ""}`}>
            <div className="ap-logo ap-h1-line">
              <div className="ap-logo-icon"><Zap className="w-8 h-8" /></div>
              FLUXCO
            </div>
            <div className="ap-badge ap-h1-line">Procurement Proposal</div>
            <div className="ap-h1">
              <span className="ap-h1-line ap-h1-1">Antora Energy</span>
              <span className="ap-h1-line ap-h1-2">20 MVA eBoiler</span>
            </div>
            <p className="ap-subtitle">
              Top quotes for a <strong>20 MVA eBoiler Transformer</strong> with
              delivery to <strong>Pratt, KS</strong>.
              Target delivery: <strong>November 30, 2026</strong>.
            </p>
            <div className="ap-title-meta">
              <span><MapPin className="w-3.5 h-3.5" /> Pratt, KS</span>
              <span><Clock className="w-3.5 h-3.5" /> Updated March 2026</span>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 2 — TOP QUOTES SUMMARY ========== */}
        <section className="ap-slide ap-slide-table" ref={s2.ref}>
          <div className="ap-glow ap-glow-3" />
          <div className={`ap-content ${s2.inView ? "in" : ""}`}>
            <div className="ap-slide-label">TOP CANDIDATES</div>
            <h2 className="ap-h2">Top Quotes for 20 MVA Project</h2>

            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Origin</th>
                    <th>UL / NRTL</th>
                    <th>Design (Weeks)</th>
                    <th>Mfg + UL (Weeks)</th>
                    <th>Ocean Freight (Weeks)</th>
                    <th>Total LT (Weeks)</th>
                    <th>ETA w/ 3/15 PO</th>
                    <th>Total incl. Ocean Freight</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="ap-td-name">Jinpan International (JST)</td>
                    <td><span className="ap-feoc">*</span>China HQ, Mexico</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">6-8</td>
                    <td className="ap-td-mono">30</td>
                    <td className="ap-td-mono">1</td>
                    <td className="ap-td-mono ap-td-bold">38</td>
                    <td className="ap-td-mono">12/13/2026</td>
                    <td className="ap-td-price">$852,068</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">International Electric Co (IEC)</td>
                    <td>S. Korea</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">2</td>
                    <td className="ap-td-mono">16</td>
                    <td className="ap-td-mono">6</td>
                    <td className="ap-td-mono ap-td-bold">24</td>
                    <td className="ap-td-mono">8/30/2026</td>
                    <td className="ap-td-price">$591,000</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Jiangsu First Power</td>
                    <td><span className="ap-feoc">*</span>China</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">2</td>
                    <td className="ap-td-mono">18</td>
                    <td className="ap-td-mono">6</td>
                    <td className="ap-td-mono ap-td-bold">26</td>
                    <td className="ap-td-mono">9/13/2026</td>
                    <td className="ap-td-price">$670,500</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Guangdong Keyuan Electric</td>
                    <td><span className="ap-feoc">*</span>China</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">4</td>
                    <td className="ap-td-mono">24</td>
                    <td className="ap-td-mono">8</td>
                    <td className="ap-td-mono ap-td-bold">36</td>
                    <td className="ap-td-mono">11/22/2026</td>
                    <td className="ap-td-price">~~$519,500</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Jiangsu Yawei Transformer</td>
                    <td><span className="ap-feoc">*</span>China</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">2</td>
                    <td className="ap-td-mono">12+UL</td>
                    <td className="ap-td-mono">6</td>
                    <td className="ap-td-mono ap-td-bold">20+UL</td>
                    <td className="ap-td-mono">8/2/2026+UL</td>
                    <td className="ap-td-price">$474,797</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">PEL</td>
                    <td>Pakistan</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">6</td>
                    <td className="ap-td-mono">23+UL</td>
                    <td className="ap-td-mono">8</td>
                    <td className="ap-td-mono ap-td-bold">37+UL</td>
                    <td className="ap-td-mono">12/6/2026+UL</td>
                    <td className="ap-td-price">$572,297</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="ap-footnote"><span className="ap-feoc">*</span>Denotes FEOC</p>
          </div>
        </section>

        {/* ========== SLIDE 3 — TOP QUOTES DETAILED ========== */}
        <section className="ap-slide ap-slide-table" ref={s3.ref}>
          <div className={`ap-content ${s3.inView ? "in" : ""}`}>
            <div className="ap-slide-label">DETAILED BREAKDOWN</div>
            <h2 className="ap-h2">Top Quotes for 20 MVA Project (Detailed)</h2>

            <div className="ap-table-wrap">
              <table className="ap-table ap-table-compact">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Origin</th>
                    <th>UL / NRTL</th>
                    <th>Design (Wks)</th>
                    <th>Mfg (Wks)</th>
                    <th>UL (Wks)</th>
                    <th>Ship (Wks)</th>
                    <th>Total LT (Wks)</th>
                    <th>ETA w/ 3/15 PO</th>
                    <th>Price</th>
                    <th>+UL</th>
                    <th>Tariff</th>
                    <th>Tax</th>
                    <th>Freight</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="ap-td-name">Jinpan International (JST)</td>
                    <td><span className="ap-feoc">*</span>China HQ, Mexico</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">6-8</td>
                    <td className="ap-td-mono">30</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-mono">1</td>
                    <td className="ap-td-mono ap-td-bold">38</td>
                    <td className="ap-td-mono">12/13/2026</td>
                    <td className="ap-td-mono">$787k</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-mono">0%</td>
                    <td className="ap-td-mono">8.25%</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-price">$852,068</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">International Electric Co (IEC)</td>
                    <td>S. Korea</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">2</td>
                    <td className="ap-td-mono">16</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-mono">6</td>
                    <td className="ap-td-mono ap-td-bold">24</td>
                    <td className="ap-td-mono">8/30/2026</td>
                    <td className="ap-td-mono">$518k</td>
                    <td className="ap-td-mono">$73k</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-price">$591,000</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Jiangsu First Power</td>
                    <td><span className="ap-feoc">*</span>China</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">2</td>
                    <td className="ap-td-mono">15</td>
                    <td className="ap-td-mono">3</td>
                    <td className="ap-td-mono">6</td>
                    <td className="ap-td-mono ap-td-bold">26</td>
                    <td className="ap-td-mono">9/13/2026</td>
                    <td className="ap-td-mono">$440k</td>
                    <td className="ap-td-mono">$25.5k</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-mono">$205k</td>
                    <td className="ap-td-price">$670,500</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Guangdong Keyuan Electric</td>
                    <td><span className="ap-feoc">*</span>China</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">4</td>
                    <td className="ap-td-mono">18</td>
                    <td className="ap-td-mono">6</td>
                    <td className="ap-td-mono">8</td>
                    <td className="ap-td-mono ap-td-bold">36</td>
                    <td className="ap-td-mono">11/22/2026</td>
                    <td className="ap-td-mono">$305k</td>
                    <td className="ap-td-mono">$60k</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-mono">TBD (~$154k)</td>
                    <td className="ap-td-price">~~$519,500</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Jiangsu Yawei Transformer</td>
                    <td><span className="ap-feoc">*</span>China</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">2</td>
                    <td className="ap-td-mono">12</td>
                    <td className="ap-td-mono">1</td>
                    <td className="ap-td-mono">6</td>
                    <td className="ap-td-mono ap-td-bold">20+UL</td>
                    <td className="ap-td-mono">8/2/2026+UL</td>
                    <td className="ap-td-mono">$368k</td>
                    <td className="ap-td-mono">$3k</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-mono">$104.5k</td>
                    <td className="ap-td-price">$474,797</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">PEL</td>
                    <td>Pakistan</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">6</td>
                    <td className="ap-td-mono">23</td>
                    <td className="ap-td-mono">TBD</td>
                    <td className="ap-td-mono">8</td>
                    <td className="ap-td-mono ap-td-bold">37+UL</td>
                    <td className="ap-td-mono">12/6/2026+UL</td>
                    <td className="ap-td-mono">$572k</td>
                    <td className="ap-td-mono">TBD</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-mono">Incl.</td>
                    <td className="ap-td-price">$572,297</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="ap-footnote"><span className="ap-feoc">*</span>Denotes FEOC</p>
          </div>
        </section>

        {/* ========== SLIDE 4 — TOP QUOTES QUALITY ========== */}
        <section className="ap-slide ap-slide-table" ref={s4.ref}>
          <div className={`ap-content ${s4.inView ? "in" : ""}`}>
            <div className="ap-slide-label">QUALITY ASSESSMENT</div>
            <h2 className="ap-h2">Top Quotes for 20 MVA Project (Quality)</h2>

            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Origin</th>
                    <th>UL / NRTL</th>
                    <th>Year Founded</th>
                    <th>U.S. Service / Partner</th>
                    <th>N.A. Past Perf. 5 yrs (pcs)</th>
                    <th>N.A. Project Locations</th>
                    <th>Size Range (MVA)</th>
                    <th>Industries</th>
                    <th>Customers</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="ap-td-name">Jinpan International (JST)</td>
                    <td><span className="ap-feoc">*</span>China HQ &amp; supply, Mexico fab.</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">1993</td>
                    <td>FL and VA offices, In-house</td>
                    <td className="ap-td-mono">&gt;1,000</td>
                    <td>US</td>
                    <td className="ap-td-mono">Up to 100 in China</td>
                    <td>Utility, Solar Data Center</td>
                    <td>Florida utility, German solar dev, hyperscaler</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">International Electric Co (IEC)</td>
                    <td>S. Korea</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">1946</td>
                    <td>Dallas office, inventory / RESA Power</td>
                    <td className="ap-td-mono">&gt;4700</td>
                    <td>FL, CA, AZ, CAN</td>
                    <td className="ap-td-mono">Up to 60</td>
                    <td>Utility, Solar Data Center</td>
                    <td>Transformer OEMs, Amazon, Centerpoint</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Jiangsu First Power</td>
                    <td><span className="ap-feoc">*</span>China</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">2004</td>
                    <td>Dallas office, inventory</td>
                    <td className="ap-td-mono">&gt;500</td>
                    <td>TX, PR, Other US</td>
                    <td className="ap-td-mono">Up to 400</td>
                    <td>BTC Mining Data Center</td>
                    <td>SpaceX</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Guangdong Keyuan Electric</td>
                    <td><span className="ap-feoc">*</span>China</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">2007</td>
                    <td>NY and Dallas office / Partner in negotiations</td>
                    <td className="ap-td-mono">&gt;10</td>
                    <td>CAN</td>
                    <td className="ap-td-mono">Up to 20</td>
                    <td>Utility, Storage, Data Center</td>
                    <td>Transformer OEMs, China Southern</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Jiangsu Yawei Transformer</td>
                    <td><span className="ap-feoc">*</span>China</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">1992</td>
                    <td>Houston office, inventory</td>
                    <td className="ap-td-mono">&gt;50</td>
                    <td>OH, Other US</td>
                    <td className="ap-td-mono">Up to 50</td>
                    <td>BTC Mining Data Center</td>
                    <td>BJIN</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">PEL</td>
                    <td>Pakistan</td>
                    <td><ULCheck /></td>
                    <td className="ap-td-mono">1956</td>
                    <td>Emerald Transformers</td>
                    <td className="ap-td-mono">&gt;800</td>
                    <td>CA</td>
                    <td className="ap-td-mono">Up to 100</td>
                    <td>Data Center</td>
                    <td>Tesla</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="ap-footnote"><span className="ap-feoc">*</span>Denotes FEOC</p>
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

  .ap-grid-bg { position: absolute; inset: 0; z-index: 0; opacity: 0.8; }

  .ap-glow {
    position: absolute; border-radius: 50%;
    filter: blur(120px); pointer-events: none; z-index: 0;
  }
  .ap-glow-1 { width: 600px; height: 600px; top: -100px; right: -100px; background: rgba(45,140,255,0.08); animation: ap-float 8s ease-in-out infinite; }
  .ap-glow-2 { width: 400px; height: 400px; bottom: -50px; left: 10%; background: rgba(230,57,70,0.05); animation: ap-float 10s ease-in-out infinite reverse; }
  .ap-glow-3 { width: 500px; height: 500px; top: 20%; right: -100px; background: rgba(45,140,255,0.06); animation: ap-float 9s ease-in-out infinite; }

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
    padding: 60px 80px; width: 100%; max-width: 1400px;
    margin: 0 auto; z-index: 1;
  }

  /* ---- ANIMATIONS ---- */
  .ap-content.in .ap-slide-label,
  .ap-content.in .ap-h2,
  .ap-content.in > .ap-p,
  .ap-content.in .ap-table-wrap,
  .ap-content.in .ap-footnote {
    animation: ap-fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .ap-content .ap-slide-label { opacity: 0; animation-delay: 0s; }
  .ap-content .ap-h2 { opacity: 0; animation-delay: 0.1s; }
  .ap-content > .ap-p { opacity: 0; animation-delay: 0.2s; }
  .ap-content .ap-table-wrap { opacity: 0; animation-delay: 0.15s; }
  .ap-content .ap-footnote { opacity: 0; animation-delay: 0.25s; }

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

  .ap-p {
    color: var(--ap-text); font-size: 14px; line-height: 1.7;
    margin-bottom: 12px; font-family: 'Inter', sans-serif;
  }

  .ap-footnote {
    font-family: 'Inter', sans-serif; font-size: 12px;
    color: var(--ap-text-dim); margin-top: 12px; font-style: italic;
  }

  .ap-feoc {
    color: var(--ap-red); font-weight: 700; margin-right: 2px;
  }

  /* ---- UL CHECK ---- */
  .ap-ul-check {
    display: inline-flex; align-items: center; justify-content: center;
    color: var(--ap-green);
  }

  /* ---- TABLE ---- */
  .ap-table-wrap {
    margin-top: 16px;
    border-radius: var(--ap-radius);
    overflow: hidden;
    border: 1px solid var(--ap-border);
    overflow-x: auto;
  }
  .ap-table {
    width: 100%; border-collapse: collapse;
    font-family: 'Inter', sans-serif; font-size: 13px;
    min-width: 900px;
  }
  .ap-table-compact { font-size: 11px; min-width: 1200px; }
  .ap-table-compact th { padding: 12px 10px; font-size: 9px; }
  .ap-table-compact td { padding: 10px 10px; }

  .ap-table th {
    padding: 14px 16px; text-align: left;
    font-weight: 600; font-size: 10px;
    color: var(--ap-blue); text-transform: uppercase;
    letter-spacing: 1.5px;
    background: rgba(45,140,255,0.06);
    border-bottom: 1px solid rgba(45,140,255,0.15);
    white-space: nowrap;
  }
  .ap-table td {
    padding: 12px 16px; color: var(--ap-text);
    border-bottom: 1px solid var(--ap-border);
    vertical-align: top;
  }
  .ap-table tr:last-child td { border-bottom: none; }
  .ap-table tr:hover td { background: rgba(255,255,255,0.02); }

  .ap-td-name { color: #fff !important; font-weight: 600; white-space: nowrap; }
  .ap-td-mono {
    font-family: 'JetBrains Mono', monospace; font-size: 12px;
    text-align: center;
  }
  .ap-table-compact .ap-td-mono { font-size: 10px; }
  .ap-td-bold { font-weight: 700; color: #fff !important; }
  .ap-td-price {
    font-family: 'JetBrains Mono', monospace;
    color: var(--ap-blue) !important; font-weight: 700;
    white-space: nowrap;
  }
  .ap-table-compact .ap-td-price { font-size: 11px; }

  /* ---- MOBILE ---- */
  @media (max-width: 768px) {
    html, body { overflow: auto !important; }
    .ap-container {
      position: relative !important; inset: auto !important;
      overflow-y: visible !important; scroll-snap-type: none !important;
    }
    .ap-slide { min-height: auto; padding: 48px 0; scroll-snap-align: none; }
    .ap-slide:first-child { min-height: 100vh; min-height: 100svh; padding: 0; }
    .ap-content { padding: 24px 16px; }
    .ap-title-content { padding: 40px 24px; }
    .ap-h2 { font-size: 28px; }
    .ap-progress { display: none; }
    .ap-nav { display: none; }
    .ap-scroll-hint { display: none; }
  }
`;
