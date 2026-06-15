import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  ScanFace, Sparkles, CloudSun, ShieldCheck,
  Zap, ArrowRight, CheckCircle2, Eye, Layers, Wind
} from 'lucide-react';

const SPRING = [0.22, 1, 0.36, 1];

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

function Eyebrow({ color = 'rose', children }) {
  return (
    <span className={`ft-eyebrow eyebrow-${color}`}>
      <span className={`ft-dot dot-${color}`} />
      {children}
    </span>
  );
}

function ShimmerText({ children }) {
  return <span className="ft-shimmer">{children}</span>;
}

const FEATURES = [
  {
    eyebrow: 'Detection',
    eyebrowColor: 'rose',
    title: 'Real-time Defect Detection',
    body: 'Instantly locate acne, blackheads, pigmentation, and 9 more conditions. Our YOLOv8 engine processes a full facial scan in under 3 seconds with sub-millimeter precision.',
    checks: [
      '12 detectable skin conditions',
      '94% clinical detection accuracy',
      'Confidence score per condition',
    ],
    icon: <ScanFace size={22} />,
    iconColor: 'icon-rose',
    accentBar: 'acc-rose',
    visual: 'detection',
    reverse: false,
  },
  {
    eyebrow: 'Image Quality',
    eyebrowColor: 'green',
    title: 'High-Resolution Upscaling',
    body: 'Bad lighting? Blurry selfie? Our ESRGAN microservice upscales your image up to 4× before analysis — so no condition goes undetected, even on older phones.',
    checks: [
      'Up to 4× ESRGAN upscaling',
      'Works on any modern smartphone',
      'Automatic quality detection',
    ],
    icon: <Sparkles size={22} />,
    iconColor: 'icon-green',
    accentBar: 'acc-green',
    visual: 'upscale',
    reverse: true,
  },
  {
    eyebrow: 'Context-Aware',
    eyebrowColor: 'rose',
    title: 'Weather Context Integration',
    body: 'Your routine adapts automatically based on local UV index, humidity, and temperature — pulled in real time. High UV? SPF is enforced. Dry air? Heavier moisturizers are added.',
    checks: [
      'Real-time weather + UV data',
      'Humidity-aware moisturizer logic',
      'Seasonal routine adjustments',
    ],
    icon: <CloudSun size={22} />,
    iconColor: 'icon-rose',
    accentBar: 'acc-rose',
    visual: 'weather',
    reverse: false,
  },
  {
    eyebrow: 'Safety',
    eyebrowColor: 'green',
    title: 'Ingredient Conflict Checker',
    body: 'Every product recommendation is cross-referenced against a database of known active-ingredient conflicts. Retinol + AHAs, Vitamin C + Niacinamide — we catch them all before you buy.',
    checks: [
      'Conflict-free guarantee on every routine',
      'Covers 200+ active ingredients',
      'Dermatologist-reviewed rule set',
    ],
    icon: <ShieldCheck size={22} />,
    iconColor: 'icon-green',
    accentBar: 'acc-green',
    visual: 'safety',
    reverse: true,
  },
];

