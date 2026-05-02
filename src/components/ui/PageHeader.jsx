// frontend/src/components/ui/PageHeader.jsx

const PageHeader = ({ title, subtitle, badge = null }) => (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
            <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 900,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                lineHeight: 1,
            }}>
                {title}
            </h1>
            {subtitle && (
                <p style={{
                    fontFamily: 'var(--font-terminal)',
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    marginTop: 5,
                    letterSpacing: '0.01em',
                }}>
                    {subtitle}
                </p>
            )}
        </div>
        {badge && <div>{badge}</div>}
    </div>
);

export default PageHeader;