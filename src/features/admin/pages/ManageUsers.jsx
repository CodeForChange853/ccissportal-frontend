// frontend/src/features/admin/pages/ManageUsers.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
ModuleRegistry.registerModules([AllCommunityModule]);
import { adminApi } from '../api/adminApi';
import CyberPanel from '../../../components/ui/CyberPanel';
import StatusBadge from '../../../components/ui/StatusBadge';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../../../components/ui/PageHeader';
import { useToast } from '../../../context/ToastContext';
import { USER_ROLE_VARIANT } from '../../../constants/statusVariants';

import { KeyIcon, ShieldIcon, UsersIcon, FacultyIcon, EnrollmentsIcon, LoadIcon } from '../../../components/icons';

const ROLES = ['ALL', 'STUDENT', 'FACULTY', 'ADMIN'];
const CREATABLE_ROLES = ['FACULTY', 'ADMIN'];  // STUDENT created via AdminAdmissions only
const PAGE_SIZE = 25;

// ✅ Using shared USER_ROLE_VARIANT — local ROLE_VARIANT removed
const RoleCellRenderer = ({ value }) => <StatusBadge variant={USER_ROLE_VARIANT[value] ?? 'muted'} label={value} showDot={false} />;
const ActiveCellRenderer = ({ value }) => <StatusBadge variant={value ? 'normal' : 'critical'} label={value ? 'ACTIVE' : 'SUSPENDED'} />;
const ActionCellRenderer = ({ data, context }) => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
        <button
            className={data.is_active_account ? 'btn-danger' : 'btn-primary'}
            style={{ fontSize: '0.6rem', padding: '5px 12px' }}
            onClick={() => context.toggleActive(data)}
        >
            {data.is_active_account ? 'SUSPEND' : 'ACTIVATE'}
        </button>
    </div>
);

const T = {
    label: { fontFamily: 'var(--font-terminal)', fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 5 },
    input: { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 6, padding: '9px 12px', fontFamily: 'var(--font-terminal)', fontSize: '0.78rem', color: 'var(--text-primary)', outline: 'none' },
};

