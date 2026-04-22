import { useEffect, useRef, useState } from 'react'

const NAV_TOKENS = [
  { id: 'colors',      label: 'Colors' },
  { id: 'typography',  label: 'Typography' },
  { id: 'spacing',     label: 'Spacing' },
  { id: 'radius',      label: 'Border Radius' },
  { id: 'shadows',     label: 'Shadows' },
  { id: 'transitions', label: 'Transitions' },
]

const NAV_COMPONENTS = [
  { id: 'type-styles',  label: 'Type Styles' },
  { id: 'buttons',      label: 'Buttons' },
  { id: 'dividers',     label: 'Dividers' },
  { id: 'swatches',     label: 'Color Swatches' },
  { id: 'badges',       label: 'Badges' },
  { id: 'forms',        label: 'Forms' },
  { id: 'cards',        label: 'Cards' },
  { id: 'alerts',       label: 'Alerts & Toasts' },
  { id: 'tables',       label: 'Tables' },
  { id: 'code',         label: 'Code Blocks' },
  { id: 'breadcrumbs',  label: 'Breadcrumbs' },
  { id: 'avatars',      label: 'Avatars' },
  { id: 'tooltips',     label: 'Tooltips' },
  { id: 'progress',     label: 'Progress & Steps' },
]

const ALL_NAV = [...NAV_TOKENS, ...NAV_COMPONENTS]

const PALETTE = [
  { name: 'Primary',      varName: '--color-primary',      hex: '#3B2F6B' },
  { name: 'Secondary',    varName: '--color-secondary',    hex: '#5B6FA8' },
  { name: 'Accent',       varName: '--color-accent',       hex: '#7B5EA7' },
  { name: 'Background',   varName: '--color-background',   hex: '#F4F2FA' },
  { name: 'Background Light',   varName: '--color-background-light',   hex: '#FCFAFF' },
  { name: 'Surface',      varName: '--color-surface',      hex: '#FFFFFF' },
  { name: 'Text Primary', varName: '--color-text-primary', hex: '#1A1535' },
  { name: 'Text Muted',   varName: '--color-text-muted',   hex: '#8A87A8' },
  { name: 'Border',       varName: '--color-border',       hex: '#DDD8EE' },
  { name: 'Code BG',      varName: '--color-code-bg',      hex: '#EBE8F5' },
]

