import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTabs } from '../context/TabContext';

const TabBar = () => {
    const { tabs, activeId, closeTab, setActiveId } = useTabs();
    const navigate = useNavigate();

    if (tabs.length === 0) return null;

    return (
        <div style={{ display: 'flex', background: 'var(--bg-depth)', borderBottom: '1px solid var(--border-subtle)', overflowX: 'auto', flexShrink: 0 }}>
            {tabs.map(tab => {
                const isActive = tab.id === activeId;
                return (
                    <div key={tab.id} onClick={() => { setActiveId(tab.id); navigate(tab.path); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: isActive ? '2px solid var(--neon-cyan, #00bcd4)' : '2px solid transparent', background: isActive ? 'var(--bg-surface)' : 'transparent', color: isActive ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: 13, transition: 'all 0.15s' }}>
                        {tab.icon && <span style={{ fontSize: 14 }}>{tab.icon}</span>}
                        <span>{tab.label}</span>
                        <button onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 15, lineHeight: 1, padding: '0 2px', borderRadius: 4 }}>×</button>
                    </div>
                );
            })}
        </div>
    );
};
export default TabBar;