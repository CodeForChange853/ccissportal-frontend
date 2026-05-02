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
                <CyberPanel title="Provision Faculty or Admin Account" variant="warning">
                    <div style={{ background: 'rgba(255,140,0,0.07)', border: '1px solid rgba(255,140,0,0.25)', borderRadius: 6, padding: '10px 14px', marginBottom: 14, fontFamily: 'var(--font-terminal)', fontSize: '0.68rem', color: 'var(--neon-orange)', lineHeight: 1.6 }}>
                        ⚠ This form provisions <strong>Faculty</strong> and <strong>Admin</strong> accounts only.
                        To enrol a new student, use the <strong>Direct Admission</strong> tab.
                    </div>
                    <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div><label style={T.label}>First Name</label>{field('first_name', 'First name')}</div>
                            <div><label style={T.label}>Last Name</label>{field('last_name', 'Last name')}</div>
                        </div>
                        <div><label style={T.label}>Email Address</label>{field('email_address', 'user@university.edu', 'email')}</div>
                        <div><label style={T.label}>Password</label>{field('plain_text_password', 'Temporary password', 'password')}</div>
                        <div>
                            <label style={T.label}>Role</label>
                            <select value={newUser.account_role} onChange={e => setNewUser(p => ({ ...p, account_role: e.target.value }))} style={T.input}>
                                {CREATABLE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        {newUser.account_role === 'FACULTY' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label style={T.label}>Employee ID</label>{field('employee_id', 'FAC-XXX')}</div>
                                <div><label style={T.label}>Department</label>{field('academic_department', 'CS Department')}</div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                            <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={creating}>
                                {creating ? 'CREATING...' : 'DEPLOY ACCOUNT'}
                            </button>
                        </div>
                    </form>
                </CyberPanel>
            )}

            <CyberPanel title="Accounts">
                {/* Role tabs + filter */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 14, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
                    {ROLES.map(role => {
                        const active = activeRole === role;
                        return (
                            <button key={role} onClick={() => setActiveRole(role)} style={{ background: active ? 'var(--accent-dim)' : 'transparent', border: active ? '1px solid var(--border-accent)' : '1px solid transparent', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s' }}>
                                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.65rem', letterSpacing: '0.12em', color: active ? 'var(--neon-cyan)' : 'var(--text-muted)' }}>{role}</span>
                                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', background: active ? 'var(--neon-cyan)' : 'var(--bg-depth)', color: active ? 'var(--bg-base)' : 'var(--text-muted)', borderRadius: 4, padding: '1px 6px', minWidth: 22, textAlign: 'center' }}>{counts[role]}</span>
                            </button>
                        );
                    })}
                    <div style={{ marginLeft: 'auto' }}>
                        <input
                            placeholder="Search users by name, email, or ID..."
                            value={filterQuery}
                            onChange={e => {
                                setFilterQuery(e.target.value);
                                setSearchParams(e.target.value ? { q: e.target.value } : {});
                            }}
                            style={T.input}
                        />
                    </div>
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
                        <div className="ag-theme-quartz" style={{ height: '500px', width: '100%' }}>
                            <AgGridReact theme="legacy" rowData={pageUsers} columnDefs={columnDefs} defaultColDef={defaultColDef} context={gridContext} />
                        </div>

                        {totalPages > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                                    {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
                                </span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button className="btn-ghost" style={{ fontSize: '0.60rem', padding: '5px 12px' }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>← PREV</button>
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        const n = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                                        return (
                                            <button key={n} onClick={() => setPage(n)} style={{ background: n === page ? 'var(--accent-dim)' : 'transparent', border: n === page ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)', borderRadius: 4, padding: '4px 10px', fontFamily: 'var(--font-terminal)', fontSize: '0.62rem', color: n === page ? 'var(--neon-cyan)' : 'var(--text-muted)', cursor: 'pointer' }}>
                                                {n + 1}
                                            </button>
                                        );
                                    })}
                                    <button className="btn-ghost" style={{ fontSize: '0.60rem', padding: '5px 12px' }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>NEXT →</button>
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