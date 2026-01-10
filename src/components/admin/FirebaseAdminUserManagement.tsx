'use client';

import { useState, useEffect } from 'react';
import { FaUserShield, FaUserPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
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
            // NEW PERMISSIONS ADDED
            dashboard: boolean;
            users: boolean;
            wishlist: boolean;
            analytics: boolean;
            migration: boolean;
        };
        viewOthers: boolean;
        editOthers: boolean;
        manageUsers: boolean;
    };
    createdAt: string;
    createdBy: string;
}

interface CreateUserFormData {
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
            // NEW PERMISSIONS ADDED
            dashboard: boolean;
            users: boolean;
            wishlist: boolean;
            analytics: boolean;
            migration: boolean;
        };
        viewOthers: boolean;
        editOthers: boolean;
    };
}

export function FirebaseAdminUserManagement() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createSuccess, setCreateSuccess] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState<CreateUserFormData>({
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
                // NEW PERMISSIONS INITIALIZED TO FALSE
                dashboard: false,
                users: false,
                wishlist: false,
                analytics: false,
                migration: false,
            },
            viewOthers: false,
            editOthers: false,
        },
    });

    // Fetch all Firebase admin users
    const fetchAdminUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/admin/firebase-users', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to fetch admin users');
            }

            setUsers(data.users || []);
        } catch (err) {
            console.error('Error fetching admin users:', err);
            setError(err instanceof Error ? err.message : 'Failed to load admin users');
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchAdminUsers();
    }, []);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;

            // Handle nested permissions
            if (name.startsWith('pages.')) {
                const pageName = name.split('.')[1] as keyof CreateUserFormData['permissions']['pages'];
                setFormData(prev => ({
                    ...prev,
                    permissions: {
                        ...prev.permissions,
                        pages: {
                            ...prev.permissions.pages,
                            [pageName]: checked,
                        },
                    },
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    permissions: {
                        ...prev.permissions,
                        [name]: checked,
                    },
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Handle role change - auto-set permissions for superuser
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const role = e.target.value as 'superuser' | 'subuser';

        if (role === 'superuser') {
            // Superusers get all permissions
            setFormData(prev => ({
                ...prev,
                role,
                permissions: {
                    pages: {
                        vacant: true,
                        plots: true,
                        franchise: true,
                        preleased: true,
                        // NEW PERMISSIONS FOR SUPERUSER
                        dashboard: true,
                        users: true,
                        wishlist: true,
                        analytics: true,
                        migration: true,
                    },
                    viewOthers: true,
                    editOthers: true,
                },
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                role,
            }));
        }
    };

    // Handle form submission
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setCreateError(null);
        setCreateSuccess(null);

        try {
            // Validate form
            if (!formData.name || !formData.email || !formData.password) {
                throw new Error('Please fill in all required fields');
            }

            if (formData.password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            const response = await fetch('/api/admin/firebase-users', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to create admin user');
            }

            setCreateSuccess(`Successfully created admin user: ${formData.email}`);

            // Reset form
            setFormData({
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
                        // NEW PERMISSIONS INITIALIZED TO FALSE
                        dashboard: false,
                        users: false,
                        wishlist: false,
                        analytics: false,
                        migration: false,
                    },
                    viewOthers: false,
                    editOthers: false,
                },
            });

            // Refresh user list
            await fetchAdminUsers();

            // Close form after 2 seconds
            setTimeout(() => {
                setShowCreateForm(false);
                setCreateSuccess(null);
            }, 2000);
        } catch (err) {
            console.error('Error creating admin user:', err);
            setCreateError(err instanceof Error ? err.message : 'Failed to create admin user');
        } finally {
            setIsCreating(false);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get permission summary
    const getPermissionSummary = (user: AdminUser) => {
        if (user.role === 'superuser') {
            return 'Full Access';
        }

        const pageCount = Object.values(user.permissions.pages).filter(Boolean).length;
        const permissions: string[] = [];

        if (pageCount > 0) {
            permissions.push(`${pageCount} page${pageCount !== 1 ? 's' : ''}`);
        }
        if (user.permissions.viewOthers) {
            permissions.push('View Others');
        }
        if (user.permissions.editOthers) {
            permissions.push('Edit Others');
        }

        return permissions.length > 0 ? permissions.join(', ') : 'No permissions';
    };

    if (isLoading && users.length === 0) {
        return <LoadingSpinner message="Loading admin users..." />;
    }

    if (error && users.length === 0) {
        return <ErrorMessage message={error} onRetry={fetchAdminUsers} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Firebase Admin User Management</h1>
                    <p className="text-gray-600">Manage admin users with role-based permissions</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <FaUserPlus className="mr-2" />
                    {showCreateForm ? 'Cancel' : 'Create New Admin'}
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FaUserShield className="text-blue-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Total Admins</p>
                            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <FaUserShield className="text-purple-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Superusers</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.role === 'superuser').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <FaUserShield className="text-green-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Subusers</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.role === 'subuser').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create User Form */}
            {showCreateForm && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Admin User</h2>

                    {createError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {createError}
                        </div>
                    )}

                    {createSuccess && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center">
                            <FaCheck className="mr-2" />
                            {createSuccess}
                        </div>
                    )}

                    <form onSubmit={handleCreateUser} className="space-y-4">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        minLength={6}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                        placeholder="Min 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleRoleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="subuser">Subuser (Limited Access)</option>
                                    <option value="superuser">Superuser (Full Access)</option>
                                </select>
                            </div>
                        </div>

                        {/* Permissions (only for subusers) */}
                        {formData.role === 'subuser' && (
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Permissions</h3>

                                {/* Page Access */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Page Access</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {(['vacant', 'plots', 'franchise', 'preleased', 'dashboard', 'users', 'wishlist', 'analytics', 'migration'] as const).map(page => (
                                            <label key={page} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name={`pages.${page}`}
                                                    checked={formData.permissions.pages[page]}
                                                    onChange={handleInputChange}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700 capitalize">{page.replace(/([A-Z])/g, ' $1')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Property Permissions */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Property Permissions</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="viewOthers"
                                                checked={formData.permissions.viewOthers}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">
                                                View properties created by others
                                            </span>
                                        </label>

                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="editOthers"
                                                checked={formData.permissions.editOthers}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">
                                                Edit properties created by others
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {formData.role === 'superuser' && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <p className="text-sm text-purple-800">
                                    <strong>Superuser Role:</strong> This user will have full access to all pages,
                                    can view and edit all properties, and can manage other admin users.
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                disabled={isCreating}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
                            >
                                {isCreating ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FaUserPlus className="mr-2" />
                                        Create Admin User
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users List */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Admin User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Permissions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.uid} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                                                <FaUserShield className="text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'superuser'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-green-100 text-green-800'
                                                }`}
                                        >
                                            {user.role === 'superuser' ? 'Superuser' : 'Subuser'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{getPermissionSummary(user)}</div>
                                        {user.role === 'subuser' && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Pages: {Object.entries(user.permissions.pages)
                                                    .filter(([_, allowed]) => allowed)
                                                    .map(([page]) => page)
                                                    .join(', ') || 'None'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(user.createdAt)}
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
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by creating a new admin user.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
