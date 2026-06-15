import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles, ScanFace, Target, ArrowRight,
  ShieldCheck, Zap, Star, CheckCircle2, ChevronDown
} from 'lucide-react';

/* ─── SPRING EASING ─── */
const SPRING = [0.22, 1, 0.36, 1];

/* ─── ANIMATED COUNT-UP ─── */
function CountUp({ end, suffix = '', duration = 2200 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className="stat-number">
      {count.toLocaleString()}{suffix}
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
    <span className={`eyebrow-pill eyebrow-${color}`}>
      <span className={`eyebrow-dot dot-${color}`} />
      {children}
    </span>
  );
}

/* ─── SHIMMER TEXT ─── */
function ShimmerText({ children }) {
  return <span className="shimmer-text">{children}</span>;
}

export default function HomePage() {
  return (
    <div className="sw-home">
      <style>{`
        /* ═══════════════════════════════════════
           LIGHT MODE TOKENS  (default)
        ═══════════════════════════════════════ */
        .sw-home {
          /* Surfaces — clean, airy, barely-there warmth */
          --bg-0:          #fafafa;
          --bg-1:          #f5f5f7;
          --bg-card:       #ffffff;
          --bg-card-hover: #fef6f7;

          /* Text */
          --txt-primary:   #111118;
          --txt-secondary: #4a4a5a;
          --txt-muted:     #7a7a8e;
          --txt-hint:      #b0b0c0;

          /* Rose accent — the only colour accent */
          --rose-400: #fb7185;
          --rose-500: #f43f5e;
          --rose-600: #e11d48;
          --rose-soft:        rgba(244, 63, 94, 0.07);
          --rose-soft-border: rgba(244, 63, 94, 0.16);

          /* Green accent */
          --green-400: #34d399;
          --green-500: #10b981;
          --green-soft:        rgba(16, 185, 129, 0.07);
          --green-soft-border: rgba(16, 185, 129, 0.16);

          /* Borders */
          --border:        rgba(0, 0, 0, 0.07);
          --border-strong: rgba(0, 0, 0, 0.13);

          /* Glass (light) */
          --glass:         rgba(255,255,255,0.72);
          --glass-strong:  rgba(255,255,255,0.88);
          --glass-border:  rgba(0, 0, 0, 0.08);

          /* Orbs — pure rose + green only */
          --orb-rose:  rgba(244, 63, 94, 0.09);
          --orb-green: rgba( 16,185,129, 0.06);

          /* Grid */
          --grid-line: rgba(0, 0, 0, 0.04);

          /* Shimmer — rose → soft rose → green, no amber */
          --shimmer-a: #f43f5e;
          --shimmer-b: #fb7185;
          --shimmer-c: #10b981;

          /* Stat number gradient */
          --stat-from: #111118;
          --stat-to:   rgba(17,17,24,0.40);

          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg-0);
          color: var(--txt-primary);
          overflow-x: hidden;
          transition: background 0.35s ease, color 0.35s ease;
        }

        /* ═══════════════════════════════════════
           DARK MODE TOKENS  (via .dark on <html>)
        ═══════════════════════════════════════ */
        .dark .sw-home {
          /* Lifted dark — deep slate, not near-black */
          --bg-0:          #14141e;
          --bg-1:          #1c1c2a;
          --bg-card:       rgba(255,255,255,0.04);
          --bg-card-hover: rgba(255,255,255,0.07);

          --txt-primary:   rgba(255,255,255,0.93);
          --txt-secondary: rgba(255,255,255,0.62);
          --txt-muted:     rgba(255,255,255,0.40);
          --txt-hint:      rgba(255,255,255,0.22);

          /* Rose stays rose — no amber drift */
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
          --glass-strong:  rgba(255,255,255,0.050);
          --glass-border:  rgba(255,255,255,0.09);

          /* Orbs — rose + green only, no amber */
          --orb-rose:  rgba(244, 63, 94, 0.14);
          --orb-green: rgba( 16,185,129, 0.09);

          --grid-line: rgba(255,255,255,0.035);

          --stat-from: #ffffff;
          --stat-to:   rgba(255,255,255,0.45);
        }

        /* ── GRID OVERLAY ── */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        /* ── RADIAL ORBS ── */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
        }
        .orb-rose  { background: var(--orb-rose); }
        .orb-green { background: var(--orb-green); }

        /* ── EYEBROW PILLS ── */
        .eyebrow-pill {
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
        .eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dot-rose  { background: var(--rose-500); }
        .dot-green { background: var(--green-500); }

        /* ── SHIMMER TEXT ── */
        @keyframes shimmer-skin {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .shimmer-text {
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
          animation: shimmer-skin 4s linear infinite;
        }

        /* ── GRADIENT DIVIDERS ── */
        .gradient-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--rose-500) 25%,
            var(--green-500) 75%,
            transparent 100%
          );
          opacity: 0.25;
        }

        /* ── CONTAINER ── */
        .sw-container {
          max-width: 1160px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ══════════════════════
           HERO
        ══════════════════════ */
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 120px 0 100px;
          background: var(--bg-0);
        }
        .hero-inner {
          position: relative;
          z-index: 2;
          max-width: 860px;
          margin: 0 auto;
          text-align: center;
        }
        .hero-h1 {
          font-size: clamp(2.8rem, 7vw, 5.2rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
          color: var(--txt-primary);
          margin: 20px 0 0;
        }
        .hero-sub {
          font-size: 1.1rem;
          color: var(--txt-secondary);
          line-height: 1.75;
          max-width: 500px;
          margin: 24px auto 0;
        }
        .hero-cta-row {
          display: flex;
          gap: 14px;
          justify-content: center;
          margin-top: 40px;
          flex-wrap: wrap;
        }

        /* ── BUTTONS ── */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, var(--rose-500), var(--rose-600));
          color: #fff;
          padding: 14px 28px;
          border-radius: 100px;
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(244,63,94,0.30);
        }
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid var(--border-strong);
          color: var(--txt-secondary);
          padding: 14px 28px;
          border-radius: 100px;
          font-weight: 500;
          font-size: 0.95rem;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        .btn-ghost:hover {
          background: var(--rose-soft);
          border-color: var(--rose-soft-border);
          color: var(--rose-500);
        }

        /* ── SCROLL INDICATOR ── */
        @keyframes bounce-y {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(6px); }
        }
        .scroll-indicator {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          color: var(--txt-hint);
          animation: bounce-y 2s ease-in-out infinite;
          z-index: 2;
        }

        /* ══════════════════════
           STATS BAND
        ══════════════════════ */
        .stats-section {
          position: relative;
          padding: 72px 0;
          background: var(--bg-1);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }
        .stat-cell {
          padding: 36px 28px;
          text-align: center;
          border-right: 1px solid var(--border);
        }
        .stat-cell:last-child { border-right: none; }
        .stat-number {
          font-size: clamp(2.8rem, 5vw, 5rem);
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, var(--stat-from) 40%, var(--stat-to) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
        }
        .stat-label {
          font-size: 0.75rem;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: var(--txt-muted);
          margin-top: 10px;
          font-family: 'JetBrains Mono', monospace;
        }

        /* ══════════════════════
           VALUE PROPS
        ══════════════════════ */
        .value-section {
          position: relative;
          padding: 112px 0;
          background: var(--bg-0);
        }
        .section-header {
          text-align: center;
          margin-bottom: 64px;
        }
        .section-h2 {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--txt-primary);
          margin: 16px 0 0;
          line-height: 1.1;
        }
        .section-sub {
          font-size: 0.975rem;
          color: var(--txt-muted);
          margin-top: 12px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.7;
        }
        .props-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .prop-card {
          padding: 32px;
          border-radius: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          transition: border-color 0.3s ease, transform 0.3s ease, background 0.3s ease;
        }
        .prop-card:hover {
          border-color: var(--border-strong);
          background: var(--bg-card-hover);
          transform: translateY(-4px);
        }
        .prop-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .icon-rose  { background: var(--rose-soft);  color: var(--rose-500); }
        .icon-green { background: var(--green-soft);  color: var(--green-500); }
        .icon-rose2 { background: rgba(244,63,94,0.10); color: var(--rose-400); }
        .prop-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--txt-primary);
          margin-bottom: 8px;
        }
        .prop-body {
          font-size: 0.875rem;
          color: var(--txt-muted);
          line-height: 1.72;
        }

        /* ══════════════════════
           PROBLEM / STAT (editorial)
        ══════════════════════ */
        .problem-section {
          position: relative;
          padding: 112px 0;
          background: var(--bg-1);
        }
        .editorial-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .problem-list {
          list-style: none;
          padding: 0; margin: 28px 0 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .problem-item {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          transition: border-color 0.25s ease;
        }
        .problem-item:hover { border-color: var(--rose-soft-border); }
        .check-icon { color: var(--green-500); flex-shrink: 0; margin-top: 1px; }
        .problem-item-title {
          font-weight: 600;
          font-size: 0.92rem;
          color: var(--txt-primary);
          margin-bottom: 4px;
        }
        .problem-item-body {
          font-size: 0.84rem;
          color: var(--txt-muted);
          line-height: 1.62;
        }
        .big-stat-block {
          display: flex;
          flex-direction: column;
          gap: 36px;
        }
        .big-stat-item {
          padding-bottom: 36px;
          border-bottom: 1px solid var(--border);
        }
        .big-stat-item:last-child { border-bottom: none; padding-bottom: 0; }
        .big-stat-label {
          font-size: 0.88rem;
          color: var(--txt-secondary);
          margin-top: 6px;
          line-height: 1.5;
        }
        .big-stat-accent { color: var(--rose-500); font-weight: 600; }
        .big-stat-source {
          font-size: 0.72rem;
          color: var(--txt-hint);
          margin-top: 6px;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.04em;
        }

        /* ══════════════════════
           HOW IT WORKS
        ══════════════════════ */
        .hiw-section {
          position: relative;
          padding: 112px 0;
          background: var(--bg-0);
        }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          margin-top: 64px;
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
        }
        .step-card {
          padding: 40px 28px;
          background: var(--bg-card);
          position: relative;
          border-right: 1px solid var(--border);
          transition: background 0.25s ease;
        }
        .step-card:last-child { border-right: none; }
        .step-card:hover { background: var(--bg-card-hover); }
        .step-accent-line {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
        }
        .acc-rose  { background: linear-gradient(90deg, var(--rose-500), transparent); }
        .acc-green { background: linear-gradient(90deg, var(--green-500), transparent); }
        .acc-mix   { background: linear-gradient(90deg, var(--rose-500), var(--green-500)); }
        .acc-rose2 { background: linear-gradient(90deg, var(--rose-400), transparent); }
        .step-num {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.04em;
          color: var(--border-strong);
          margin-bottom: 20px;
        }
        .step-title {
          font-size: 0.98rem;
          font-weight: 700;
          color: var(--txt-primary);
          margin-bottom: 8px;
        }
        .step-body {
          font-size: 0.84rem;
          color: var(--txt-muted);
          line-height: 1.7;
        }

        /* ══════════════════════
           TESTIMONIALS
        ══════════════════════ */
        .testimonial-section {
          position: relative;
          padding: 112px 0;
          background: var(--bg-1);
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 64px;
        }
        .testimonial-card {
          padding: 32px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          transition: border-color 0.25s ease, transform 0.25s ease;
        }
        .testimonial-card:hover {
          border-color: var(--rose-soft-border);
          transform: translateY(-3px);
        }
        .stars { display: flex; gap: 4px; margin-bottom: 16px; color: var(--rose-500); }
        .testimonial-text {
          font-size: 0.92rem;
          color: var(--txt-secondary);
          line-height: 1.78;
          margin-bottom: 24px;
          font-style: italic;
        }
        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--rose-500), var(--rose-400));
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.82rem;
          color: #fff;
          flex-shrink: 0;
        }
        .author-name { font-weight: 600; font-size: 0.88rem; color: var(--txt-primary); }
        .author-meta { font-size: 0.78rem; color: var(--txt-hint); }

        /* ══════════════════════
           CTA
        ══════════════════════ */
        .cta-section {
          position: relative;
          padding: 120px 0;
          background: var(--bg-0);
          text-align: center;
          overflow: hidden;
        }
        .cta-h2 {
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--txt-primary);
          line-height: 1.1;
          margin: 16px 0 0;
        }
        .cta-sub {
          font-size: 0.975rem;
          color: var(--txt-muted);
          margin: 16px auto 0;
          max-width: 380px;
          line-height: 1.7;
        }
        .cta-row {
          display: flex;
          gap: 14px;
          justify-content: center;
          margin-top: 40px;
          flex-wrap: wrap;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .editorial-grid { grid-template-columns: 1fr; gap: 48px; }
          .stat-cell { border-right: none; border-bottom: 1px solid var(--border); }
          .stat-cell:last-child { border-bottom: none; }
          .steps-grid { grid-template-columns: 1fr; }
          .step-card { border-right: none; border-bottom: 1px solid var(--border); }
          .step-card:last-child { border-bottom: none; }
        }

        /* ── REDUCED MOTION ── */
        @media (prefers-reduced-motion: reduce) {
          .shimmer-text { animation: none; }
          * { transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section className="hero-section">
        <div className="grid-overlay" />
        <div className="orb orb-rose"  style={{ width: 560, height: 560, top: '-8%',  left: '55%' }} />
        <div className="orb orb-green" style={{ width: 380, height: 380, top: '45%',  left: '-6%' }} />
        <div className="orb orb-rose"  style={{ width: 260, height: 260, bottom: '6%', right: '8%', opacity: 0.5 }} />

        <div className="sw-container">
          <div className="hero-inner">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: SPRING }}
            >
              <Eyebrow color="rose">Clinical AI · Personalized Skincare</Eyebrow>
            </motion.div>

            <motion.h1
              className="hero-h1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: SPRING }}
            >
              Decode your skin with{' '}
              <ShimmerText>AI precision.</ShimmerText>
            </motion.h1>

            <motion.p
              className="hero-sub"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: SPRING }}
            >
              Upload a selfie and let our clinical-grade AI analyze your skin conditions.
              Get a dermatologist-approved routine in seconds — made only for you.
            </motion.p>

            <motion.div
              className="hero-cta-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: SPRING }}
            >
              <Link to="/register" className="btn-primary">
                Get Your Free Analysis <ArrowRight size={16} />
              </Link>
              <Link to="/features" className="btn-ghost">
                See How It Works
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="scroll-indicator">
          <ChevronDown size={22} />
        </div>
      </section>

      <div className="gradient-divider" />

      {/* ══════════════════════════════
          STATS BAND
      ══════════════════════════════ */}
      <section className="stats-section">
        <div className="sw-container">
          <div className="stats-grid">
            {[
              { end: 94,     suffix: '%', label: 'Detection Accuracy' },
              { end: 120000, suffix: '+', label: 'Skin Analyses Done' },
              { end: 3,      suffix: 's', label: 'Average Scan Time' },
              { end: 98,     suffix: '%', label: 'User Satisfaction' },
            ].map(({ end, suffix, label }, i) => (
              <FadeUp key={label} delay={i * 0.08}>
                <div className="stat-cell">
                  <CountUp end={end} suffix={suffix} />
                  <div className="stat-label">{label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="gradient-divider" />

      {/* ══════════════════════════════
          VALUE PROPS
      ══════════════════════════════ */}
      <section className="value-section">
        <div className="grid-overlay" />
        <div className="sw-container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-header">
            <FadeUp>
              <Eyebrow color="rose">What SkinWise Does</Eyebrow>
              <h2 className="section-h2">
                Everything your skin needs.<br />
                <ShimmerText>Nothing it doesn't.</ShimmerText>
              </h2>
              <p className="section-sub">
                Three pillars that make SkinWise the only skincare tool you'll ever need.
              </p>
            </FadeUp>
          </div>

          <div className="props-grid">
            {[
              {
                icon: <ScanFace size={22} />,
                iconClass: 'icon-rose',
                color: 'rose',
                tag: 'YOLOv8 Engine',
                title: 'Clinical AI Scanning',
                body: 'Our proprietary YOLOv8 engine detects acne, wrinkles, pigmentation, and hydration levels with sub-millimeter accuracy — the same tech used in clinical dermatology.',
              },
              {
                icon: <Target size={22} />,
                iconClass: 'icon-green',
                color: 'green',
                tag: 'Adapts Daily',
                title: 'Dynamic Routines',
                body: 'Routines that adapt daily based on your local weather, UV index, and self-reported skin feel. No more one-size-fits-all advice.',
              },
              {
                icon: <ShieldCheck size={22} />,
                iconClass: 'icon-rose2',
                color: 'rose',
                tag: 'Conflict-Free',
                title: 'Ingredient Safety',
                body: 'Every recommendation is cross-referenced so you never mix conflicting actives — like Retinol with AHAs — keeping your skin barrier safe.',
              },
            ].map(({ icon, iconClass, color, tag, title, body }, i) => (
              <FadeUp key={title} delay={i * 0.1}>
                <div className="prop-card">
                  <div className={`prop-icon ${iconClass}`}>{icon}</div>
                  <div style={{ marginBottom: 10 }}>
                    <Eyebrow color={color}>{tag}</Eyebrow>
                  </div>
                  <div className="prop-title">{title}</div>
                  <div className="prop-body">{body}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="gradient-divider" />

      {/* ══════════════════════════════
          PROBLEM / STAT — 2-col editorial
      ══════════════════════════════ */}
      <section className="problem-section">
        <div className="orb orb-green" style={{ width: 480, height: 480, top: '15%', right: '-8%' }} />
        <div className="sw-container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="editorial-grid">
            {/* LEFT — problem list */}
            <FadeUp>
              <Eyebrow color="rose">Why It Matters</Eyebrow>
              <h2 className="section-h2" style={{ marginTop: 16 }}>
                Skincare is broken.<br />
                <ShimmerText>We're fixing it.</ShimmerText>
              </h2>
              <ul className="problem-list">
                {[
                  {
                    title: 'Generic advice ignores your skin',
                    body: 'Most apps give you the same routine regardless of your skin type, climate, or concerns.',
                  },
                  {
                    title: 'Dangerous ingredient combos',
                    body: 'Mixing the wrong actives can damage your skin barrier — and most people have no idea.',
                  },
                  {
                    title: 'Dermatologist access is expensive',
                    body: 'A single consultation can cost hundreds. SkinWise gives you clinical-grade insights for free.',
                  },
                ].map(({ title, body }, i) => (
                  <motion.li
                    key={title}
                    className="problem-item"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, delay: i * 0.1, ease: SPRING }}
                  >
                    <CheckCircle2 size={18} className="check-icon" />
                    <div>
                      <div className="problem-item-title">{title}</div>
                      <div className="problem-item-body">{body}</div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </FadeUp>

            {/* RIGHT — big stats */}
            <FadeUp delay={0.15}>
              <div className="big-stat-block">
                {[
                  {
                    end: 67, suffix: '%',
                    accent: 'of people',
                    rest: ' use products wrong for their skin type',
                    source: 'Dermatology Research Journal, 2024',
                  },
                  {
                    end: 3, suffix: 'x',
                    accent: 'faster results',
                    rest: ' vs. trial-and-error skincare',
                    source: 'SkinWise user data, 6-month study',
                  },
                  {
                    end: 12, suffix: '+',
                    accent: 'conditions detected',
                    rest: ' from a single selfie scan',
                    source: 'Acne, rosacea, pigmentation, hydration & more',
                  },
                ].map(({ end, suffix, accent, rest, source }, i) => (
                  <div key={i} className="big-stat-item">
                    <CountUp end={end} suffix={suffix} />
                    <div className="big-stat-label">
                      <span className="big-stat-accent">{accent}</span>{rest}
                    </div>
                    <div className="big-stat-source">{source}</div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      <div className="gradient-divider" />

      {/* ══════════════════════════════
          HOW IT WORKS
      ══════════════════════════════ */}
      <section className="hiw-section">
        <div className="grid-overlay" />
        <div className="sw-container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-header">
            <FadeUp>
              <Eyebrow color="green">The Process</Eyebrow>
              <h2 className="section-h2" style={{ marginTop: 16 }}>
                From selfie to routine<br />
                <ShimmerText>in under 10 seconds.</ShimmerText>
              </h2>
            </FadeUp>
          </div>

          <div className="steps-grid">
            {[
              { num: '01', title: 'Upload Your Selfie', body: 'Take or upload a clear front-facing photo. Good lighting is all you need.', accent: 'acc-rose' },
              { num: '02', title: 'AI Scans Your Skin', body: 'YOLOv8 maps 12+ conditions across your face in under 3 seconds.', accent: 'acc-rose2' },
              { num: '03', title: 'Get Your Analysis', body: 'A detailed breakdown of every condition detected, ranked by severity.', accent: 'acc-green' },
              { num: '04', title: 'Follow Your Routine', body: 'A safe, ingredient-checked routine — updated as your skin changes.', accent: 'acc-mix' },
            ].map(({ num, title, body, accent }, i) => (
              <FadeUp key={num} delay={i * 0.08}>
                <div className="step-card">
                  <div className={`step-accent-line ${accent}`} />
                  <div className="step-num">{num}</div>
                  <div className="step-title">{title}</div>
                  <div className="step-body">{body}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="gradient-divider" />

      {/* ══════════════════════════════
          TESTIMONIALS
      ══════════════════════════════ */}
      <section className="testimonial-section">
        <div className="orb orb-rose" style={{ width: 360, height: 360, bottom: '-4%', left: '-4%', opacity: 0.6 }} />
        <div className="sw-container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-header">
            <FadeUp>
              <Eyebrow color="rose">Real Results</Eyebrow>
              <h2 className="section-h2" style={{ marginTop: 16 }}>
                Skin that speaks<br />
                <ShimmerText>for itself.</ShimmerText>
              </h2>
            </FadeUp>
          </div>

          <div className="testimonials-grid">
            {[
              {
                initials: 'AP', name: 'Aanya P.', meta: 'Oily + Acne-prone',
                text: "I've tried every app out there. SkinWise was the first one that actually told me why I was breaking out — not just what to put on my face.",
              },
              {
                initials: 'SR', name: 'Sara R.', meta: 'Sensitive + Rosacea',
                text: "The ingredient checker alone is worth it. It caught a combination in my old routine that was making my redness so much worse. Game-changer.",
              },
              {
                initials: 'MK', name: 'Maya K.', meta: 'Dry + Hyperpigmentation',
                text: "Three weeks in and my dark spots are visibly fading. The routine adapts to the weather — I've never had something so personalised.",
              },
            ].map(({ initials, name, meta, text }, i) => (
              <FadeUp key={name} delay={i * 0.1}>
                <div className="testimonial-card">
                  <div className="stars">
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                  <p className="testimonial-text">"{text}"</p>
                  <div className="testimonial-author">
                    <div className="avatar">{initials}</div>
                    <div>
                      <div className="author-name">{name}</div>
                      <div className="author-meta">{meta}</div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="gradient-divider" />

      {/* ══════════════════════════════
          CTA
      ══════════════════════════════ */}
      <section className="cta-section">
        <div className="grid-overlay" />
        <div className="orb orb-rose"  style={{ width: 600, height: 360, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.6 }} />
        <div className="orb orb-green" style={{ width: 240, height: 240, top: '12%', right: '12%' }} />
        <div className="sw-container" style={{ position: 'relative', zIndex: 1 }}>
          <FadeUp>
            <Eyebrow color="rose">Start Free</Eyebrow>
            <h2 className="cta-h2">
              Ready to meet<br />
              <ShimmerText>your best skin?</ShimmerText>
            </h2>
            <p className="cta-sub">
              Join 120,000+ people who've already transformed their skincare with clinical AI.
              No credit card. No commitment.
            </p>
            <div className="cta-row">
              <Link to="/register" className="btn-primary">
                Get Your Free Analysis <ArrowRight size={16} />
              </Link>
              <Link to="/features" className="btn-ghost">
                <Zap size={16} /> See Features
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}