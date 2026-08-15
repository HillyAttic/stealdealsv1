'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AdminUserForm, AdminUserFormData } from '@/components/admin/AdminUserForm';
import {
    FaUser, FaUserShield, FaPlus, FaTimes, FaCheck,
    FaEdit, FaTrash, FaKey, FaEye, FaEyeSlash, FaExclamationTriangle,
} from 'react-icons/fa';
import { LoadingSpinner } from '@/components/dashboard/LoadingSpinner';
import { ErrorMessage } from '@/components/dashboard/ErrorMessage';

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

    if (isLoading && users.length === 0) {
        return <AdminLayout><LoadingSpinner message="Loading admin users..." /></AdminLayout>;
    }

    return (
        <AdminLayout>
            <div className="space-y-6">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin User Management</h1>
                        <p className="text-gray-600">Manage admin users with role-based permissions</p>
                    </div>
                    <button
                        onClick={() => setActiveModal('create')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        <FaPlus />
                        Create New Admin
                    </button>
                </div>

                {/* ── Success banner ── */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center gap-3">
                        <FaCheck className="text-green-500 flex-shrink-0" />
                        <p>{successMessage}</p>
                    </div>
                )}

                {/* ── Error banner ── */}
                {error && !activeModal && (
                    <ErrorMessage message={error} onRetry={fetchUsers} />
                )}

                {/* ── Stats ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Admins', value: users.length, color: 'blue' },
                        { label: 'Superusers', value: users.filter(u => u.role === 'superuser').length, color: 'purple' },
                        { label: 'Subusers', value: users.filter(u => u.role === 'subuser').length, color: 'green' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 bg-${color}-100 rounded-lg`}>
                                    <FaUserShield className={`text-${color}-600 text-xl`} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Users Table ── */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map(user => (
                                    <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                                        {/* User info */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <FaUserShield className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Role badge */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.role === 'superuser'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {user.role === 'superuser' ? 'Superuser' : 'Subuser'}
                                            </span>
                                        </td>
                                        {/* Permissions */}
                                        <td className="px-6 py-4">
                                            {user.role === 'superuser' ? (
                                                <span className="text-sm font-medium text-purple-600">Full Access</span>
                                            ) : (
                                                <div className="text-sm text-gray-700">
                                                    <div className="font-medium">{getPermissionsSummary(user)}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        Pages: {Object.entries(user.permissions?.pages ?? {})
                                                            .filter(([, v]) => v).map(([k]) => k).join(', ') || 'None'}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        {/* Created at */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        {/* ── Action buttons ── */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Reset Password */}
                                                <button
                                                    onClick={() => { setSelectedUser(user); setActiveModal('password'); }}
                                                    title="Reset Password"
                                                    className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                                >
                                                    <FaKey className="text-sm" />
                                                </button>
                                                {/* Edit */}
                                                <button
                                                    onClick={() => { setSelectedUser(user); setActiveModal('edit'); }}
                                                    title="Edit User"
                                                    className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    onClick={() => { setSelectedUser(user); setActiveModal('delete'); }}
                                                    title="Delete User"
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <FaUserShield className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No admin users</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new admin user.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                MODALS
            ════════════════════════════════════════════════════════════════ */}

            {/* ── CREATE modal ── */}
            {activeModal === 'create' && (
                <ModalShell title="Create New Admin User" onClose={closeModal}>
                    {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
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
                    {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
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
                <ModalShell title="Delete Admin User" onClose={closeModal} maxWidth="max-w-sm">
                    <div className="flex flex-col items-center text-center gap-4 py-2">
                        <div className="p-4 bg-red-100 rounded-full">
                            <FaExclamationTriangle className="text-red-600 text-3xl" />
                        </div>
                        <div>
                            <p className="text-gray-800 font-semibold text-lg">Are you sure?</p>
                            <p className="text-gray-500 text-sm mt-1">
                                This will permanently delete <span className="font-semibold text-gray-700">{selectedUser.name}</span> ({selectedUser.email}).
                                This action cannot be undone.
                            </p>
                        </div>
                        {error && <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
                        <div className="flex gap-3 w-full mt-2">
                            <button
                                onClick={closeModal}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                            >
                                {isDeleting ? (
                                    <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /><span>Deleting...</span></>
                                ) : (
                                    <><FaTrash /><span>Delete</span></>
                                )}
                            </button>
                        </div>
                    </div>
                </ModalShell>
            )}

            {/* ── RESET PASSWORD modal ── */}
            {activeModal === 'password' && selectedUser && (
                <ModalShell title={`Password — ${selectedUser.name}`} onClose={closeModal} maxWidth="max-w-sm">
                    <div className="space-y-5">
                        {/* Show current stored password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            {selectedUser.plainPassword ? (
                                <div className="relative">
                                    <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        readOnly
                                        value={selectedUser.plainPassword}
                                        className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 cursor-default select-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic px-1">
                                    No password on record — this user was created before password storage was enabled.
                                </p>
                            )}
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Set New Password <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <div className="relative">
                                <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => { setNewPassword(e.target.value); setPasswordError(''); }}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Minimum 6 characters"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={closeModal}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleResetPassword}
                                disabled={isSubmitting || !newPassword}
                                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                            >
                                {isSubmitting ? (
                                    <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /><span>Saving...</span></>
                                ) : (
                                    <><FaKey /><span>Update Password</span></>
                                )}
                            </button>
                        </div>
                    </div>
                </ModalShell>
            )}
        </AdminLayout>
    );
}

// ── Reusable modal shell ─────────────────────────────────────────────────────
function ModalShell({
    title, onClose, children, maxWidth = 'max-w-5xl',
}: { title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            {/* Panel — landscape, no scroll */}
            <div className={`relative bg-white rounded-xl shadow-2xl w-full ${maxWidth} flex flex-col`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>
                {/* Body — no overflow */}
                <div className="px-6 py-5">
                    {children}
                </div>
            </div>
        </div>
    );
}