const ManageUsers = () => {
    const { toast } = useToast();
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRole, setActiveRole] = useState('ALL');
    const [filterQuery, setFilterQuery] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [page, setPage] = useState(0);

    // Deep-Link Sync: Update filter state instantly when URL changes via Command Palette
    useEffect(() => {
        const q = searchParams.get('q');
        if (q !== null) {
            setFilterQuery(q);
        }
    }, [searchParams]);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newUser, setNewUser] = useState({
        email_address: '', plain_text_password: '', account_role: 'FACULTY',
        first_name: '', last_name: '', employee_id: '', academic_department: '',
    });

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.fetchAllUsers({ limit: 200 });
            setAllUsers(data ?? []);
        } catch {
            toast.error('Failed to load user accounts.');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);
    useEffect(() => { setPage(0); }, [activeRole, filterQuery]);

    const filteredUsers = useMemo(() => {
        let list = [...allUsers];
        if (activeRole !== 'ALL') list = list.filter(u => u.account_role === activeRole);
        if (filterQuery.trim()) {
            const q = filterQuery.toLowerCase();
            list = list.filter(u =>
                u.email_address.toLowerCase().includes(q) ||
                (u.first_name && u.first_name.toLowerCase().includes(q)) ||
                (u.last_name && u.last_name.toLowerCase().includes(q)) ||
                (u.student_number && u.student_number.toLowerCase().includes(q))
            );
        }
        return list;
    }, [allUsers, activeRole, filterQuery]);

    const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
    const pageUsers = filteredUsers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const counts = useMemo(() => ({
        ALL: allUsers.length,
        STUDENT: allUsers.filter(u => u.account_role === 'STUDENT').length,
        FACULTY: allUsers.filter(u => u.account_role === 'FACULTY').length,
        ADMIN: allUsers.filter(u => u.account_role === 'ADMIN').length,
    }), [allUsers]);

    const toggleActive = useCallback(async (user) => {
        try {
            await adminApi.setUserActiveStatus(user.account_id, !user.is_active_account);
            setAllUsers(prev => prev.map(u =>
                u.account_id === user.account_id ? { ...u, is_active_account: !u.is_active_account } : u
            ));
            toast.success(`${user.email_address} ${!user.is_active_account ? 'activated' : 'suspended'}.`);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Action failed.');
        }
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault(); setCreating(true);
        try {
            await adminApi.createUser(newUser);
            setShowCreate(false);
            setNewUser({ email_address: '', plain_text_password: '', account_role: 'FACULTY', first_name: '', last_name: '', employee_id: '', academic_department: '' });
            toast.success(`Account created for ${newUser.email_address}.`);
            loadUsers();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to create account.');
        } finally { setCreating(false); }
    };

    const field = (key, placeholder, type = 'text') => (
        <input type={type} placeholder={placeholder} aria-label={placeholder} value={newUser[key]}
            onChange={e => setNewUser(p => ({ ...p, [key]: e.target.value }))} style={T.input}
            onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,245,255,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
        />
    );

    const gridContext = useMemo(() => ({ toggleActive }), [toggleActive]);
    const columnDefs = useMemo(() => [
        { field: 'email_address', headerName: 'Email', flex: 3, cellStyle: { fontFamily: 'var(--font-terminal)', fontSize: '0.78rem' } },
        { field: 'account_role', headerName: 'Role', flex: 1, cellRenderer: RoleCellRenderer },
        { field: 'is_active_account', headerName: 'Status', flex: 1, cellRenderer: ActiveCellRenderer },
        { headerName: 'Action', flex: 1, cellRenderer: ActionCellRenderer, sortable: false, filter: false },
    ], []);
    const defaultColDef = useMemo(() => ({ sortable: true, resizable: true, suppressMovable: true }), []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ✅ Shared PageHeader — dynamic subtitle shows live counts */}
            <PageHeader
                title="User Registry"
                subtitle={`${counts.ALL} accounts — ${counts.STUDENT} students · ${counts.FACULTY} faculty · ${counts.ADMIN} admins`}
                badge={
                    <button className={showCreate ? 'btn-ghost' : 'btn-primary'} onClick={() => setShowCreate(v => !v)}>
                        {showCreate ? 'CANCEL' : '+ NEW FACULTY / ADMIN'}
                    </button>
                }
            />

            {showCreate && (
                <div style={{
                    padding: 32,
                    background: 'var(--bg-sidebar)',
                    color: '#fff',
                    borderRadius: 24,
                    boxShadow: 'var(--shadow-accent)',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
                        <UsersIcon size={120} />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Provision Account</h2>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                            Deploying new administrative or academic staff credentials.
                        </p>
                    </div>

                    <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div><label style={{ ...T.label, color: 'rgba(255,255,255,0.4)' }}>First Name</label>{field('first_name', 'First name')}</div>
                            <div><label style={{ ...T.label, color: 'rgba(255,255,255,0.4)' }}>Last Name</label>{field('last_name', 'Last name')}</div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                            <div><label style={{ ...T.label, color: 'rgba(255,255,255,0.4)' }}>Email Address</label>{field('email_address', 'user@university.edu', 'email')}</div>
                            <div>
                                <label style={{ ...T.label, color: 'rgba(255,255,255,0.4)' }}>Role</label>
                                <select 
                                    value={newUser.account_role} 
                                    onChange={e => setNewUser(p => ({ ...p, account_role: e.target.value }))} 
                                    style={{ 
                                        ...T.input, 
                                        background: 'rgba(255,255,255,0.05)', 
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff' 
                                    }}
                                >
                                    {CREATABLE_ROLES.map(r => <option key={r} value={r} style={{ background: '#111' }}>{r}</option>)}
                                </select>
                            </div>
                        </div>

                        <div><label style={{ ...T.label, color: 'rgba(255,255,255,0.4)' }}>Temporary Password</label>{field('plain_text_password', '••••••••', 'password')}</div>

                        {newUser.account_role === 'FACULTY' && (
                            <div style={{ 
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
                                padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 16,
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div><label style={{ ...T.label, color: 'rgba(255,255,255,0.4)' }}>Employee ID</label>{field('employee_id', 'FAC-XXX')}</div>
                                <div><label style={{ ...T.label, color: 'rgba(255,255,255,0.4)' }}>Department</label>{field('academic_department', 'CS Department')}</div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                            <button type="button" className="btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => setShowCreate(false)}>Cancel</button>
                            <button 
                                type="submit" 
                                className="btn-primary" 
                                disabled={creating}
                                style={{ 
                                    background: 'var(--student-gold)', color: '#000', 
                                    padding: '10px 24px', fontWeight: 800,
                                    boxShadow: '0 4px 12px rgba(201,168,76,0.3)' 
                                }}
                            >
                                {creating ? 'PROVISIONING...' : 'DEPLOY ACCOUNT'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <CyberPanel 
                title="Accounts" 
                headerRight={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                placeholder="Search accounts..."
                                value={filterQuery}
                                onChange={e => {
                                    setFilterQuery(e.target.value);
                                    setSearchParams(e.target.value ? { q: e.target.value } : {});
                                }}
                                style={{
                                    ...T.input,
                                    width: 240,
                                    paddingRight: 32,
                                    fontSize: '0.7rem',
                                }}
                            />
                            <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                                🔍
                            </div>
                        </div>
                    </div>
                }
            >
                {/* Role tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    {ROLES.map(role => {
                        const active = activeRole === role;
                        return (
                            <button 
                                key={role} 
                                onClick={() => setActiveRole(role)} 
                                style={{ 
                                    background: active ? 'var(--accent)' : 'var(--bg-depth)', 
                                    border: '1px solid var(--border-default)', 
                                    borderRadius: 100, 
                                    padding: '6px 16px', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 10, 
                                    transition: 'all 0.2s',
                                    boxShadow: active ? 'var(--shadow-accent)' : 'none',
                                    transform: active ? 'translateY(-1px)' : 'none',
                                }}
                            >
                                <span style={{ 
                                    fontFamily: 'var(--font-terminal)', 
                                    fontSize: '0.62rem', 
                                    fontWeight: 700,
                                    letterSpacing: '0.05em', 
                                    color: active ? '#fff' : 'var(--text-secondary)' 
                                }}>
                                    {role}
                                </span>
                                <span style={{ 
                                    fontFamily: 'var(--font-terminal)', 
                                    fontSize: '0.60rem', 
                                    background: active ? 'rgba(255,255,255,0.2)' : 'var(--bg-input)', 
                                    color: active ? '#fff' : 'var(--text-muted)', 
                                    borderRadius: 20, 
                                    padding: '1px 8px', 
                                    minWidth: 24, 
                                    textAlign: 'center',
                                    fontWeight: 800
                                }}>
                                    {counts[role]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                {loading ? (
                    <Skeleton.Table rows={8} cols={4} />
                ) : pageUsers.length === 0 ? (
                    <EmptyState
                        icon="🔍"
                        title="No accounts found"
                        subtitle={filterQuery ? `No results for "${filterQuery}" in ${activeRole === 'ALL' ? 'all roles' : activeRole}.` : `No ${activeRole === 'ALL' ? '' : activeRole.toLowerCase() + ' '}accounts exist yet.`}
                        action={activeRole !== 'ALL' || filterQuery ? { label: 'CLEAR FILTER', onClick: () => { setActiveRole('ALL'); setFilterQuery(''); } } : undefined}
                        compact
                    />
                ) : (
                    <>
                        <div className="ag-theme-quartz" style={{ height: '500px', width: '100%', borderRadius: 12, overflow: 'hidden' }}>
                            <AgGridReact theme="legacy" rowData={pageUsers} columnDefs={columnDefs} defaultColDef={defaultColDef} context={gridContext} />
                        </div>

                        {totalPages > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    DISPLAYING {page * PAGE_SIZE + 1}—{Math.min((page + 1) * PAGE_SIZE, filteredUsers.length)} / {filteredUsers.length}
                                </span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button className="btn-ghost" style={{ fontSize: '0.62rem', padding: '6px 14px', borderRadius: 10 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>PREVIOUS</button>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                            const n = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                                            return (
                                                <button 
                                                    key={n} 
                                                    onClick={() => setPage(n)} 
                                                    style={{ 
                                                        background: n === page ? 'var(--accent)' : 'var(--bg-depth)', 
                                                        border: '1px solid var(--border-default)', 
                                                        borderRadius: 8, 
                                                        width: 32,
                                                        height: 32,
                                                        fontFamily: 'var(--font-terminal)', 
                                                        fontSize: '0.65rem', 
                                                        fontWeight: 800,
                                                        color: n === page ? '#fff' : 'var(--text-muted)', 
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    {n + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button className="btn-ghost" style={{ fontSize: '0.62rem', padding: '6px 14px', borderRadius: 10 }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>NEXT</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CyberPanel>
        </div>
    );
};

export default ManageUsers;