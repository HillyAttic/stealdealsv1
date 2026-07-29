'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AdminUserForm } from '@/components/admin/AdminUserForm';
import { FaUser, FaUserShield, FaPlus, FaTimes, FaCheck, FaEye, FaEdit } from 'react-icons/fa';
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

export default function ManageAdminsPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchUsers = async () => {
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

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (userData: CreateUserRequest) => {
        try {
            setIsCreating(true);
            setError(null);

            const response = await fetch('/api/admin/firebase-users', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to create user');
            }

            setSuccessMessage(`User ${userData.email} created successfully!`);
            setShowCreateForm(false);

            // Refresh user list
            await fetchUsers();

            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err) {
            console.error('Error creating user:', err);
            setError(err instanceof Error ? err.message : 'Failed to create user');
        } finally {
            setIsCreating(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getPagePermissionsSummary = (pages: AdminUser['permissions']['pages']) => {
        const enabled = Object.entries(pages)
            .filter(([_, value]) => value)
            .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

        if (enabled.length === 0) return 'No pages';
        if (enabled.length === 9) return 'All pages';
        return enabled.join(', ');
    };

    if (isLoading && users.length === 0) {
        return (
            <AdminLayout>
                <LoadingSpinner message="Loading admin users..." />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Firebase Admin User Management</h1>
                        <p className="text-gray-600">Manage admin users with role-based permissions</p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <FaPlus className="mr-2" />
                        {showCreateForm ? 'Cancel' : 'Create New Admin'}
                    </button>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center">
                        <FaCheck className="text-green-500 mr-3" />
                        <p>{successMessage}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <ErrorMessage
                        message={error}
                        onRetry={fetchUsers}
                    />
                )}

                {/* Create User Form - Inline */}
                {showCreateForm && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Create New Admin User</h2>
                            <button
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setError(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center">
                                <FaCheck className="mr-2" />
                                {successMessage}
                            </div>
                        )}
                        
                        <AdminUserForm
                            onSubmit={handleCreateUser}
                            onCancel={() => {
                                setShowCreateForm(false);
                                setError(null);
                            }}
                            isLoading={isCreating}
                        />
                    </div>
                )}

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

                {/* Users Table */}
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
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'superuser'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {user.role === 'superuser' ? 'Superuser' : 'Subuser'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {user.role === 'superuser' ? (
                                                    <span className="text-purple-600 font-medium">Full Access</span>
                                                ) : (
                                                    <>
                                                        <span>{getPagePermissionsSummary(user.permissions.pages)}</span>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Pages: {Object.entries(user.permissions.pages)
                                                                .filter(([_, allowed]) => allowed)
                                                                .map(([page]) => page)
                                                                .join(', ') || 'None'}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
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
        </AdminLayout>
    );
}
