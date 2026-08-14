'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { FiUser } from 'react-icons/fi';

interface UserButtonProps {
  appearance?: {
    elements?: {
      avatarBox?: string;
      userButtonTrigger?: string;
    };
  };
}

export default function UserButton({ appearance }: UserButtonProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) {
    return null;
  }

  const userInitial = user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';

  return (
    <button
      onClick={handleSignOut}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        appearance?.elements?.userButtonTrigger || ''
      }`}
      aria-label="Sign out"
      title="Click to sign out"
    >
      <div className={`w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ${
        appearance?.elements?.avatarBox || ''
      }`}>
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName || 'User'}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white font-semibold text-sm">{userInitial}</span>
        )}
      </div>
    </button>
  );
}
