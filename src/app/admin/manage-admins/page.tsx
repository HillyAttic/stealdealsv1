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
        if (enabled.length === 4) return 'All pages';
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
                        <h1 className="text-2xl font-bold text-gray-900">Manage Admin Users</h1>
                        <p className="text-gray-600">Create and manage admin accounts with role-based permissions</p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <FaPlus />
                        <span>Create New User</span>
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

                {/* Create User Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
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
                                <AdminUserForm
                                    onSubmit={handleCreateUser}
                                    onCancel={() => {
                                        setShowCreateForm(false);
                                        setError(null);
                                    }}
                                    isLoading={isCreating}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FaUser className="text-blue-600 text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Admin Users</p>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
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
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FaUser className="text-green-600 text-xl" />
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
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Page Access
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Privacy
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
                                                <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <FaUser className="text-gray-600" />
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
                                                {user.role === 'superuser' ? <FaUserShield className="mr-1" /> : <FaUser className="mr-1" />}
                                                {user.role === 'superuser' ? 'Superuser' : 'Subuser'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {user.role === 'superuser' ? (
                                                    <span className="text-purple-600 font-medium">All Pages</span>
                                                ) : (
                                                    <span>{getPagePermissionsSummary(user.permissions.pages)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'superuser' ? (
                                                <span className="text-sm text-purple-600 font-medium">Full Access</span>
                                            ) : (
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center text-xs">
                                                        {user.permissions.viewOthers ? (
                                                            <><FaEye className="text-green-500 mr-1" /> <span className="text-green-700">View Others</span></>
                                                        ) : (
                                                            <><FaEye className="text-gray-400 mr-1" /> <span className="text-gray-500">Own Only</span></>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center text-xs">
                                                        {user.permissions.editOthers ? (
                                                            <><FaEdit className="text-green-500 mr-1" /> <span className="text-green-700">Edit Others</span></>
                                                        ) : (
                                                            <><FaEdit className="text-gray-400 mr-1" /> <span className="text-gray-500">Own Only</span></>
                                                        )}
                                                    </div>
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
                            <FaUser className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No admin users</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by creating a new admin user.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <FaPlus className="mr-2" />
                                    Create New User
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