/* ── Inline visual illustrations (no images, fully themed) ── */
function FeatureVisual({ type }) {
  if (type === 'detection') return (
    <div className="ft-visual-wrap">
      <div className="ft-vis-face">
        <div className="ft-vis-scan-line" />
        {[
          { top: '22%', left: '38%', label: 'Acne · 94%',        color: 'rose' },
          { top: '48%', left: '18%', label: 'Pore · 88%',        color: 'green' },
          { top: '60%', left: '55%', label: 'Pigmentation · 79%',color: 'rose' },
        ].map(({ top, left, label, color }) => (
          <motion.div
            key={label}
            className={`ft-vis-tag tag-${color}`}
            style={{ top, left }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, ease: SPRING }}
          >
            {label}
          </motion.div>
        ))}
        <div className="ft-vis-face-circle" />
      </div>
      <div className="ft-vis-metrics">
        {[
          { label: 'Conditions Detected', val: '3 / 12', cls: '' },
          { label: 'Scan Time',           val: '2.8s',   cls: '' },
          { label: 'Confidence',          val: '94%',    cls: 'val-rose' },
        ].map(({ label, val, cls }) => (
          <div key={label} className="ft-vis-metric-row">
            <span className="ft-vis-metric-label">{label}</span>
            <span className={`ft-vis-metric-val ${cls}`}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (type === 'upscale') return (
    <div className="ft-visual-wrap">
      <div className="ft-vis-upscale-grid">
        <div className="ft-vis-panel">
          <div className="ft-vis-panel-noise" />
          <span className="ft-vis-panel-label">Original · 480p</span>
        </div>
        <div className="ft-vis-arrow-col">
          <Zap size={20} style={{ color: 'var(--green-500)' }} />
          <span className="ft-vis-arrow-label">ESRGAN<br />4×</span>
        </div>
        <div className="ft-vis-panel ft-vis-panel-sharp">
          <div className="ft-vis-panel-clean" />
          <span className="ft-vis-panel-label">Upscaled · 4K</span>
        </div>
      </div>
      <div className="ft-vis-metrics">
        {[
          { label: 'Upscale Factor',   val: '4×',       cls: 'val-green' },
          { label: 'Processing Time',  val: '~1.2s',    cls: '' },
          { label: 'Detail Recovery',  val: '97%',      cls: 'val-green' },
        ].map(({ label, val, cls }) => (
          <div key={label} className="ft-vis-metric-row">
            <span className="ft-vis-metric-label">{label}</span>
            <span className={`ft-vis-metric-val ${cls}`}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (type === 'weather') return (
    <div className="ft-visual-wrap">
      <div className="ft-vis-weather-cards">
        {[
          { icon: '☀', label: 'UV Index', val: 'High · 8',  note: 'SPF 50 enforced', cls: 'wcard-rose' },
          { icon: '💧', label: 'Humidity', val: '28%',       note: 'Add hyaluronic', cls: 'wcard-green' },
          { icon: '🌡', label: 'Temp',     val: '38°C',      note: 'Lightweight gel', cls: 'wcard-neutral' },
        ].map(({ icon, label, val, note, cls }, i) => (
          <motion.div
            key={label}
            className={`ft-vis-wcard ${cls}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 + 0.2, ease: SPRING }}
          >
            <span className="wcard-icon">{icon}</span>
            <span className="wcard-label">{label}</span>
            <span className="wcard-val">{val}</span>
            <span className="wcard-note">{note}</span>
          </motion.div>
        ))}
      </div>
      <div className="ft-vis-metrics">
        {[
          { label: 'Location',     val: 'Auto-detected', cls: '' },
          { label: 'Update cycle', val: 'Every 6 hrs',  cls: '' },
          { label: 'Adjustments', val: '3 active',      cls: 'val-rose' },
        ].map(({ label, val, cls }) => (
          <div key={label} className="ft-vis-metric-row">
            <span className="ft-vis-metric-label">{label}</span>
            <span className={`ft-vis-metric-val ${cls}`}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (type === 'safety') return (
    <div className="ft-visual-wrap">
      <div className="ft-vis-conflict">
        <div className="ft-vis-conflict-row conflict-bad">
          <span className="conflict-icon">⚠</span>
          <div className="conflict-info">
            <span className="conflict-name">Retinol + AHA</span>
            <span className="conflict-note">Barrier disruption risk — removed</span>
          </div>
        </div>
        <div className="ft-vis-conflict-row conflict-ok">
          <CheckCircle2 size={16} style={{ color: 'var(--green-500)', flexShrink: 0 }} />
          <div className="conflict-info">
            <span className="conflict-name">Niacinamide + Retinol</span>
            <span className="conflict-note">Safe combination — included</span>
          </div>
        </div>
        <div className="ft-vis-conflict-row conflict-ok">
          <CheckCircle2 size={16} style={{ color: 'var(--green-500)', flexShrink: 0 }} />
          <div className="conflict-info">
            <span className="conflict-name">Vitamin C (AM) + SPF</span>
            <span className="conflict-note">Synergistic — included</span>
          </div>
        </div>
      </div>
      <div className="ft-vis-metrics">
        {[
          { label: 'Ingredients checked',  val: '200+',  cls: '' },
          { label: 'Conflicts caught',     val: '1',     cls: 'val-rose' },
          { label: 'Routine safety score', val: '100%',  cls: 'val-green' },
        ].map(({ label, val, cls }) => (
          <div key={label} className="ft-vis-metric-row">
            <span className="ft-vis-metric-label">{label}</span>
            <span className={`ft-vis-metric-val ${cls}`}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return null;
}

export default function FeaturesPage() {
  return (
    <div className="sw-features">
      <style>{`

        /* ═══════════════════════════════════════
           LIGHT MODE TOKENS
        ═══════════════════════════════════════ */
        .sw-features {
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

          --glass:        rgba(255,255,255,0.72);
          --glass-border: rgba(0, 0, 0, 0.08);

          --orb-rose:  rgba(244,  63,  94, 0.09);
          --orb-green: rgba( 16, 185, 129, 0.06);

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
        .dark .sw-features {
          --bg-0:          #14141e;
          --bg-1:          #1c1c2a;
          --bg-card:       rgba(255,255,255,0.04);
          --bg-card-hover: rgba(255,255,255,0.07);

          --txt-primary:   rgba(255,255,255,0.93);
          --txt-secondary: rgba(255,255,255,0.62);
          --txt-muted:     rgba(255,255,255,0.40);
          --txt-hint:      rgba(255,255,255,0.22);

          --rose-soft:        rgba(244, 63, 94, 0.14);
          --rose-soft-border: rgba(244, 63, 94, 0.26);
          --green-soft:        rgba(16, 185, 129, 0.11);
          --green-soft-border: rgba(16, 185, 129, 0.22);

          --border:        rgba(255,255,255,0.08);
          --border-strong: rgba(255,255,255,0.14);

          --glass:        rgba(255,255,255,0.028);
          --glass-border: rgba(255,255,255,0.09);

          --orb-rose:  rgba(244,  63,  94, 0.14);
          --orb-green: rgba( 16, 185, 129, 0.09);

          --grid-line: rgba(255,255,255,0.035);

          --stat-from: #ffffff;
          --stat-to:   rgba(255,255,255,0.45);
        }

        /* ── LAYOUT ── */
        .ft-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .ft-grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }
        .ft-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
        }
        .ft-orb-rose  { background: var(--orb-rose); }
        .ft-orb-green { background: var(--orb-green); }

        .ft-gradient-divider {
          height: 1px;
          background: linear-gradient(
            90deg, transparent 0%,
            var(--rose-500) 25%,
            var(--green-500) 75%,
            transparent 100%
          );
          opacity: 0.22;
        }

        /* ── EYEBROW ── */
        .ft-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 100px;
          padding: 6px 14px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--txt-muted);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .ft-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .dot-rose  { background: var(--rose-500); }
        .dot-green { background: var(--green-500); }

        /* ── SHIMMER ── */
        @keyframes ft-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .ft-shimmer {
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
          animation: ft-shimmer 4s linear infinite;
        }

        /* ══════════════════════════════
           HERO
        ══════════════════════════════ */
        .ft-hero {
          position: relative;
          padding: 130px 0 96px;
          background: var(--bg-0);
          overflow: hidden;
          text-align: center;
        }
        .ft-hero-h1 {
          font-size: clamp(2.4rem, 5.5vw, 4.2rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.06;
          color: var(--txt-primary);
          margin: 20px 0 0;
        }
        .ft-hero-sub {
          font-size: 1.05rem;
          color: var(--txt-secondary);
          line-height: 1.75;
          max-width: 520px;
          margin: 20px auto 0;
        }
        /* Quick-stat pills row */
        .ft-hero-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-top: 36px;
        }
        .ft-hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 100px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--txt-secondary);
          transition: border-color 0.2s ease;
        }
        .ft-hero-pill:hover { border-color: var(--rose-soft-border); }
        .ft-hero-pill-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
        }

        /* ══════════════════════════════
           FEATURE ROWS
        ══════════════════════════════ */
        .ft-features-section {
          position: relative;
          padding: 32px 0 96px;
          background: var(--bg-0);
        }
        .ft-feature-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
          padding: 80px 0;
          border-bottom: 1px solid var(--border);
          position: relative;
        }
        .ft-feature-row:last-child { border-bottom: none; }
        .ft-feature-row.reverse .ft-feature-visual { order: -1; }

        /* accent line at top of each row */
        .ft-row-accent {
          position: absolute;
          top: 0; left: 0;
          width: 60px; height: 2px;
          border-radius: 1px;
        }
        .acc-rose  { background: var(--rose-500); }
        .acc-green { background: var(--green-500); }

        .ft-feature-index {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          color: var(--txt-hint);
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .ft-feature-h2 {
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: var(--txt-primary);
          margin: 12px 0 0;
        }
        .ft-feature-body {
          font-size: 0.95rem;
          color: var(--txt-secondary);
          line-height: 1.78;
          margin-top: 16px;
        }
        .ft-checks {
          list-style: none;
          padding: 0; margin: 24px 0 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ft-check-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          color: var(--txt-secondary);
        }
        .ft-check-icon-rose  { color: var(--rose-500); flex-shrink: 0; }
        .ft-check-icon-green { color: var(--green-500); flex-shrink: 0; }

        /* ══════════════════════════════
           FEATURE VISUAL PANELS
        ══════════════════════════════ */
        .ft-feature-visual {
          position: relative;
        }
        .ft-visual-wrap {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          transition: border-color 0.3s ease;
        }
        .ft-visual-wrap:hover { border-color: var(--border-strong); }

        /* ── Detection visual ── */
        .ft-vis-face {
          position: relative;
          height: 200px;
          background: var(--bg-1);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ft-vis-face-circle {
          width: 120px; height: 150px;
          border-radius: 50%;
          border: 1.5px dashed var(--border-strong);
          opacity: 0.5;
        }
        @keyframes scan-drop {
          0%   { top: 0;    opacity: 1; }
          90%  { top: 100%; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .ft-vis-scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--rose-500), transparent);
          animation: scan-drop 2.5s ease-in-out infinite;
          z-index: 2;
        }
        .ft-vis-tag {
          position: absolute;
          z-index: 3;
          padding: 3px 9px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
        }
        .tag-rose {
          background: var(--rose-soft);
          border: 1px solid var(--rose-soft-border);
          color: var(--rose-500);
        }
        .tag-green {
          background: var(--green-soft);
          border: 1px solid var(--green-soft-border);
          color: var(--green-500);
        }

        /* ── Upscale visual ── */
        .ft-vis-upscale-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 12px;
          align-items: center;
          min-height: 160px;
        }
        .ft-vis-panel {
          background: var(--bg-1);
          border: 1px solid var(--border);
          border-radius: 10px;
          height: 140px;
          position: relative;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .ft-vis-panel-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='2' height='2' fill='rgba(128,128,128,0.18)'/%3E%3C/svg%3E");
          background-size: 4px 4px;
        }
        .ft-vis-panel-clean {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--green-soft) 0%, var(--bg-1) 100%);
        }
        .ft-vis-panel-sharp {
          border-color: var(--green-soft-border);
        }
        .ft-vis-panel-label {
          position: relative;
          z-index: 1;
          font-size: 0.68rem;
          font-family: 'JetBrains Mono', monospace;
          color: var(--txt-hint);
          padding: 6px 8px;
          letter-spacing: 0.05em;
        }
        .ft-vis-arrow-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .ft-vis-arrow-label {
          font-size: 0.65rem;
          font-family: 'JetBrains Mono', monospace;
          color: var(--green-500);
          text-align: center;
          letter-spacing: 0.06em;
          line-height: 1.4;
        }

        /* ── Weather visual ── */
        .ft-vis-weather-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .ft-vis-wcard {
          border-radius: 12px;
          padding: 14px 12px;
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: var(--bg-1);
        }
        .wcard-rose    { border-color: var(--rose-soft-border);  background: var(--rose-soft); }
        .wcard-green   { border-color: var(--green-soft-border); background: var(--green-soft); }
        .wcard-neutral { background: var(--bg-card); }
        .wcard-icon    { font-size: 1.3rem; line-height: 1; }
        .wcard-label   { font-size: 0.68rem; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.08em; color: var(--txt-hint); }
        .wcard-val     { font-size: 0.95rem; font-weight: 700; color: var(--txt-primary); }
        .wcard-note    { font-size: 0.68rem; color: var(--txt-muted); line-height: 1.4; }

        /* ── Conflict visual ── */
        .ft-vis-conflict {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ft-vis-conflict-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid var(--border);
        }
        .conflict-bad {
          background: var(--rose-soft);
          border-color: var(--rose-soft-border);
        }
        .conflict-ok {
          background: var(--green-soft);
          border-color: var(--green-soft-border);
        }
        .conflict-icon {
          font-size: 1rem;
          flex-shrink: 0;
          color: var(--rose-500);
        }
        .conflict-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .conflict-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--txt-primary);
        }
        .conflict-note {
          font-size: 0.74rem;
          color: var(--txt-muted);
        }

        /* ── Shared metric row ── */
        .ft-vis-metrics {
          border-top: 1px solid var(--border);
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ft-vis-metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ft-vis-metric-label {
          font-size: 0.78rem;
          color: var(--txt-muted);
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.04em;
        }
        .ft-vis-metric-val {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--txt-primary);
          font-family: 'JetBrains Mono', monospace;
        }
        .val-rose  { color: var(--rose-500); }
        .val-green { color: var(--green-500); }

        /* ── Icon styles ── */
        .icon-rose  { background: var(--rose-soft);  color: var(--rose-500); }
        .icon-green { background: var(--green-soft); color: var(--green-500); }

        /* ══════════════════════════════
           MINI FEATURE GRID (bottom)
        ══════════════════════════════ */
        .ft-mini-section {
          position: relative;
          padding: 96px 0;
          background: var(--bg-1);
          overflow: hidden;
        }
        .ft-mini-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-top: 56px;
        }
        .ft-mini-card {
          padding: 28px;
          border-radius: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          transition: border-color 0.25s ease, transform 0.25s ease;
        }
        .ft-mini-card:hover {
          border-color: var(--border-strong);
          transform: translateY(-3px);
        }
        .ft-mini-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
          font-size: 18px;
        }
        .ft-mini-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--txt-primary);
          margin-bottom: 8px;
        }
        .ft-mini-body {
          font-size: 0.82rem;
          color: var(--txt-muted);
          line-height: 1.68;
        }

        .ft-section-h2 {
          font-size: clamp(1.8rem, 3.5vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--txt-primary);
          margin: 16px 0 0;
          line-height: 1.1;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .ft-feature-row { grid-template-columns: 1fr; gap: 36px; padding: 56px 0; }
          .ft-feature-row.reverse .ft-feature-visual { order: 0; }
          .ft-vis-weather-cards { grid-template-columns: 1fr; }
          .ft-vis-upscale-grid  { grid-template-columns: 1fr; }
          .ft-vis-arrow-col { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ft-shimmer { animation: none; }
          .ft-vis-scan-line { animation: none; }
          * { transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section className="ft-hero">
        <div className="ft-grid-overlay" />
        <div className="ft-orb ft-orb-rose"  style={{ width: 520, height: 520, top: '-12%', left: '58%' }} />
        <div className="ft-orb ft-orb-green" style={{ width: 360, height: 360, bottom: '0%', left: '-5%' }} />

        <div className="ft-container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: SPRING }}
          >
            <Eyebrow color="rose">Platform Features</Eyebrow>
          </motion.div>

          <motion.h1
            className="ft-hero-h1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: SPRING }}
          >
            Intelligent features for<br />
            <ShimmerText>a glowing complexion.</ShimmerText>
          </motion.h1>

          <motion.p
            className="ft-hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: SPRING }}
          >
            Computer vision, large language models, and dermatological guidelines — combined into one seamless platform.
          </motion.p>

          <motion.div
            className="ft-hero-pills"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: SPRING }}
          >
            {[
              { dot: 'var(--rose-500)',  label: '12 Conditions Detected' },
              { dot: 'var(--green-500)', label: '94% Accuracy' },
              { dot: 'var(--rose-500)',  label: '4× ESRGAN Upscaling' },
              { dot: 'var(--green-500)', label: 'Real-time Weather Logic' },
              { dot: 'var(--rose-500)',  label: '200+ Ingredients Checked' },
            ].map(({ dot, label }) => (
              <div key={label} className="ft-hero-pill">
                <div className="ft-hero-pill-dot" style={{ background: dot }} />
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="ft-gradient-divider" />

      {/* ══════════════════════════════
          FEATURE ROWS
      ══════════════════════════════ */}
      <section className="ft-features-section">
        <div className="ft-container">
          {FEATURES.map(({ eyebrow, eyebrowColor, title, body, checks, icon, iconClass: _ic, iconColor, accentBar, visual, reverse }, idx) => (
            <FadeUp key={title} delay={0.04}>
              <div className={`ft-feature-row ${reverse ? 'reverse' : ''}`}>
                <div className={`ft-row-accent ${accentBar}`} />

                {/* Text side */}
                <div>
                  <div className="ft-feature-index">Feature {String(idx + 1).padStart(2, '0')}</div>
                  <Eyebrow color={eyebrowColor}>{eyebrow}</Eyebrow>
                  <h2 className="ft-feature-h2">{title}</h2>
                  <p className="ft-feature-body">{body}</p>
                  <ul className="ft-checks">
                    {checks.map((c) => (
                      <li key={c} className="ft-check-item">
                        <CheckCircle2
                          size={16}
                          className={eyebrowColor === 'rose' ? 'ft-check-icon-rose' : 'ft-check-icon-green'}
                        />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual side */}
                <motion.div
                  className="ft-feature-visual"
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: 0.12, ease: SPRING }}
                >
                  <FeatureVisual type={visual} />
                </motion.div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <div className="ft-gradient-divider" />

      {/* ══════════════════════════════
          MINI FEATURE GRID
      ══════════════════════════════ */}
      <section className="ft-mini-section">
        <div className="ft-orb ft-orb-rose"  style={{ width: 400, height: 400, top: '10%', right: '-6%' }} />
        <div className="ft-orb ft-orb-green" style={{ width: 300, height: 300, bottom: '-4%', left: '-4%' }} />
        <div className="ft-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <FadeUp>
              <Eyebrow color="green">Also Included</Eyebrow>
              <h2 className="ft-section-h2" style={{ marginTop: 16 }}>
                Everything else<br />
                <ShimmerText>that makes it work.</ShimmerText>
              </h2>
            </FadeUp>
          </div>

          <div className="ft-mini-grid">
            {[
              {
                icon: <Eye size={18} />,
                iconCls: 'icon-rose',
                title: 'Scan History',
                body: 'Every analysis is saved. Track how your skin changes week by week with a visual history timeline.',
              },
              {
                icon: <Layers size={18} />,
                iconCls: 'icon-green',
                title: 'Routine Builder',
                body: 'Morning and evening routines built step by step — ordered correctly so actives don\'t cancel each other out.',
              },
              {
                icon: <Wind size={18} />,
                iconCls: 'icon-rose',
                title: 'Skin Type Profiling',
                body: 'The initial scan classifies your base skin type — oily, dry, combination, sensitive — and uses it as a foundation.',
              },
              {
                icon: <ShieldCheck size={18} />,
                iconCls: 'icon-green',
                title: 'Progress Tracking',
                body: 'Compare before-and-after scans. See measurable improvement on individual conditions over time.',
              },
              {
                icon: <Zap size={18} />,
                iconCls: 'icon-rose',
                title: 'Instant Results',
                body: 'No waiting. Results appear in under 3 seconds. Scan, read, act — without leaving the app.',
              },
              {
                icon: <ScanFace size={18} />,
                iconCls: 'icon-green',
                title: 'Multi-condition Detection',
                body: 'One scan catches acne, blackheads, whiteheads, pigmentation, rosacea, fine lines, and more — simultaneously.',
              },
            ].map(({ icon, iconCls, title, body }, i) => (
              <FadeUp key={title} delay={i * 0.07}>
                <div className="ft-mini-card">
                  <div className={`ft-mini-icon ${iconCls}`}>{icon}</div>
                  <div className="ft-mini-title">{title}</div>
                  <div className="ft-mini-body">{body}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}