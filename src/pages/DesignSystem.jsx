function DesignSystem() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '8px' }}>Design System</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '48px' }}>
        Reading with Sumi — visual reference
      </p>

      {/* Colors */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>Colors</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {[
            { name: 'Background', var: '--color-bg', hex: '#ffffff' },
            { name: 'Surface', var: '--color-surface', hex: '#f5f5f5' },
            { name: 'Border', var: '--color-border', hex: '#e0e0e0' },
            { name: 'Text Primary', var: '--color-text-primary', hex: '#111111' },
            { name: 'Text Secondary', var: '--color-text-secondary', hex: '#555555' },
            { name: 'Text Muted', var: '--color-text-muted', hex: '#999999' },
            { name: 'Accent', var: '--color-accent', hex: '#111111' },
          ].map((color) => (
            <div key={color.var} style={{ width: '120px' }}>
              <div style={{
                backgroundColor: `var(${color.var})`,
                height: '64px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                marginBottom: '8px'
              }} />
              <p style={{ fontSize: '13px', fontWeight: '500', margin: 0 }}>{color.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>{color.hex}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>Typography</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Heading 1 — 32px / 700</p>
            <p style={{ fontSize: '32px', fontWeight: '700', margin: 0 }}>The Moon is speaking</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Heading 2 — 24px / 600</p>
            <p style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>Your journal entries</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Heading 3 — 18px / 500</p>
            <p style={{ fontSize: '18px', fontWeight: '500', margin: 0 }}>Three of Cups</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Body — 16px / 400</p>
            <p style={{ fontSize: '16px', fontWeight: '400', margin: 0 }}>Write what the card is telling you today.</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Small / Caption — 13px / 400</p>
            <p style={{ fontSize: '13px', fontWeight: '400', color: 'var(--color-text-muted)', margin: 0 }}>April 16, 2026</p>
          </div>
        </div>
      </section>

      {/* Border Radius */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>Border Radius</h2>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end' }}>
          {[
            { name: 'Small', var: '--radius-sm' },
            { name: 'Medium', var: '--radius-md' },
            { name: 'Large', var: '--radius-lg' },
          ].map((r) => (
            <div key={r.var} style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: `var(${r.var})`,
                marginBottom: '8px'
              }} />
              <p style={{ fontSize: '13px', fontWeight: '500', margin: 0 }}>{r.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>{r.var}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>Buttons</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button style={{
            backgroundColor: 'var(--color-accent)',
            color: '#ffffff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            fontFamily: 'var(--font-base)'
          }}>Primary</button>
          <button style={{
            backgroundColor: 'transparent',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            fontFamily: 'var(--font-base)'
          }}>Secondary</button>
          <button style={{
            backgroundColor: 'transparent',
            color: 'var(--color-text-muted)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            fontFamily: 'var(--font-base)'
          }}>Ghost</button>
        </div>
      </section>

      {/* Card */}
      <section>
        <h2 style={{ marginBottom: '16px' }}>Card</h2>
        <div style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          maxWidth: '320px'
        }}>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '0 0 8px 0' }}>April 16, 2026</p>
          <h3 style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 8px 0' }}>A quiet kind of knowing</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            The High Priestess showed up today and I didn't expect her to make so much sense...
          </p>
        </div>
      </section>
    </div>
  )
}

export default DesignSystem