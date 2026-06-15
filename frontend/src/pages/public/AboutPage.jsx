import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  Heart, Cpu, Code2, ShieldCheck,
  ArrowRight, Layers, GitBranch, Eye, Lock
} from 'lucide-react';

/* ─── SPRING EASING ─── */
const SPRING = [0.22, 1, 0.36, 1];

/* ─── ANIMATED COUNT-UP (spring physics version) ─── */
function CountUp({ end, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [display, setDisplay] = useState(0);
  const springVal = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (inView) springVal.set(end);
  }, [inView, end, springVal]);

  useEffect(() => {
    return springVal.on('change', (v) => setDisplay(Math.floor(v)));
  }, [springVal]);

  return (
    <span ref={ref} className="ab-stat-num">
      {prefix}{display}{suffix}
    </span>
  );
}

/* ─── SCROLL-TRIGGERED FADE UP ─── */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: SPRING }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── EYEBROW PILL ─── */
function Eyebrow({ color = 'rose', children }) {
  return (
    <span className={`ab-eyebrow eyebrow-${color}`}>
      <span className={`ab-dot dot-${color}`} />
      {children}
    </span>
  );
}

/* ─── SHIMMER TEXT ─── */
function ShimmerText({ children }) {
  return <span className="ab-shimmer">{children}</span>;
}

