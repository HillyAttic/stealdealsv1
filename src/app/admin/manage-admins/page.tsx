'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminUserForm, AdminUserFormData } from '@/components/admin/AdminUserForm';
import {
    FaUser, FaUserShield, FaPlus, FaTimes, FaCheck,
    FaEdit, FaTrash, FaKey, FaEye, FaEyeSlash, FaExclamationTriangle,
} from 'react-icons/fa';

interface AdminUser {
    uid: string;
    email: string;
    name: string;
    role: 'superuser' | 'subuser';
    permissions: {
        pages: {
            vacant: boolean;
            plots: boolean;
            franchise: boolean;
            preleased: boolean;
            dashboard: boolean;
            users: boolean;
            wishlist: boolean;
            analytics: boolean;
            migration: boolean;
        };
        viewOthers: boolean;
        editOthers: boolean;
    };
    createdAt: string;
    plainPassword?: string | null;
}

type ModalType = 'create' | 'edit' | 'delete' | 'password' | null;

const SHELL = 'cobalt-page';

export default function ManageAdminsPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Modal state
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    // Action loading states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Password reset modal state
    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedUser(null);
        setNewPassword('');
        setShowNewPassword(false);
        setPasswordError('');
        setError(null);
    };

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('/api/admin/firebase-users', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'Failed to fetch admin users');
            setUsers(data.users || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load admin users');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // ── CREATE ──────────────────────────────────────────────────────────────
    const handleCreateUser = async (userData: AdminUserFormData) => {
        try {
            setIsSubmitting(true);
            setError(null);
            const response = await fetch('/api/admin/firebase-users', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'Failed to create user');
            closeModal();
            showSuccess(`User "${userData.name}" created successfully!`);
            await fetchUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create user');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── UPDATE ──────────────────────────────────────────────────────────────
    const handleUpdateUser = async (userData: AdminUserFormData) => {
        if (!selectedUser) return;
        try {
            setIsSubmitting(true);
            setError(null);
            const payload: Record<string, any> = {
                userId: selectedUser.uid,
                name: userData.name,
                role: userData.role,
                permissions: userData.permissions,
            };
            // Only include password if the user actually typed one
            if (userData.password) payload.password = userData.password;

            const response = await fetch('/api/admin/firebase-users', {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'Failed to update user');
            closeModal();
            showSuccess(`User "${userData.name}" updated successfully!`);
            await fetchUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── DELETE ──────────────────────────────────────────────────────────────
    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            setIsDeleting(true);
            setError(null);
            const response = await fetch(`/api/admin/firebase-users?userId=${selectedUser.uid}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'Failed to delete user');
            closeModal();
            showSuccess(`User "${selectedUser.name}" deleted successfully!`);
            await fetchUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete user');
        } finally {
            setIsDeleting(false);
        }
    };

    // ── RESET PASSWORD ───────────────────────────────────────────────────────
    const handleResetPassword = async () => {
        if (!selectedUser) return;
        if (!newPassword) { setPasswordError('Password is required'); return; }
        if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters'); return; }
        try {
            setIsSubmitting(true);
            setPasswordError('');
            const response = await fetch('/api/admin/firebase-users', {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUser.uid, password: newPassword }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'Failed to reset password');
            closeModal();
            showSuccess(`Password for "${selectedUser.name}" reset successfully!`);
        } catch (err) {
            setPasswordError(err instanceof Error ? err.message : 'Failed to reset password');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── HELPERS ──────────────────────────────────────────────────────────────
    const formatDate = (dateString: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const getPermissionsSummary = (user: AdminUser) => {
        if (user.role === 'superuser') return null;
        const enabled = Object.entries(user.permissions?.pages ?? {})
            .filter(([, v]) => v)
            .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));
        return enabled.length === 0 ? 'No pages' : enabled.join(', ');
    };

    const enabledPages = (user: AdminUser) =>
        Object.entries(user.permissions?.pages ?? {})
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(', ') || 'None';

    if (isLoading && users.length === 0) {
        return (
            <div data-theme="cobalt" className={SHELL}>
                <header className="page-head">
                    <div>
                        <div className="admin-skeleton h-7 w-64 mb-2" />
                        <div className="admin-skeleton h-4 w-80" />
                    </div>
                </header>
                <div className="stat-grid stat-grid--three">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="panel stat">
                            <div className="admin-skeleton h-3 w-24 mb-4" />
                            <div className="admin-skeleton h-8 w-16" />
                        </div>
                    ))}
                </div>
                <div className="panel">
                    <div className="admin-skeleton h-64 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div data-theme="cobalt" className={SHELL}>
            <header className="page-head">
                <div>
                    <h1 className="page-title">Admin User Management</h1>
                    <p className="page-sub">Manage admin users with role-based permissions</p>
                </div>
                <button
                    onClick={() => setActiveModal('create')}
                    className="btn btn--primary"
                >
                    <FaPlus aria-hidden="true" />
                    Create new admin
                </button>
            </header>

            {/* Success banner */}
            {successMessage && (
                <div className="cobalt-success">
                    <FaCheck aria-hidden="true" />
                    <p>{successMessage}</p>
                </div>
            )}

            {/* Error banner */}
            {error && !activeModal && (
                <div className="cobalt-error cobalt-error--row">
                    <p>{error}</p>
                    <button onClick={fetchUsers} className="btn btn--quiet">
                        Retry
                    </button>
                </div>
            )}

            {/* Stats */}
            <div className="stat-grid stat-grid--three">
                {[
                    { label: 'Total admins', value: users.length, icon: FaUserShield },
                    { label: 'Superusers', value: users.filter(u => u.role === 'superuser').length, icon: FaKey },
                    { label: 'Subusers', value: users.filter(u => u.role === 'subuser').length, icon: FaUser },
                ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="panel stat">
                        <p className="stat-label">
                            <Icon size={14} aria-hidden="true" />
                            {label}
                        </p>
                        <p className="stat-value">{value}</p>
                        <p className="stat-foot">
                            {label === 'Total admins'
                                ? 'All admin accounts'
                                : `${users.length > 0 ? Math.round((value / users.length) * 100) : 0}% of admins`}
                        </p>
                    </div>
                ))}
            </div>

            {/* Users table */}
            <section className="panel panel--flush">
                <div className="table-scroll">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Admin user</th>
                                <th>Role</th>
                                <th className="hide-sm">Permissions</th>
                                <th className="hide-sm">Created</th>
                                <th className="is-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.uid}>
                                    <td>
                                        <div className="identity">
                                            <div className="admin-avatar">
                                                <FaUserShield aria-hidden="true" />
                                            </div>
                                            <div className="identity-text">
                                                <p className="identity-name">{user.name}</p>
                                                <p className="identity-mail">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={user.role === 'superuser' ? 'badge badge--accent' : 'badge'}>
                                            {user.role === 'superuser' ? 'Superuser' : 'Subuser'}
                                        </span>
                                    </td>
                                    <td className="hide-sm">
                                        {user.role === 'superuser' ? (
                                            <span className="badge badge--accent">Full access</span>
                                        ) : (
                                            <>
                                                <p className="identity-name">{getPermissionsSummary(user)}</p>
                                                <p className="muted-note">Pages: {enabledPages(user)}</p>
                                            </>
                                        )}
                                    </td>
                                    <td className="hide-sm nowrap">{formatDate(user.createdAt)}</td>
                                    <td className="is-right">
                                        <div className="row-actions">
                                            <button
                                                onClick={() => { setSelectedUser(user); setActiveModal('password'); }}
                                                title="Reset password"
                                                aria-label={`Reset password for ${user.name}`}
                                                className="icon-btn icon-btn--warn"
                                            >
                                                <FaKey />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedUser(user); setActiveModal('edit'); }}
                                                title="Edit user"
                                                aria-label={`Edit ${user.name}`}
                                                className="icon-btn"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedUser(user); setActiveModal('delete'); }}
                                                title="Delete user"
                                                aria-label={`Delete ${user.name}`}
                                                className="icon-btn icon-btn--danger"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && !isLoading && (
                    <div className="empty">
                        <FaUserShield size={24} aria-hidden="true" />
                        <p className="empty-title">No admin users</p>
                        <p className="empty-hint">Get started by creating a new admin user.</p>
                    </div>
                )}
            </section>

            {/* ════════════════════════════════════════════════════════════════
                MODALS
            ════════════════════════════════════════════════════════════════ */}

            {/* ── CREATE modal ── */}
            {activeModal === 'create' && (
                <ModalShell title="Create new admin user" onClose={closeModal}>
                    {error && <div className="modal-error">{error}</div>}
                    <AdminUserForm
                        onSubmit={handleCreateUser}
                        onCancel={closeModal}
                        isLoading={isSubmitting}
                    />
                </ModalShell>
            )}

            {/* ── EDIT modal ── */}
            {activeModal === 'edit' && selectedUser && (
                <ModalShell title={`Edit — ${selectedUser.name}`} onClose={closeModal}>
                    {error && <div className="modal-error">{error}</div>}
                    <AdminUserForm
                        editMode
                        initialData={{
                            name: selectedUser.name,
                            email: selectedUser.email,
                            role: selectedUser.role,
                            permissions: selectedUser.permissions,
                        }}
                        onSubmit={handleUpdateUser}
                        onCancel={closeModal}
                        isLoading={isSubmitting}
                    />
                </ModalShell>
            )}

            {/* ── DELETE confirmation modal ── */}
            {activeModal === 'delete' && selectedUser && (
                <ModalShell title="Delete admin user" onClose={closeModal} size="sm">
                    <div className="confirm">
                        <div className="confirm-icon">
                            <FaExclamationTriangle aria-hidden="true" />
                        </div>
                        <div>
                            <p className="confirm-title">Are you sure?</p>
                            <p className="confirm-text">
                                This will permanently delete <strong>{selectedUser.name}</strong> ({selectedUser.email}).
                                This action cannot be undone.
                            </p>
                        </div>
                        {error && <div className="modal-error">{error}</div>}
                        <div className="modal-actions">
                            <button onClick={closeModal} disabled={isDeleting} className="btn">
                                Cancel
                            </button>
                            <button onClick={handleDeleteUser} disabled={isDeleting} className="btn btn--danger">
                                {isDeleting ? (
                                    <><span className="spin" aria-hidden="true" /><span>Deleting…</span></>
                                ) : (
                                    <><FaTrash aria-hidden="true" /><span>Delete</span></>
                                )}
                            </button>
                        </div>
                    </div>
                </ModalShell>
            )}

            {/* ── RESET PASSWORD modal ── */}
            {activeModal === 'password' && selectedUser && (
                <ModalShell title={`Password — ${selectedUser.name}`} onClose={closeModal} size="sm">
                    <div className="form-stack">
                        {/* Current stored password */}
                        <div className="field">
                            <label className="field-label">Current password</label>
                            {selectedUser.plainPassword ? (
                                <div className="input-wrap input-wrap--action">
                                    <FaKey aria-hidden="true" />
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        readOnly
                                        value={selectedUser.plainPassword}
                                        className="input is-readonly"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(v => !v)}
                                        className="input-action"
                                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            ) : (
                                <p className="field-hint">
                                    No password on record — this user was created before password storage was enabled.
                                </p>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="new-password" className="field-label">
                                Set new password <span className="field-label-note">(optional)</span>
                            </label>
                            <div className="input-wrap">
                                <FaKey aria-hidden="true" />
                                <input
                                    id="new-password"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => { setNewPassword(e.target.value); setPasswordError(''); }}
                                    className={`input ${passwordError ? 'is-invalid' : ''}`}
                                    placeholder="Minimum 6 characters"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {passwordError && <p className="field-error">{passwordError}</p>}
                        </div>

                        <div className="modal-actions">
                            <button onClick={closeModal} disabled={isSubmitting} className="btn">
                                Close
                            </button>
                            <button
                                onClick={handleResetPassword}
                                disabled={isSubmitting || !newPassword}
                                className="btn btn--primary"
                            >
                                {isSubmitting ? (
                                    <><span className="spin" aria-hidden="true" /><span>Saving…</span></>
                                ) : (
                                    <><FaKey aria-hidden="true" /><span>Update password</span></>
                                )}
                            </button>
                        </div>
                    </div>
                </ModalShell>
            )}
        </div>
    );
}

// ── Reusable modal shell ─────────────────────────────────────────────────────
function ModalShell({
    title, onClose, children, size = 'lg',
}: { title: string; onClose: () => void; children: React.ReactNode; size?: 'lg' | 'sm' }) {
    return (
        <div className="modal-backdrop">
            <div className="modal-backdrop-shade" onClick={onClose} />
            <div className={`modal ${size === 'sm' ? 'modal--sm' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
                <div className="modal-head">
                    <h2 className="modal-title">{title}</h2>
                    <button onClick={onClose} className="modal-close" aria-label="Close">
                        <FaTimes />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
