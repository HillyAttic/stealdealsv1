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
            <div className="form-grid">
                {/* ── Left: basic info + role ── */}
                <div className="form-stack">
                    <h3 className="form-section-title">Basic information</h3>

                    <div className="field">
                        <label htmlFor="admin-name" className="field-label">Full name *</label>
                        <div className="input-wrap">
                            <FaUser aria-hidden="true" />
                            <input
                                id="admin-name"
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                className={`input ${errors.name ? 'is-invalid' : ''}`}
                                placeholder="Enter full name"
                                disabled={isLoading}
                            />
                        </div>
                        {errors.name && <p className="field-error">{errors.name}</p>}
                    </div>

                    <div className="field">
                        <label htmlFor="admin-email" className="field-label">Email address *</label>
                        <div className="input-wrap">
                            <FaEnvelope aria-hidden="true" />
                            <input
                                id="admin-email"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                className={`input ${errors.email ? 'is-invalid' : ''} ${editMode ? 'is-readonly' : ''}`}
                                placeholder="user@example.com"
                                disabled={isLoading || editMode}
                            />
                        </div>
                        {editMode && <p className="field-hint">Email cannot be changed</p>}
                        {errors.email && <p className="field-error">{errors.email}</p>}
                    </div>

                    <div className="field">
                        <label htmlFor="admin-password" className="field-label">
                            {editMode ? 'New password (leave blank to keep)' : 'Password *'}
                        </label>
                        <div className="input-wrap input-wrap--action">
                            <FaLock aria-hidden="true" />
                            <input
                                id="admin-password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                                className={`input ${errors.password ? 'is-invalid' : ''}`}
                                placeholder={editMode ? 'Leave blank to keep current' : 'Min 6 characters'}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="input-action"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                tabIndex={-1}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.password && <p className="field-error">{errors.password}</p>}
                    </div>

                    <div>
                        <h3 className="form-section-title">Role</h3>
                        <div className="role-grid">
                            {(['superuser', 'subuser'] as const).map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    disabled={isLoading}
                                    aria-pressed={formData.role === r}
                                    className={`role-card ${formData.role === r ? 'is-active' : ''}`}
                                >
                                    {r === 'superuser'
                                        ? <FaUserShield className="role-card-icon" aria-hidden="true" />
                                        : <FaUser className="role-card-icon" aria-hidden="true" />
                                    }
                                    <span className="role-card-name">{r}</span>
                                    <span className="role-card-desc">
                                        {r === 'superuser' ? 'Full access' : 'Limited access'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right: permissions ── */}
                <div className="form-stack">
                    <h3 className="form-section-title">
                        Permissions
                        {formData.role === 'superuser' && <span className="form-section-note">All granted</span>}
                    </h3>

                    {formData.role === 'superuser' ? (
                        <div className="full-access">
                            <FaUserShield className="full-access-icon" aria-hidden="true" />
                            <p className="full-access-title">Full access</p>
                            <p className="full-access-hint">All pages and controls granted</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className="form-section-title">Page access</p>
                                <div className="perm-grid">
                                    {PAGE_ITEMS.map(({ key, label }) => (
                                        <label
                                            key={key}
                                            className={`perm-option ${formData.permissions.pages[key] ? 'is-checked' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.pages[key]}
                                                onChange={() => togglePage(key)}
                                                disabled={isLoading}
                                            />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.permissions && <p className="field-error">{errors.permissions}</p>}
                            </div>

                            <div>
                                <p className="form-section-title">Privacy controls</p>
                                <div className="perm-stack">
                                    {[
                                        { key: 'viewOthers' as const, label: 'View others\' properties', desc: "See properties created by other admins" },
                                        { key: 'editOthers' as const, label: 'Edit others\' properties', desc: "Modify properties created by other admins" },
                                    ].map(({ key, label, desc }) => (
                                        <label
                                            key={key}
                                            className={`perm-option perm-option--row ${formData.permissions[key] ? 'is-checked' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions[key]}
                                                onChange={() => togglePrivacy(key)}
                                                disabled={isLoading}
                                            />
                                            <span>
                                                <span className="perm-option-label">{label}</span>
                                                <span className="perm-option-desc">{desc}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="form-footer">
                <button type="button" onClick={onCancel} disabled={isLoading} className="btn">
                    Cancel
                </button>
                <button type="submit" disabled={isLoading} className="btn btn--primary">
                    {isLoading ? (
                        <><span className="spin" aria-hidden="true" /><span>{editMode ? 'Saving…' : 'Creating…'}</span></>
                    ) : (
                        <><FaCheck aria-hidden="true" /><span>{editMode ? 'Save changes' : 'Create user'}</span></>
                    )}
                </button>
            </div>
        </form>
    );
}