export default function AboutPage() {
  return (
    <div className="sw-about">
      <style>{`

        /* ═══════════════════════════════════════
           LIGHT MODE TOKENS
        ═══════════════════════════════════════ */
        .sw-about {
          --bg-0:          #fafafa;
          --bg-1:          #f5f5f7;
          --bg-card:       #ffffff;
          --bg-card-hover: #fef6f7;

          --txt-primary:   #111118;
          --txt-secondary: #4a4a5a;
          --txt-muted:     #7a7a8e;
          --txt-hint:      #b0b0c0;

          --rose-400: #fb7185;
          --rose-500: #f43f5e;
          --rose-600: #e11d48;
          --rose-soft:        rgba(244, 63, 94, 0.07);
          --rose-soft-border: rgba(244, 63, 94, 0.16);

          --green-400: #34d399;
          --green-500: #10b981;
          --green-soft:        rgba(16, 185, 129, 0.07);
          --green-soft-border: rgba(16, 185, 129, 0.16);

          --border:        rgba(0, 0, 0, 0.07);
          --border-strong: rgba(0, 0, 0, 0.13);

          --glass:         rgba(255,255,255,0.72);
          --glass-border:  rgba(0, 0, 0, 0.08);

          --orb-rose:  rgba(244, 63, 94, 0.09);
          --orb-green: rgba(16, 185, 129, 0.06);

          --grid-line: rgba(0, 0, 0, 0.04);

          --shimmer-a: #f43f5e;
          --shimmer-b: #fb7185;
          --shimmer-c: #10b981;

          --stat-from: #111118;
          --stat-to:   rgba(17,17,24,0.40);

          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg-0);
          color: var(--txt-primary);
          overflow-x: hidden;
          transition: background 0.35s ease, color 0.35s ease;
        }

        /* ═══════════════════════════════════════
           DARK MODE TOKENS
        ═══════════════════════════════════════ */
        .dark .sw-about {
          --bg-0:          #14141e;
          --bg-1:          #1c1c2a;
          --bg-card:       rgba(255,255,255,0.04);
          --bg-card-hover: rgba(255,255,255,0.07);

          --txt-primary:   rgba(255,255,255,0.93);
          --txt-secondary: rgba(255,255,255,0.62);
          --txt-muted:     rgba(255,255,255,0.40);
          --txt-hint:      rgba(255,255,255,0.22);

          --rose-400: #fb7185;
          --rose-500: #f43f5e;
          --rose-600: #e11d48;
          --rose-soft:        rgba(244, 63, 94, 0.14);
          --rose-soft-border: rgba(244, 63, 94, 0.26);
          --green-soft:        rgba(16, 185, 129, 0.11);
          --green-soft-border: rgba(16, 185, 129, 0.22);

          --border:        rgba(255,255,255,0.08);
          --border-strong: rgba(255,255,255,0.14);

          --glass:         rgba(255,255,255,0.028);
          --glass-border:  rgba(255,255,255,0.09);

          --orb-rose:  rgba(244, 63, 94, 0.14);
          --orb-green: rgba(16, 185, 129, 0.09);

          --grid-line: rgba(255,255,255,0.035);

          --stat-from: #ffffff;
          --stat-to:   rgba(255,255,255,0.45);
        }

        /* ── SHARED LAYOUT ── */
        .ab-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .ab-grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        .ab-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
        }
        .ab-orb-rose  { background: var(--orb-rose); }
        .ab-orb-green { background: var(--orb-green); }

        .ab-gradient-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--rose-500) 25%,
            var(--green-500) 75%,
            transparent 100%
          );
          opacity: 0.22;
        }

        /* ── EYEBROW PILLS ── */
        .ab-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 100px;
          padding: 6px 14px;
          font-family: 'JetBrains Mono', 'Fira Mono', ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--txt-muted);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .ab-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dot-rose  { background: var(--rose-500); }
        .dot-green { background: var(--green-500); }

        /* ── SHIMMER TEXT ── */
        @keyframes ab-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .ab-shimmer {
          background: linear-gradient(
            90deg,
            var(--shimmer-a) 0%,
            var(--shimmer-b) 35%,
            var(--shimmer-c) 65%,
            var(--shimmer-a) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ab-shimmer 4s linear infinite;
        }

        /* ── STAT NUMBERS ── */
        .ab-stat-num {
          font-size: clamp(3rem, 6vw, 5.5rem);
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, var(--stat-from) 40%, var(--stat-to) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
        }

        /* ══════════════════════════════
           HERO / MISSION
        ══════════════════════════════ */
        .ab-hero {
          position: relative;
          padding: 130px 0 100px;
          background: var(--bg-0);
          overflow: hidden;
        }
        .ab-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 860px;
          margin: 0 auto;
          text-align: center;
        }
        .ab-hero-h1 {
          font-size: clamp(2.6rem, 6vw, 4.6rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.06;
          color: var(--txt-primary);
          margin: 20px 0 0;
        }
        .ab-hero-body {
          max-width: 680px;
          margin: 36px auto 0;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .ab-hero-body p {
          font-size: 1.05rem;
          color: var(--txt-secondary);
          line-height: 1.78;
          margin: 0;
        }
        .ab-hero-body p strong {
          color: var(--txt-primary);
          font-weight: 600;
        }

        /* ══════════════════════════════
           STATS BAND
        ══════════════════════════════ */
        .ab-stats {
          position: relative;
          padding: 72px 0;
          background: var(--bg-1);
        }
        .ab-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }
        .ab-stat-cell {
          padding: 36px 28px;
          text-align: center;
          border-right: 1px solid var(--border);
        }
        .ab-stat-cell:last-child { border-right: none; }
        .ab-stat-label {
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--txt-muted);
          margin-top: 12px;
          font-family: 'JetBrains Mono', monospace;
        }

        /* ══════════════════════════════
           FOUNDER SECTION (editorial 2-col)
        ══════════════════════════════ */
        .ab-founder {
          position: relative;
          padding: 112px 0;
          background: var(--bg-0);
          overflow: hidden;
        }
        .ab-founder-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
        }
        .ab-founder-left {}
        .ab-section-h2 {
          font-size: clamp(1.9rem, 3.5vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--txt-primary);
          margin: 16px 0 0;
          line-height: 1.1;
        }
        .ab-founder-copy {
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .ab-founder-copy p {
          font-size: 0.95rem;
          color: var(--txt-secondary);
          line-height: 1.78;
          margin: 0;
        }
        /* Tech stack pills */
        .ab-stack-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 28px;
        }
        .ab-stack-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.78rem;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.04em;
          border: 1px solid var(--border-strong);
          color: var(--txt-secondary);
          background: var(--bg-card);
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .ab-stack-pill:hover {
          border-color: var(--rose-soft-border);
          color: var(--rose-500);
        }
        /* Timeline on the right */
        .ab-timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
          padding-left: 28px;
        }
        .ab-timeline::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 8px;
          bottom: 8px;
          width: 1px;
          background: linear-gradient(180deg, var(--rose-500), var(--green-500));
          opacity: 0.3;
        }
        .ab-timeline-item {
          position: relative;
          padding: 0 0 36px 20px;
        }
        .ab-timeline-item:last-child { padding-bottom: 0; }
        .ab-timeline-dot {
          position: absolute;
          left: -28px;
          top: 5px;
          width: 15px; height: 15px;
          border-radius: 50%;
          background: var(--bg-0);
          border: 2px solid var(--rose-500);
          box-shadow: 0 0 0 3px var(--rose-soft);
        }
        .ab-timeline-dot.green {
          border-color: var(--green-500);
          box-shadow: 0 0 0 3px var(--green-soft);
        }
        .ab-timeline-year {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          color: var(--rose-500);
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .ab-timeline-year.green { color: var(--green-500); }
        .ab-timeline-title {
          font-size: 0.98rem;
          font-weight: 700;
          color: var(--txt-primary);
          margin-bottom: 6px;
        }
        .ab-timeline-body {
          font-size: 0.85rem;
          color: var(--txt-muted);
          line-height: 1.65;
        }

        /* ══════════════════════════════
           CORE VALUES (2-tier glass)
        ══════════════════════════════ */
        .ab-values {
          position: relative;
          padding: 112px 0;
          background: var(--bg-1);
          overflow: hidden;
        }
        .ab-values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 64px;
        }
        /* pill glass */
        .ab-value-card {
          padding: 32px;
          border-radius: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          transition: border-color 0.3s ease, transform 0.3s ease, background 0.3s ease;
        }
        .ab-value-card:hover {
          border-color: var(--border-strong);
          background: var(--bg-card-hover);
          transform: translateY(-4px);
        }
        /* strong glass for featured card */
        .ab-value-card.featured {
          background: var(--rose-soft);
          border-color: var(--rose-soft-border);
        }
        .ab-value-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .icon-rose  { background: var(--rose-soft);  color: var(--rose-500); }
        .icon-green { background: var(--green-soft); color: var(--green-500); }
        .icon-muted { background: var(--border);     color: var(--txt-muted); }
        .ab-value-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--txt-primary);
          margin-bottom: 10px;
        }
        .ab-value-body {
          font-size: 0.875rem;
          color: var(--txt-muted);
          line-height: 1.72;
        }

        /* ══════════════════════════════
           PRINCIPLE ROW (alternating)
        ══════════════════════════════ */
        .ab-principles {
          position: relative;
          padding: 112px 0;
          background: var(--bg-0);
          overflow: hidden;
        }
        .ab-principle-item {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
          padding: 56px 0;
          border-bottom: 1px solid var(--border);
        }
        .ab-principle-item:first-child { padding-top: 48px; }
        .ab-principle-item:last-child  { border-bottom: none; padding-bottom: 0; }
        .ab-principle-item.reverse .ab-principle-visual { order: -1; }
        .ab-principle-num {
          font-size: 5rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.05em;
          color: var(--border-strong);
          margin-bottom: 16px;
        }
        .ab-principle-h3 {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--txt-primary);
          margin-bottom: 14px;
        }
        .ab-principle-body {
          font-size: 0.95rem;
          color: var(--txt-secondary);
          line-height: 1.78;
        }
        /* Visual block for alternating section */
        .ab-principle-visual {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 40px 32px;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16px;
          transition: border-color 0.3s ease;
        }
        .ab-principle-visual:hover { border-color: var(--border-strong); }
        .ab-vis-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.82rem;
          color: var(--txt-muted);
        }
        .ab-vis-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .ab-vis-bar {
          flex: 1;
          height: 4px;
          border-radius: 100px;
          background: var(--border);
          overflow: hidden;
        }
        .ab-vis-fill {
          height: 100%;
          border-radius: 100px;
        }
        .fill-rose  { background: var(--rose-500); }
        .fill-green { background: var(--green-500); }
        .fill-muted { background: var(--txt-hint); }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .ab-founder-grid  { grid-template-columns: 1fr; gap: 48px; }
          .ab-principle-item { grid-template-columns: 1fr; gap: 32px; }
          .ab-principle-item.reverse .ab-principle-visual { order: 0; }
          .ab-stat-cell { border-right: none; border-bottom: 1px solid var(--border); }
          .ab-stat-cell:last-child { border-bottom: none; }
        }

        /* ── REDUCED MOTION ── */
        @media (prefers-reduced-motion: reduce) {
          .ab-shimmer { animation: none; }
          * { transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* ══════════════════════════════
          HERO / MISSION
      ══════════════════════════════ */}
      <section className="ab-hero">
        <div className="ab-grid-overlay" />
        <div className="ab-orb ab-orb-rose"  style={{ width: 560, height: 560, top: '-10%', left: '60%' }} />
        <div className="ab-orb ab-orb-green" style={{ width: 380, height: 380, bottom: '0%', left: '-6%' }} />

        <div className="ab-container">
          <div className="ab-hero-inner">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: SPRING }}
            >
              <Eyebrow color="rose">Our Story</Eyebrow>
            </motion.div>

            <motion.h1
              className="ab-hero-h1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: SPRING }}
            >
              Democratizing dermatology<br />
              through <ShimmerText>intelligent architecture.</ShimmerText>
            </motion.h1>

            <motion.div
              className="ab-hero-body"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: SPRING }}
            >
              <p>
                SkinWise was founded on a simple principle: <strong>everyone deserves access to clinical-level insights</strong> without the waiting times or exorbitant costs. What began in 2025 as an initiative to bridge the gap between complex machine learning and everyday personal care has evolved into a comprehensive diagnostic platform.
              </p>
              <p>
                Built on a robust MERN stack by full-stack engineer <strong>Rohit Mishra</strong>, the true engine behind SkinWise is our integration of YOLOv8 computer vision — trained on diverse dermatological datasets to offer actual structural analysis of the skin, not generic quiz results.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="ab-gradient-divider" />

      {/* ══════════════════════════════
          STATS BAND
      ══════════════════════════════ */}
      <section className="ab-stats">
        <div className="ab-container">
          <div className="ab-stats-grid">
            {[
              { prefix: 'YOLOv', end: 8,   suffix: '',   label: 'Core Vision Engine'  },
              { prefix: '',      end: 24,   suffix: '/7', label: 'Real-time Analysis'  },
              { prefix: '',      end: 100,  suffix: '%',  label: 'Privacy Focused'     },
              { prefix: '',      end: 2025, suffix: '',   label: 'Year Founded'        },
            ].map(({ prefix, end, suffix, label }, i) => (
              <FadeUp key={label} delay={i * 0.08}>
                <div className="ab-stat-cell">
                  <CountUp prefix={prefix} end={end} suffix={suffix} />
                  <div className="ab-stat-label">{label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="ab-gradient-divider" />

      {/* ══════════════════════════════
          FOUNDER + TIMELINE (2-col editorial)
      ══════════════════════════════ */}
      <section className="ab-founder">
        <div className="ab-grid-overlay" style={{ opacity: 0.5 }} />
        <div className="ab-orb ab-orb-rose" style={{ width: 420, height: 420, top: '10%', right: '-8%' }} />
        <div className="ab-container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="ab-founder-grid">

            {/* LEFT — copy + stack */}
            <FadeUp>
              <Eyebrow color="rose">The Builder</Eyebrow>
              <h2 className="ab-section-h2" style={{ marginTop: 16 }}>
                One engineer.<br />
                <ShimmerText>A clinical-grade product.</ShimmerText>
              </h2>
              <div className="ab-founder-copy">
                <p>
                  Rohit Mishra built SkinWise to prove that a single engineer with the right stack can create something that rivals enterprise dermatology software. The architecture is deliberately lean — every library earns its place.
                </p>
                <p>
                  The frontend is a React + Vite SPA. The backend is an Express API on Node.js backed by MongoDB Atlas. The AI layer is a Python FastAPI microservice running YOLOv8, containerised and deployed independently so it can scale without touching the main stack.
                </p>
              </div>
              <div className="ab-stack-row">
                {['React', 'Node.js', 'Express', 'MongoDB', 'Python', 'YOLOv8', 'FastAPI', 'Vite'].map(s => (
                  <span key={s} className="ab-stack-pill">{s}</span>
                ))}
              </div>
            </FadeUp>

            {/* RIGHT — timeline */}
            <FadeUp delay={0.15}>
              <div style={{ paddingTop: 4 }}>
                <Eyebrow color="green">Milestones</Eyebrow>
                <div style={{ marginTop: 32 }}>
                  <div className="ab-timeline">
                    {[
                      {
                        year: 'Jan 2025', color: 'rose',
                        title: 'Idea & Research',
                        body: 'Identified the gap between consumer skincare apps and actual clinical tools. Started collecting dermatological datasets.',
                      },
                      {
                        year: 'Mar 2025', color: 'rose',
                        title: 'First YOLOv8 Model',
                        body: 'Trained the initial object detection model on acne and pigmentation datasets. Achieved 87% detection accuracy on test set.',
                      },
                      {
                        year: 'Jun 2025', color: 'green',
                        title: 'Full Stack Integration',
                        body: 'Connected the Python AI microservice to the MERN platform. Users could upload a selfie and receive structured results for the first time.',
                      },
                      {
                        year: 'Aug 2025', color: 'green',
                        title: 'Public Beta Launch',
                        body: 'Launched to 500 beta users. Iterated on the routine recommendation engine based on feedback and real-world scan data.',
                      },
                      {
                        year: 'Now', color: 'green',
                        title: '94% Accuracy · 120k+ Analyses',
                        body: 'Continuous model retraining, 12 detectable conditions, weather-adaptive routines, and a growing user base.',
                      },
                    ].map(({ year, color, title, body }, i) => (
                      <motion.div
                        key={year}
                        className="ab-timeline-item"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, delay: i * 0.08, ease: SPRING }}
                      >
                        <div className={`ab-timeline-dot ${color === 'green' ? 'green' : ''}`} />
                        <div className={`ab-timeline-year ${color === 'green' ? 'green' : ''}`}>{year}</div>
                        <div className="ab-timeline-title">{title}</div>
                        <div className="ab-timeline-body">{body}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeUp>

          </div>
        </div>
      </section>

      <div className="ab-gradient-divider" />

      {/* ══════════════════════════════
          CORE VALUES (glass cards)
      ══════════════════════════════ */}
      <section className="ab-values">
        <div className="ab-orb ab-orb-green" style={{ width: 480, height: 480, bottom: '-5%', right: '-8%' }} />
        <div className="ab-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <FadeUp>
              <Eyebrow color="green">Core Values</Eyebrow>
              <h2 className="ab-section-h2" style={{ marginTop: 16 }}>
                Built for humans.<br />
                <ShimmerText>Powered by code.</ShimmerText>
              </h2>
            </FadeUp>
          </div>

          <div className="ab-values-grid">
            {[
              {
                icon: <Heart size={22} />,
                iconClass: 'icon-rose',
                eyebrow: 'rose',
                tag: 'Accessibility',
                title: 'Accessible Care',
                body: 'Clinical insights shouldn\'t be gated behind premium fees. SkinWise makes complex AI analysis understandable and free for everyone, regardless of where they live.',
              },
              {
                icon: <Cpu size={22} />,
                iconClass: 'icon-green',
                eyebrow: 'green',
                tag: 'Architecture',
                title: 'Precision Engineering',
                body: 'The MERN stack ensures seamless data flow while a dedicated Python microservice handles YOLOv8 image processing — each layer doing exactly one job, well.',
              },
              {
                icon: <GitBranch size={22} />,
                iconClass: 'icon-rose',
                eyebrow: 'rose',
                tag: 'Iteration',
                title: 'Continuous Improvement',
                body: 'As our models process more anonymized data, the detection algorithms become sharper and more inclusive across all skin tones and types.',
              },
              {
                icon: <Lock size={22} />,
                iconClass: 'icon-muted',
                eyebrow: 'green',
                tag: 'Privacy',
                title: 'Absolute Privacy',
                body: 'Your face is your identity. Images are processed securely and never stored or sold. Enterprise-grade encryption at every layer.',
              },
            ].map(({ icon, iconClass, eyebrow, tag, title, body }, i) => (
              <FadeUp key={title} delay={i * 0.09}>
                <div className="ab-value-card">
                  <div className={`ab-value-icon ${iconClass}`}>{icon}</div>
                  <div style={{ marginBottom: 10 }}>
                    <Eyebrow color={eyebrow}>{tag}</Eyebrow>
                  </div>
                  <div className="ab-value-title">{title}</div>
                  <div className="ab-value-body">{body}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="ab-gradient-divider" />

      {/* ══════════════════════════════
          PRINCIPLES (alternating rows)
      ══════════════════════════════ */}
      <section className="ab-principles">
        <div className="ab-grid-overlay" style={{ opacity: 0.5 }} />
        <div className="ab-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <FadeUp>
              <Eyebrow color="rose">How We Think</Eyebrow>
              <h2 className="ab-section-h2" style={{ marginTop: 16 }}>
                The principles behind<br />
                <ShimmerText>every decision we make.</ShimmerText>
              </h2>
            </FadeUp>
          </div>

          {[
            {
              num: '01',
              title: 'Specificity over generality',
              body: 'A routine built for "combination skin" serves nobody well. Every recommendation SkinWise generates is derived from your actual scan data — your conditions, your climate, your history.',
              reverse: false,
              visual: [
                { label: 'Acne (T-zone)',        pct: 82, cls: 'fill-rose' },
                { label: 'Mild pigmentation',    pct: 54, cls: 'fill-green' },
                { label: 'Good hydration',       pct: 78, cls: 'fill-green' },
                { label: 'No active rosacea',    pct: 12, cls: 'fill-muted' },
              ],
            },
            {
              num: '02',
              title: 'Safety as a constraint, not a feature',
              body: 'Ingredient conflict checking isn\'t a premium add-on. It runs on every recommendation, every time, because mixing the wrong actives can cause real harm.',
              reverse: true,
              visual: [
                { label: 'Retinol',   pct: 100, cls: 'fill-rose' },
                { label: 'AHA/BHA',   pct: 100, cls: 'fill-rose' },
                { label: '⚠ Conflict detected', pct: 100, cls: 'fill-rose' },
                { label: 'Niacinamide', pct: 100, cls: 'fill-green' },
              ],
            },
            {
              num: '03',
              title: 'Transparency in every output',
              body: 'We show you the detection confidence, the reasoning, and the sources. You should always know why SkinWise recommended something — not just what to buy.',
              reverse: false,
              visual: [
                { label: 'Detection confidence', pct: 94, cls: 'fill-green' },
                { label: 'Routine match score',  pct: 88, cls: 'fill-green' },
                { label: 'Ingredient safety',    pct: 100, cls: 'fill-green' },
                { label: 'Sources cited',        pct: 100, cls: 'fill-rose' },
              ],
            },
          ].map(({ num, title, body, reverse, visual }, i) => (
            <FadeUp key={num} delay={0.05}>
              <div className={`ab-principle-item ${reverse ? 'reverse' : ''}`}>
                <div>
                  <div className="ab-principle-num">{num}</div>
                  <h3 className="ab-principle-h3">{title}</h3>
                  <p className="ab-principle-body">{body}</p>
                </div>
                <motion.div
                  className="ab-principle-visual"
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: 0.1, ease: SPRING }}
                >
                  {visual.map(({ label, pct, cls }, j) => (
                    <motion.div
                      key={label}
                      className="ab-vis-row"
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: j * 0.07, ease: SPRING }}
                    >
                      <div className={`ab-vis-dot ${cls === 'fill-rose' ? 'fill-rose' : cls === 'fill-green' ? 'fill-green' : 'fill-muted'}`}
                        style={{
                          background: cls === 'fill-rose' ? 'var(--rose-500)'
                            : cls === 'fill-green' ? 'var(--green-500)'
                            : 'var(--txt-hint)'
                        }}
                      />
                      <span style={{ minWidth: 160, fontSize: '0.78rem' }}>{label}</span>
                      <div className="ab-vis-bar">
                        <motion.div
                          className={`ab-vis-fill ${cls}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: j * 0.1 + 0.3, ease: SPRING }}
                        />
                      </div>
                      <span style={{ minWidth: 34, textAlign: 'right', fontSize: '0.78rem', fontFamily: 'monospace' }}>{pct}%</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

    </div>
  );
}