function DesignSystem() {
  const [activeId, setActiveId] = useState('colors')
  const [copied, setCopied] = useState(null)
  const mainRef = useRef(null)

  useEffect(() => {
    const sections = ALL_NAV.map(n => document.getElementById(n.id)).filter(Boolean)
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  function handleCopy(text, key) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(key)
        setTimeout(() => setCopied(null), 1500)
      })
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    }
  }

  function scrollTo(id) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* ── Topbar ── */}
      <nav className="ds-topbar">
        <div className="container-lg">
          <div className="d-flex align-items-center justify-content-between">
            <a href="/" className="brand">
              tarot<span>journal</span>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, margin: '0 6px' }}>/</span>
              Design System
            </a>
            <div className="d-flex align-items-center gap-2">
              <span className="ds-version">v1.0.0</span>
              <span className="badge-ds badge-default">Bootstrap 5.3</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Body grid ── */}
      <div className="container-lg py-5">
        <div className="row g-5">

          {/* ── Sidebar ── */}
          <aside className="col-lg-2 d-none d-lg-block">
            <nav className="ds-sidebar ds-nav">
              <div className="ds-nav-label">Tokens</div>
              {NAV_TOKENS.map(n => (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  className={activeId === n.id ? 'active' : ''}
                  onClick={e => { e.preventDefault(); scrollTo(n.id) }}
                >
                  {n.label}
                </a>
              ))}
              <div className="ds-nav-label" style={{ marginTop: '1rem' }}>Components</div>
              {NAV_COMPONENTS.map(n => (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  className={activeId === n.id ? 'active' : ''}
                  onClick={e => { e.preventDefault(); scrollTo(n.id) }}
                >
                  {n.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* ── Main ── */}
          <main className="col-lg-10" ref={mainRef}>

            {/* Page header */}
            <header className="ds-header">
              <p className="eyebrow">Tarot Journal</p>
              <h1>Mini Design System</h1>
              <p className="mt-3" style={{ maxWidth: '600px', color: 'var(--color-text-muted)' }}>
                A living reference for tokens, typography, and UI components used throughout
                the Tarot Journal app. Built with Bootstrap 5.3 and CSS custom properties.
              </p>
            </header>

            {/* ── COLORS ── */}
            <section className="ds-section" id="colors">
              <h2 className="ds-section-title">Colors</h2>
              <div className="ds-card">
                <table className="token-table">
                  <thead>
                    <tr><th>Token</th><th>Hex</th><th>Preview</th></tr>
                  </thead>
                  <tbody>
                    {PALETTE.map(p => (
                      <tr key={p.varName}>
                        <td><code>{p.varName}</code></td>
                        <td><code>{p.hex}</code></td>
                        <td>
                          <div style={{
                            width: '48px', height: '24px',
                            background: p.hex,
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid rgba(0,0,0,0.08)',
                          }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── TYPOGRAPHY TOKENS ── */}
            <section className="ds-section" id="typography">
              <h2 className="ds-section-title">Typography</h2>
              <div className="ds-card">
                <table className="token-table">
                  <thead><tr><th>Token</th><th>Value</th></tr></thead>
                  <tbody>
                    {[
                      ['--font-sans / --font-serif', "'Poppins', sans-serif"],
                      ['--font-mono', "'Courier New', monospace"],
                      ['--text-xs', '0.75rem'],   ['--text-sm', '0.875rem'],
                      ['--text-base', '1rem'],     ['--text-md', '1.125rem'],
                      ['--text-lg', '1.25rem'],    ['--text-xl', '1.5rem'],
                      ['--text-2xl', '1.875rem'],  ['--text-3xl', '2.25rem'],
                      ['--text-4xl', '3rem'],
                      ['--fw-light', '300'],        ['--fw-regular', '400'],
                      ['--fw-medium', '500'],       ['--fw-semibold', '600'],
                      ['--fw-bold', '700'],
                      ['--lh-tight', '1.2'],        ['--lh-snug', '1.4'],
                      ['--lh-normal', '1.6'],       ['--lh-relaxed', '1.8'],
                    ].map(([token, val]) => (
                      <tr key={token}><td><code>{token}</code></td><td><code>{val}</code></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── SPACING ── */}
            <section className="ds-section" id="spacing">
              <h2 className="ds-section-title">Spacing</h2>
              <div className="ds-card">
                <table className="token-table">
                  <thead><tr><th>Token</th><th>Value</th><th>Preview</th></tr></thead>
                  <tbody>
                    {[
                      ['--space-1','0.25rem'],['--space-2','0.5rem'],['--space-3','0.75rem'],
                      ['--space-4','1rem'],['--space-5','1.25rem'],['--space-6','1.5rem'],
                      ['--space-8','2rem'],['--space-10','2.5rem'],['--space-12','3rem'],
                      ['--space-16','4rem'],['--space-20','5rem'],['--space-24','6rem'],
                    ].map(([token, val]) => (
                      <tr key={token}>
                        <td><code>{token}</code></td>
                        <td><code>{val}</code></td>
                        <td>
                          <div style={{
                            width: val, height: '12px',
                            background: 'var(--color-accent)',
                            borderRadius: 'var(--radius-sm)',
                            opacity: 0.6,
                          }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── BORDER RADIUS ── */}
            <section className="ds-section" id="radius">
              <h2 className="ds-section-title">Border Radius</h2>
              <div className="ds-card">
                <div className="radius-demo">
                  {[
                    { label: 'none', r: '0' },
                    { label: 'sm',   r: '4px' },
                    { label: 'md',   r: '8px' },
                    { label: 'lg',   r: '12px' },
                    { label: 'xl',   r: '20px' },
                    { label: 'full', r: '9999px' },
                  ].map(item => (
                    <div key={item.label} className="radius-item" style={{ borderRadius: item.r }}>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── SHADOWS ── */}
            <section className="ds-section" id="shadows">
              <h2 className="ds-section-title">Shadows</h2>
              <div className="ds-card">
                <div className="shadow-demo">
                  {[
                    { label: '--shadow-xs', shadow: '0 1px 2px rgba(0,0,0,0.06)' },
                    { label: '--shadow-sm', shadow: '0 1px 4px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' },
                    { label: '--shadow-md', shadow: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)' },
                    { label: '--shadow-lg', shadow: '0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.05)' },
                    { label: '--shadow-xl', shadow: '0 20px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06)' },
                  ].map(item => (
                    <div key={item.label} className="shadow-item" style={{ boxShadow: item.shadow }}>
                      <div className="shadow-label"><code>{item.label}</code></div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── TRANSITIONS ── */}
            <section className="ds-section" id="transitions">
              <h2 className="ds-section-title">Transitions</h2>
              <div className="ds-card">
                <p className="text-caption mb-4">Hover each bar to preview the easing.</p>
                <div className="ease-demo">
                  {[
                    '--ease-fast (0.10s ease)',
                    '--ease-base (0.20s ease)',
                    '--ease-smooth (0.30s cubic)',
                    '--ease-bounce (0.40s cubic)',
                    '--ease-slow (0.60s ease)',
                  ].map(label => (
                    <div key={label} className="ease-bar-wrap">
                      <span className="ease-label">{label}</span>
                      <div className="ease-bar" />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── TYPE STYLES ── */}
            <section className="ds-section" id="type-styles">
              <h2 className="ds-section-title">Type Styles</h2>
              <div className="ds-card">
                <div className="type-row">
                  <div className="type-meta"><strong>Heading 1</strong>text-4xl · fw-medium · lh-tight</div>
                  <div style={{ flex: 1 }}><h1>The Fool — New Beginnings</h1></div>
                </div>
                <div className="type-row">
                  <div className="type-meta"><strong>Heading 2</strong>text-3xl · fw-medium · lh-tight</div>
                  <div style={{ flex: 1 }}><h2>The High Priestess</h2></div>
                </div>
                <div className="type-row">
                  <div className="type-meta"><strong>Heading 3</strong>text-2xl · fw-medium · lh-snug</div>
                  <div style={{ flex: 1 }}><h3>The Empress</h3></div>
                </div>
                <div className="type-row">
                  <div className="type-meta"><strong>Heading 4</strong>text-xl · fw-semibold · lh-snug</div>
                  <div style={{ flex: 1 }}><h4>The Emperor</h4></div>
                </div>
                <div className="type-row">
                  <div className="type-meta"><strong>Heading 5</strong>text-lg · fw-semibold · lh-snug</div>
                  <div style={{ flex: 1 }}><h5>The Hierophant</h5></div>
                </div>
                <div className="type-row">
                  <div className="type-meta"><strong>H6 / Label</strong>text-base · uppercase · ls+</div>
                  <div style={{ flex: 1 }}><h6>The Lovers</h6></div>
                </div>
                <div className="type-row">
                  <div className="type-meta"><strong>Body</strong>text-base · fw-regular · lh-normal</div>
                  <div style={{ flex: 1 }}><p>The cards speak in symbols, and those who listen find meaning in the patterns between light and shadow, past and future.</p></div>
                </div>
                <div className="type-row">
                  <div className="type-meta"><strong>Caption</strong>text-sm · lh-normal · muted</div>
                  <div style={{ flex: 1 }}><span className="text-caption">Drawn on June 21, 2025 · Full Moon in Capricorn</span></div>
                </div>
                <div className="type-row">
                  <div className="type-meta"><strong>Overline</strong>text-xs · fw-semibold · uppercase</div>
                  <div style={{ flex: 1 }}><span className="text-overline">Major Arcana</span></div>
                </div>
                <div className="type-row">
                  <div className="type-meta"><strong>Inline Code</strong>font-mono · 0.875em</div>
                  <div style={{ flex: 1 }}><code>const card = tarotDeck[0]</code></div>
                </div>
              </div>
            </section>

            {/* ── BUTTONS ── */}
            <section className="ds-section" id="buttons">
              <h2 className="ds-section-title">Buttons</h2>
              <div className="ds-card mb-4">
                <p className="text-overline mb-3">Variants</p>
                <div className="d-flex flex-wrap gap-3 align-items-center">
                  <button className="btn btn-primary-ds">Primary</button>
                  <button className="btn btn-secondary-ds">Secondary</button>
                  <button className="btn btn-accent-ds">Accent</button>
                  <button className="btn btn-ghost-ds">Ghost</button>
                </div>
              </div>
              <div className="ds-card mb-4">
                <p className="text-overline mb-3">Sizes</p>
                <div className="d-flex flex-wrap gap-3 align-items-center">
                  <button className="btn btn-primary-ds btn-sm-ds">Small</button>
                  <button className="btn btn-primary-ds">Default</button>
                  <button className="btn btn-primary-ds btn-lg-ds">Large</button>
                </div>
              </div>
              <div className="ds-card">
                <p className="text-overline mb-3">With Icons</p>
                <div className="d-flex flex-wrap gap-3 align-items-center">
                  <button className="btn btn-primary-ds">✦ Draw a Card</button>
                  <button className="btn btn-secondary-ds">↩ Back</button>
                  <button className="btn btn-accent-ds">✎ New Entry</button>
                  <button className="btn btn-ghost-ds">✕ Clear</button>
                </div>
              </div>
            </section>

            {/* ── DIVIDERS ── */}
            <section className="ds-section" id="dividers">
              <h2 className="ds-section-title">Dividers</h2>
              <div className="ds-card">
                <p className="text-caption mb-2">.divider — 1px solid border</p>
                <hr className="divider" />
                <p className="text-caption mb-2">.divider-thick — 2px solid primary</p>
                <hr className="divider-thick" />
                <p className="text-caption mb-2">.divider-accent — 2px solid accent</p>
                <hr className="divider-accent" />
                <p className="text-caption mb-2">.divider-dashed — 1.5px dashed</p>
                <hr className="divider-dashed" />
              </div>
            </section>

            {/* ── COLOR SWATCHES ── */}
            <section className="ds-section" id="swatches">
              <h2 className="ds-section-title">Color Swatches</h2>
              <div className="ds-card">
                <div className="swatch-wrap">
                  {PALETTE.map(p => (
                    <div key={p.varName} className="swatch">
                      <div className="swatch-block" style={{ background: p.hex }} />
                      <span className="swatch-name">{p.name}</span>
                      <span className="swatch-value">{p.hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── BADGES ── */}
            <section className="ds-section" id="badges">
              <h2 className="ds-section-title">Badges</h2>
              <div className="ds-card mb-4">
                <p className="text-overline mb-3">All Variants</p>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <span className="badge-ds badge-default">Default</span>
                  <span className="badge-ds badge-primary">Primary</span>
                  <span className="badge-ds badge-accent">Accent</span>
                  <span className="badge-ds badge-success">Success</span>
                  <span className="badge-ds badge-warning">Warning</span>
                  <span className="badge-ds badge-error">Error</span>
                  <span className="badge-ds badge-outline">Outline</span>
                  <span className="badge-ds badge-muted">Muted</span>
                </div>
              </div>
              <div className="ds-card">
                <p className="text-overline mb-3">In Context</p>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <span className="badge-ds badge-primary">✦ Major Arcana</span>
                  <span className="badge-ds badge-accent">☽ Reversed</span>
                  <span className="badge-ds badge-success">✓ Reviewed</span>
                  <span className="badge-ds badge-muted">Draft</span>
                </div>
              </div>
            </section>

            {/* ── FORMS ── */}
            <section className="ds-section" id="forms">
              <h2 className="ds-section-title">Forms</h2>
              <div className="ds-card mb-4">
                <p className="text-overline mb-4">Text Inputs</p>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label-ds">Default</label>
                    <input className="input-ds" type="text" placeholder="Enter a journal title…" />
                    <span className="form-hint">Keep it short and meaningful.</span>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-ds">Error state</label>
                    <input className="input-ds input-error" type="text" defaultValue="bad input" />
                    <span className="form-error-msg">This field is required.</span>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-ds">Success state</label>
                    <input className="input-ds input-success" type="text" defaultValue="Great title!" />
                    <span className="form-hint" style={{ color: '#3A8A33' }}>Looks good!</span>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-ds">Disabled</label>
                    <input className="input-ds" type="text" placeholder="Disabled…" disabled />
                  </div>
                </div>
              </div>
              <div className="ds-card mb-4">
                <p className="text-overline mb-4">Textarea & Select</p>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label-ds">Textarea</label>
                    <textarea className="input-ds" rows={4} placeholder="Write your reflection…" style={{ resize: 'vertical' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-ds">Select</label>
                    <select className="input-ds">
                      <option>Choose a spread…</option>
                      <option>One Card</option>
                      <option>Three Card</option>
                      <option>Celtic Cross</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="ds-card">
                <p className="text-overline mb-4">Checkboxes & Radios</p>
                <div className="d-flex flex-wrap gap-4">
                  <label className="checkbox-ds">
                    <input type="checkbox" defaultChecked /> Reversed card
                  </label>
                  <label className="checkbox-ds">
                    <input type="checkbox" /> Add to favourites
                  </label>
                  <label className="radio-ds">
                    <input type="radio" name="spread" defaultChecked /> One card
                  </label>
                  <label className="radio-ds">
                    <input type="radio" name="spread" /> Three card
                  </label>
                </div>
              </div>
            </section>

            {/* ── CARDS ── */}
            <section className="ds-section" id="cards">
              <h2 className="ds-section-title">Cards</h2>
              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className="card-ds">
                    <div className="card-ds-body">
                      <span className="badge-ds badge-primary mb-2">Major Arcana</span>
                      <h5 style={{ marginBottom: '0.5rem' }}>The Moon</h5>
                      <p className="text-caption">Illusion, fear, the unconscious. A card of deep introspection and hidden truths.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card-ds">
                    <div className="card-ds-header">Journal Entry</div>
                    <div className="card-ds-body">
                      <p className="text-caption">June 21 · Full Moon in Capricorn</p>
                      <p style={{ marginTop: '0.5rem' }}>Drew The Moon today. Feeling uncertain about the path ahead…</p>
                    </div>
                    <div className="card-ds-footer">
                      <span className="badge-ds badge-muted">Draft</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card-ds">
                    <div className="card-ds-body" style={{ textAlign: 'center', padding: '2rem' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✦</div>
                      <h5>Draw a Card</h5>
                      <p className="text-caption">Begin your daily reading</p>
                      <button className="btn btn-primary-ds mt-3">Begin</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-ds card-ds-horizontal">
                <div className="card-ds-img-placeholder">img</div>
                <div className="card-ds-body">
                  <span className="badge-ds badge-accent mb-2">☽ Reversed</span>
                  <h5 style={{ marginBottom: '0.5rem' }}>The Tower — Reversed</h5>
                  <p className="text-caption">Avoiding disaster, delaying the inevitable, resisting change.</p>
                  <button className="btn btn-secondary-ds btn-sm-ds mt-3">View Reading</button>
                </div>
              </div>
            </section>

            {/* ── ALERTS & TOASTS ── */}
            <section className="ds-section" id="alerts">
              <h2 className="ds-section-title">Alerts & Toasts</h2>
              <div className="ds-card mb-4">
                <p className="text-overline mb-4">Alerts</p>
                <div className="d-flex flex-column gap-3">
                  <div className="alert-ds alert-info">
                    <span className="alert-ds-icon">ℹ</span>
                    <div><div className="alert-ds-title">Info</div>Your reading has been saved to the journal.</div>
                  </div>
                  <div className="alert-ds alert-success">
                    <span className="alert-ds-icon">✓</span>
                    <div><div className="alert-ds-title">Success</div>Entry published successfully.</div>
                  </div>
                  <div className="alert-ds alert-warning">
                    <span className="alert-ds-icon">⚠</span>
                    <div><div className="alert-ds-title">Warning</div>Unsaved changes will be lost.</div>
                  </div>
                  <div className="alert-ds alert-error">
                    <span className="alert-ds-icon">✕</span>
                    <div><div className="alert-ds-title">Error</div>Failed to save. Please try again.</div>
                  </div>
                </div>
              </div>
              <div className="ds-card">
                <p className="text-overline mb-4">Toasts</p>
                <div className="d-flex flex-column gap-3">
                  <div className="toast-ds">
                    <span className="toast-dot toast-dot-info" />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: 'var(--text-sm)' }}>Card drawn</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>The Star — Upright</div>
                    </div>
                    <button className="toast-ds-close">✕</button>
                  </div>
                  <div className="toast-ds">
                    <span className="toast-dot toast-dot-success" />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: 'var(--text-sm)' }}>Entry saved</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>Your journal entry has been saved.</div>
                    </div>
                    <button className="toast-ds-close">✕</button>
                  </div>
                  <div className="toast-ds">
                    <span className="toast-dot toast-dot-error" />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: 'var(--text-sm)' }}>Error</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>Could not connect to storage.</div>
                    </div>
                    <button className="toast-ds-close">✕</button>
                  </div>
                </div>
              </div>
            </section>

            {/* ── TABLES ── */}
            <section className="ds-section" id="tables">
              <h2 className="ds-section-title">Tables</h2>
              <div className="ds-card mb-4">
                <p className="text-overline mb-3">Default</p>
                <table className="table-ds">
                  <thead>
                    <tr><th>Card</th><th>Arcana</th><th>Orientation</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>The Fool</td>
                      <td><span className="badge-ds badge-primary">Major</span></td>
                      <td>Upright</td>
                      <td>June 21</td>
                    </tr>
                    <tr>
                      <td>Two of Cups</td>
                      <td><span className="badge-ds badge-default">Minor</span></td>
                      <td>Upright</td>
                      <td>June 20</td>
                    </tr>
                    <tr>
                      <td>The Tower</td>
                      <td><span className="badge-ds badge-primary">Major</span></td>
                      <td><span className="badge-ds badge-accent">Reversed</span></td>
                      <td>June 19</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="ds-card">
                <p className="text-overline mb-3">Striped</p>
                <table className="table-ds table-striped">
                  <thead>
                    <tr><th>Card</th><th>Arcana</th><th>Orientation</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>The Star</td><td>Major</td><td>Upright</td></tr>
                    <tr><td>Ace of Wands</td><td>Minor</td><td>Upright</td></tr>
                    <tr><td>The Moon</td><td>Major</td><td>Reversed</td></tr>
                    <tr><td>Eight of Swords</td><td>Minor</td><td>Upright</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── CODE BLOCKS ── */}
            <section className="ds-section" id="code">
              <h2 className="ds-section-title">Code Blocks</h2>
              <div className="codeblock-ds">
                <div className="codeblock-ds-bar">
                  <div className="codeblock-ds-dots">
                    <span style={{ background: '#FF5F57' }} />
                    <span style={{ background: '#FEBC2E' }} />
                    <span style={{ background: '#28C840' }} />
                  </div>
                  <span className="codeblock-ds-lang">javascript</span>
                  <button
                    className="codeblock-copy"
                    onClick={() => handleCopy('const card = tarotDeck.draw();\nconsole.log(card.name);', 'cb1')}
                  >
                    {copied === 'cb1' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre>
                  <code>
                    <span className="code-comment">{'// Draw a random card from the deck'}</span>{'\n'}
                    <span className="code-key">const </span>
                    <span className="code-val">card</span>
                    {' = '}
                    <span className="code-val">tarotDeck</span>
                    {'.'}
                    <span className="code-val">draw</span>
                    {'();\n'}
                    <span className="code-val">console</span>
                    {'.log('}
                    <span className="code-val">card</span>
                    {'.'}
                    <span className="code-str">name</span>
                    {');'}
                  </code>
                </pre>
              </div>
            </section>

            {/* ── BREADCRUMBS ── */}
            <section className="ds-section" id="breadcrumbs">
              <h2 className="ds-section-title">Breadcrumbs</h2>
              <div className="ds-card">
                <ul className="breadcrumb-ds mb-3">
                  <li><a href="/">Home</a></li>
                  <li><span className="sep">/</span></li>
                  <li><a href="/catalogue">Catalogue</a></li>
                  <li><span className="sep">/</span></li>
                  <li><span className="current">The Fool</span></li>
                </ul>
                <ul className="breadcrumb-ds">
                  <li><a href="/">Journal</a></li>
                  <li><span className="sep">›</span></li>
                  <li><a href="/editor">Entries</a></li>
                  <li><span className="sep">›</span></li>
                  <li><span className="current">June 21 Reading</span></li>
                </ul>
              </div>
            </section>

            {/* ── AVATARS ── */}
            <section className="ds-section" id="avatars">
              <h2 className="ds-section-title">Avatars</h2>
              <div className="ds-card mb-4">
                <p className="text-overline mb-3">Sizes — Circle</p>
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-ds avatar-circle avatar-xs">XS</div>
                  <div className="avatar-ds avatar-circle avatar-sm">SM</div>
                  <div className="avatar-ds avatar-circle avatar-md">MD</div>
                  <div className="avatar-ds avatar-circle avatar-lg">LG</div>
                  <div className="avatar-ds avatar-circle avatar-xl">XL</div>
                </div>
              </div>
              <div className="ds-card mb-4">
                <p className="text-overline mb-3">Sizes — Square</p>
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-ds avatar-square avatar-xs">XS</div>
                  <div className="avatar-ds avatar-square avatar-sm">SM</div>
                  <div className="avatar-ds avatar-square avatar-md">MD</div>
                  <div className="avatar-ds avatar-square avatar-lg">LG</div>
                  <div className="avatar-ds avatar-square avatar-xl">XL</div>
                </div>
              </div>
              <div className="ds-card">
                <p className="text-overline mb-3">Avatar Group</p>
                <div className="avatar-group">
                  <div className="avatar-ds avatar-circle avatar-md" style={{ background: 'var(--color-primary)', color: '#fff' }}>A</div>
                  <div className="avatar-ds avatar-circle avatar-md" style={{ background: 'var(--color-accent)', color: '#fff' }}>B</div>
                  <div className="avatar-ds avatar-circle avatar-md" style={{ background: 'var(--color-secondary)', color: '#fff' }}>C</div>
                  <div className="avatar-ds avatar-circle avatar-md">+2</div>
                </div>
              </div>
            </section>

            {/* ── TOOLTIPS ── */}
            <section className="ds-section" id="tooltips">
              <h2 className="ds-section-title">Tooltips</h2>
              <div className="ds-card">
                <div className="d-flex gap-5 align-items-end flex-wrap" style={{ paddingBottom: '2rem' }}>
                  <div className="tooltip-ds-wrap">
                    <button className="btn btn-secondary-ds">Hover (top)</button>
                    <span className="tooltip-ds">Tooltip above the button</span>
                  </div>
                  <div className="tooltip-ds-wrap tooltip-bottom">
                    <button className="btn btn-secondary-ds">Hover (bottom)</button>
                    <span className="tooltip-ds">Tooltip below the button</span>
                  </div>
                  <div className="tooltip-ds-wrap">
                    <span className="badge-ds badge-primary" style={{ cursor: 'default' }}>Major Arcana</span>
                    <span className="tooltip-ds">22 cards · The Fool to The World</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── PROGRESS & STEPS ── */}
            <section className="ds-section" id="progress">
              <h2 className="ds-section-title">Progress & Steps</h2>
              <div className="ds-card mb-4">
                <p className="text-overline mb-4">Progress Bars</p>
                <div className="d-flex flex-column gap-4">
                  <div className="progress-ds-wrap">
                    <div className="progress-ds-label"><span>Accent</span><span>65%</span></div>
                    <div className="progress-ds-track">
                      <div className="progress-ds-bar" style={{ width: '65%' }} />
                    </div>
                  </div>
                  <div className="progress-ds-wrap">
                    <div className="progress-ds-label"><span>Primary</span><span>80%</span></div>
                    <div className="progress-ds-track">
                      <div className="progress-ds-bar bar-primary" style={{ width: '80%' }} />
                    </div>
                  </div>
                  <div className="progress-ds-wrap">
                    <div className="progress-ds-label"><span>Success</span><span>100%</span></div>
                    <div className="progress-ds-track">
                      <div className="progress-ds-bar bar-success" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div className="progress-ds-wrap">
                    <div className="progress-ds-label"><span>Thin track</span><span>40%</span></div>
                    <div className="progress-ds-track track-thin">
                      <div className="progress-ds-bar" style={{ width: '40%' }} />
                    </div>
                  </div>
                  <div className="progress-ds-wrap">
                    <div className="progress-ds-label"><span>Thick track</span><span>55%</span></div>
                    <div className="progress-ds-track track-thick">
                      <div className="progress-ds-bar" style={{ width: '55%' }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="ds-card">
                <p className="text-overline mb-4">Step Indicator</p>
                <div className="steps-ds">
                  <div className="step-ds complete">
                    <div className="step-node">✓</div>
                    <div className="step-label">Choose Card</div>
                  </div>
                  <div className="step-ds complete">
                    <div className="step-node">✓</div>
                    <div className="step-label">Set Intention</div>
                  </div>
                  <div className="step-ds active">
                    <div className="step-node">3</div>
                    <div className="step-label">Write Entry</div>
                  </div>
                  <div className="step-ds">
                    <div className="step-node">4</div>
                    <div className="step-label">Reflect</div>
                  </div>
                  <div className="step-ds">
                    <div className="step-node">5</div>
                    <div className="step-label">Save</div>
                  </div>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </>
  )
}

export default DesignSystem
