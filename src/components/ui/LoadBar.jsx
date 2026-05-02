// frontend/src/components/ui/LoadBar.jsx
const LoadBar = ({ current = 0, max = 1, showLabel = true }) => {
    const pct = max > 0 ? Math.round((current / max) * 100) : 0;
    const color =
        pct >= 100 ? 'var(--color-danger)'
            : pct >= 75 ? 'var(--color-warning)'
                : 'var(--color-success)';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
                flex: 1, height: 3,
                background: 'var(--bg-depth)',
                borderRadius: 2, overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%',
                    width: `${Math.min(pct, 100)}%`,
                    background: color,
                    borderRadius: 2,
                    transition: 'width 0.5s ease',
                }} />
            </div>
            {showLabel && (
                <span style={{
                    fontFamily: 'var(--font-terminal)',
                    fontSize: '0.62rem',
                    color,
                    minWidth: 36,
                    textAlign: 'right',
                }}>
                    {current}/{max}
                </span>
            )}
        </div>
    );
};

export default LoadBar;