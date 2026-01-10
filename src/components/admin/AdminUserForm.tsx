'use client';

import { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaUserShield, FaCheck, FaTimes } from 'react-icons/fa';

interface AdminUserFormProps {
    onSubmit: (userData: CreateUserRequest) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    role: 'superuser' | 'subuser';
    permissions: {
        pages: {
            vacant: boolean;
            plots: boolean;
            franchise: boolean;
            preleased: boolean;
        };
        viewOthers: boolean;
        editOthers: boolean;
    };
}

export function AdminUserForm({ onSubmit, onCancel, isLoading }: AdminUserFormProps) {
    const [formData, setFormData] = useState<CreateUserRequest>({
        name: '',
        email: '',
        password: '',
        role: 'subuser',
        permissions: {
            pages: {
                vacant: false,
                plots: false,
                franchise: false,
                preleased: false,
            },
            viewOthers: false,
            editOthers: false,
        },
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Check if at least one page permission is selected for subusers
        if (formData.role === 'subuser') {
            const hasPagePermission = Object.values(formData.permissions.pages).some(p => p);
            if (!hasPagePermission) {
                newErrors.permissions = 'At least one page permission must be selected for subusers';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        await onSubmit(formData);
    };

    const handleRoleChange = (role: 'superuser' | 'subuser') => {
        setFormData(prev => ({
            ...prev,
            role,
            // Superusers get all permissions automatically
            permissions: role === 'superuser'
                ? {
                    pages: { vacant: true, plots: true, franchise: true, preleased: true },
                    viewOthers: true,
                    editOthers: true,
                }
                : prev.permissions
        }));
    };

    const handlePagePermissionChange = (page: keyof typeof formData.permissions.pages) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                pages: {
                    ...prev.permissions.pages,
                    [page]: !prev.permissions.pages[page],
                },
            },
        }));
    };

    const handleCrossUserPermissionChange = (permission: 'viewOthers' | 'editOthers') => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permission]: !prev.permissions[permission],
            },
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                    </label>
                    <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter full name"
                            disabled={isLoading}
                        />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                    </label>
                    <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="user@example.com"
                            disabled={isLoading}
                        />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                    </label>
                    <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Minimum 6 characters"
                            disabled={isLoading}
                        />
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Role</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => handleRoleChange('superuser')}
                        disabled={isLoading}
                        className={`p-4 border-2 rounded-lg transition-all ${formData.role === 'superuser'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <FaUserShield className={`mx-auto mb-2 text-2xl ${formData.role === 'superuser' ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                        <div className="font-medium">Superuser</div>
                        <div className="text-xs text-gray-600 mt-1">Full access to everything</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleRoleChange('subuser')}
                        disabled={isLoading}
                        className={`p-4 border-2 rounded-lg transition-all ${formData.role === 'subuser'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <FaUser className={`mx-auto mb-2 text-2xl ${formData.role === 'subuser' ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                        <div className="font-medium">Subuser</div>
                        <div className="text-xs text-gray-600 mt-1">Limited access based on permissions</div>
                    </button>
                </div>
            </div>

            {/* Permissions (only for subusers) */}
            {formData.role === 'subuser' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Permissions</h3>

                    {/* Page Access */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Page Access
                        </label>
                        <div className="space-y-2">
                            {[
                                { key: 'vacant', label: 'Vacant Properties' },
                                { key: 'plots', label: 'Plots' },
                                { key: 'franchise', label: 'Franchise Opportunities' },
                                { key: 'preleased', label: 'Pre-Leased Properties' },
                            ].map(({ key, label }) => (
                                <label key={key} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.pages[key as keyof typeof formData.permissions.pages]}
                                        onChange={() => handlePagePermissionChange(key as keyof typeof formData.permissions.pages)}
                                        disabled={isLoading}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700">{label}</span>
                                </label>
                            ))}
                        </div>
                        {errors.permissions && <p className="mt-1 text-sm text-red-600">{errors.permissions}</p>}
                    </div>

                    {/* Privacy Controls */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Privacy Controls
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.permissions.viewOthers}
                                    onChange={() => handleCrossUserPermissionChange('viewOthers')}
                                    disabled={isLoading}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                                />
                                <div>
                                    <div className="text-sm font-medium text-gray-700">Can view properties added by other users</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        If disabled, user will only see properties they created themselves
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.permissions.editOthers}
                                    onChange={() => handleCrossUserPermissionChange('editOthers')}
                                    disabled={isLoading}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                                />
                                <div>
                                    <div className="text-sm font-medium text-gray-700">Can edit properties added by other users</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        If disabled, user can only edit their own properties
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Creating...</span>
                        </>
                    ) : (
                        <>
                            <FaCheck />
                            <span>Create User</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
