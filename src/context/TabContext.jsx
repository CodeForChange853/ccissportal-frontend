import React, { createContext, useContext, useState, useCallback } from 'react';

const TabContext = createContext(null);
export const useTabs = () => useContext(TabContext);

export const TabProvider = ({ children }) => {
    const [tabs, setTabs] = useState([]);
    const [activeId, setActiveId] = useState(null);

    const openTab = useCallback((id, label, path, icon = null) => {
        setTabs(prev => {
            if (prev.find(t => t.id === id)) {
                setActiveId(id);
                return prev;
            }
            const next = [...prev, { id, label, path, icon }];
            setActiveId(id);
            return next;
        });
    }, []);

    const closeTab = useCallback((id) => {
        setTabs(prev => {
            const filtered = prev.filter(t => t.id !== id);
            if (activeId === id && filtered.length > 0) {
                setActiveId(filtered[filtered.length - 1].id);
            }
            return filtered;
        });
    }, [activeId]);

    return (
        <TabContext.Provider value={{ tabs, activeId, openTab, closeTab, setActiveId }}>
            {children}
        </TabContext.Provider>
    );
};