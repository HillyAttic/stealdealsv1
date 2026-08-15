'use client';

import { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaUserShield, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa';

interface PagePermissions {
    vacant: boolean;
    plots: boolean;
    franchise: boolean;
    preleased: boolean;
    dashboard: boolean;
    users: boolean;
    wishlist: boolean;
    analytics: boolean;
    migration: boolean;
}

interface UserPermissions {
    pages: PagePermissions;
    viewOthers: boolean;
    editOthers: boolean;
}

export interface AdminUserFormData {
    name: string;
    email: string;
    password: string;
    role: 'superuser' | 'subuser';
    permissions: UserPermissions;
}

interface AdminUserFormProps {
    onSubmit: (userData: AdminUserFormData) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
    initialData?: Partial<AdminUserFormData>;
    editMode?: boolean;
}

const defaultPermissions: UserPermissions = {
    pages: {
        vacant: false, plots: false, franchise: false, preleased: false,
        dashboard: false, users: false, wishlist: false, analytics: false, migration: false,
    },
    viewOthers: false,
    editOthers: false,
};

const superuserPermissions: UserPermissions = {
    pages: {
        vacant: true, plots: true, franchise: true, preleased: true,
        dashboard: true, users: true, wishlist: true, analytics: true, migration: true,
    },
    viewOthers: true,
    editOthers: true,
};

const PAGE_ITEMS = [
    { key: 'dashboard',  label: 'Dashboard' },
    { key: 'vacant',     label: 'Vacant Properties' },
    { key: 'plots',      label: 'Plots' },
    { key: 'franchise',  label: 'Franchise' },
    { key: 'preleased',  label: 'Pre-Leased' },
    { key: 'users',      label: 'User Management' },
    { key: 'wishlist',   label: 'Wishlist Views' },
    { key: 'analytics',  label: 'Analytics' },
    { key: 'migration',  label: 'Migration Tools' },
] as const;

export function AdminUserForm({ onSubmit, onCancel, isLoading, initialData, editMode = false }: AdminUserFormProps) {
    const [formData, setFormData] = useState<AdminUserFormData>({
        name:        initialData?.name        ?? '',
        email:       initialData?.email       ?? '',
        password:    '',
        role:        initialData?.role        ?? 'subuser',
        permissions: initialData?.permissions ?? defaultPermissions,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!formData.name.trim()) e.name = 'Name is required';
        if (!formData.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email format';
        if (!editMode && !formData.password) e.password = 'Password is required';
        else if (formData.password && formData.password.length < 6) e.password = 'Min 6 characters';
        if (formData.role === 'subuser' && !Object.values(formData.permissions.pages).some(Boolean))
            e.permissions = 'Select at least one page';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        await onSubmit(formData);
    };

    const setRole = (role: 'superuser' | 'subuser') =>
        setFormData(prev => ({
            ...prev, role,
            permissions: role === 'superuser' ? superuserPermissions : prev.permissions,
        }));

    const togglePage = (page: keyof PagePermissions) =>
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                pages: { ...prev.permissions.pages, [page]: !prev.permissions.pages[page] },
            },
        }));

    const togglePrivacy = (k: 'viewOthers' | 'editOthers') =>
        setFormData(prev => ({
            ...prev,
            permissions: { ...prev.permissions, [k]: !prev.permissions[k] },
        }));

    return (
        <form onSubmit={handleSubmit}>
            {/* ── Two-column landscape layout ── */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-0">

                {/* ── LEFT COLUMN: basic info + role ── */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Basic Information</h3>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Enter full name"
                                disabled={isLoading}
                            />
                        </div>
                        {errors.name && <p className="mt-0.5 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'} ${editMode ? 'bg-gray-50 text-gray-500' : ''}`}
                                placeholder="user@example.com"
                                disabled={isLoading || editMode}
                            />
                        </div>
                        {editMode && <p className="mt-0.5 text-xs text-gray-400">Email cannot be changed</p>}
                        {errors.email && <p className="mt-0.5 text-xs text-red-600">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {editMode ? 'New Password (leave blank to keep)' : 'Password *'}
                        </label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                                className={`w-full pl-9 pr-9 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder={editMode ? 'Leave blank to keep current' : 'Min 6 characters'}
                                disabled={isLoading}
                            />
                            <button type="button" onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                                {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                            </button>
                        </div>
                        {errors.password && <p className="mt-0.5 text-xs text-red-600">{errors.password}</p>}
                    </div>

                    {/* Role */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Role</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {(['superuser', 'subuser'] as const).map(r => (
                                <button key={r} type="button" onClick={() => setRole(r)} disabled={isLoading}
                                    className={`py-3 border-2 rounded-lg text-sm transition-all ${formData.role === r ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    {r === 'superuser'
                                        ? <FaUserShield className={`mx-auto mb-1 text-lg ${formData.role === r ? 'text-blue-600' : 'text-gray-400'}`} />
                                        : <FaUser className={`mx-auto mb-1 text-lg ${formData.role === r ? 'text-blue-600' : 'text-gray-400'}`} />
                                    }
                                    <div className={`font-medium capitalize ${formData.role === r ? 'text-blue-700' : 'text-gray-600'}`}>{r}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        {r === 'superuser' ? 'Full access' : 'Limited access'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN: permissions ── */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Permissions
                        {formData.role === 'superuser' && <span className="ml-2 text-purple-500 normal-case font-normal">(all granted)</span>}
                    </h3>

                    {formData.role === 'superuser' ? (
                        <div className="flex items-center justify-center h-40 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="text-center">
                                <FaUserShield className="text-purple-400 text-3xl mx-auto mb-2" />
                                <p className="text-sm font-medium text-purple-700">Full Access</p>
                                <p className="text-xs text-purple-400 mt-1">All pages and controls granted</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Page checkboxes — 3 columns */}
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-2">Page Access</p>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {PAGE_ITEMS.map(({ key, label }) => (
                                        <label key={key}
                                            className={`flex items-center gap-2 px-2.5 py-2 border rounded-lg cursor-pointer text-xs transition-colors ${formData.permissions.pages[key] ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                            <input type="checkbox"
                                                checked={formData.permissions.pages[key]}
                                                onChange={() => togglePage(key)}
                                                disabled={isLoading}
                                                className="h-3 w-3 text-blue-600 border-gray-300 rounded flex-shrink-0" />
                                            <span className="leading-tight">{label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.permissions && <p className="mt-1 text-xs text-red-600">{errors.permissions}</p>}
                            </div>

                            {/* Privacy */}
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-2">Privacy Controls</p>
                                <div className="space-y-1.5">
                                    {[
                                        { key: 'viewOthers' as const, label: 'View others\' properties', desc: "See properties created by other admins" },
                                        { key: 'editOthers' as const, label: 'Edit others\' properties', desc: "Modify properties created by other admins" },
                                    ].map(({ key, label, desc }) => (
                                        <label key={key}
                                            className={`flex items-start gap-2.5 px-3 py-2.5 border rounded-lg cursor-pointer transition-colors ${formData.permissions[key] ? 'bg-blue-50 border-blue-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <input type="checkbox"
                                                checked={formData.permissions[key]}
                                                onChange={() => togglePrivacy(key)}
                                                disabled={isLoading}
                                                className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className={`text-xs font-medium ${formData.permissions[key] ? 'text-blue-700' : 'text-gray-700'}`}>{label}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Footer buttons ── */}
            <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-gray-100">
                <button type="button" onClick={onCancel} disabled={isLoading}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={isLoading}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors">
                    {isLoading
                        ? <><div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" /><span>{editMode ? 'Saving...' : 'Creating...'}</span></>
                        : <><FaCheck className="text-xs" /><span>{editMode ? 'Save Changes' : 'Create User'}</span></>
                    }
                </button>
            </div>
        </form>
    );
}
