import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    LoadIcon, GradebookIcon, ProfileIcon, UsersIcon
} from '../../../components/icons';
import PortalLayout from '../../../components/layout/PortalLayout';

export const FACULTY_NAV = [
    {
        label: 'Teaching',
        items: [
            { id: 'load', label: 'My Load', Icon: LoadIcon, path: 'load' },
            { id: 'gradebook', label: 'Gradebook', Icon: GradebookIcon, path: 'gradebook' },
            { id: 'consultations', label: 'Consultations', Icon: UsersIcon, path: 'consultations' },
        ],
    },
    {
        label: 'Account',
        items: [
            { id: 'profile', label: 'My Profile', Icon: ProfileIcon, path: 'profile' },
        ],
    },
];

const FacultyLayout = ({
    activeTab,
    onTabChange,
    profileSlot,
    children
}) => {
    const { user } = useAuth();

    const activeLabel = FACULTY_NAV.flatMap(g => g.items).find(n => n.id === activeTab)?.label || 'Dashboard';
    const breadcrumb = ['Faculty', activeLabel];

    return (
        <PortalLayout
            groups={FACULTY_NAV}
            activeTab={activeTab}
            breadcrumb={breadcrumb}
            onNavigate={onTabChange}
            portalName="NexEnroll"
            portalSub="Faculty Portal"
            profileSlot={profileSlot}
            user={user}
        >
            {children}
        </PortalLayout>
    );
};

export default FacultyLayout;
