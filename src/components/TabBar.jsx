import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTabs } from '../context/TabContext';
import '../styles/components/tab-bar.css';

const TabBar = () => {
    const { tabs, activeId, closeTab, setActiveId } = useTabs();
    const navigate = useNavigate();

    if (tabs.length === 0) return null;

    return (
        <div className="tab-bar">
            {tabs.map(tab => (
                <div
                    key={tab.id}
                    className={`tab-item${tab.id === activeId ? ' is-active' : ''}`}
                    onClick={() => { setActiveId(tab.id); navigate(tab.path); }}
                >
                    {tab.icon && <span className="tab-icon">{tab.icon}</span>}
                    <span>{tab.label}</span>
                    <button
                        className="tab-close"
                        onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                    >×</button>
                </div>
            ))}
        </div>
    );
};

export default TabBar;
