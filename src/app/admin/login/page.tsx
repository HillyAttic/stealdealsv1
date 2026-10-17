"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import ClientOnly from '@/components/ClientOnly';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';

const auth = getAuth(app);

declare global {
  interface Window {
    __cleanBitdefenderAttributes?: () => void;
  }
}

const hair = { vectorEffect: 'non-scaling-stroke' } as const;

export default function AdminLogin() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-[#F1F3F5] flex items-center justify-center">
          <p className="text-[13.5px] text-[#5A7183]">Loading…</p>
        </div>
      }
    >
      <AdminLoginContent />
    </ClientOnly>
  );
}

/**
 * Elevation of a commercial building: a retail podium under ten office floors.
 * Three of the eight ground-floor units are filled - the ones already leased,
 * which is the inventory this panel manages.
 */
function BlockElevation() {
  return (
    <svg
      viewBox="0 0 600 420"
      fill="none"
      role="img"
      aria-label="Elevation drawing of a commercial building with ten office floors above a retail podium, three ground-floor units leased"
      className="w-full max-w-[680px] h-auto"
    >
      <defs>
        <clipPath id="sd-sheet-reveal">
          <rect className="sd-wipe" x="0" y="0" width="600" height="420" />
        </clipPath>
      </defs>

      <g clipPath="url(#sd-sheet-reveal)">
        <line x1="20" y1="380" x2="580" y2="380" stroke="#0D2E43" strokeOpacity="0.35" {...hair} />

        {/* three masses: retail podium, office shaft, setback block + roof slab */}
        <line x1="104" y1="60" x2="504" y2="60" stroke="#33A1E0" strokeOpacity="0.5" {...hair} />
        <rect x="104" y="68" width="400" height="52" stroke="#33A1E0" strokeOpacity="0.85" {...hair} />
        <rect x="64" y="120" width="480" height="208" stroke="#33A1E0" strokeOpacity="0.85" {...hair} />
        <rect x="64" y="328" width="480" height="52" stroke="#33A1E0" strokeOpacity="0.85" {...hair} />

        {/* floor plates */}
        {[302, 276, 250, 224, 198, 172, 146].map((y) => (
          <line key={y} x1="64" y1={y} x2="544" y2={y} stroke="#33A1E0" strokeOpacity="0.5" {...hair} />
        ))}
        <line x1="104" y1="94" x2="504" y2="94" stroke="#33A1E0" strokeOpacity="0.5" {...hair} />

        {/* structural bays */}
        {[160, 256, 352, 448].map((x) => (
          <line key={x} x1={x} y1="120" x2={x} y2="380" stroke="#33A1E0" strokeOpacity="0.2" {...hair} />
        ))}
        {[204, 304, 404].map((x) => (
          <line key={x} x1={x} y1="68" x2={x} y2="120" stroke="#33A1E0" strokeOpacity="0.2" {...hair} />
        ))}

        <g className="sd-lease" fill="#0D2E43">
          <rect x="64" y="328" width="96" height="52" />
          <rect x="160" y="328" width="96" height="52" />
        </g>

        {/* height dimension */}
        <g stroke="#0D2E43" strokeOpacity="0.28" {...hair}>
          <line x1="44" y1="68" x2="44" y2="380" />
          <line x1="38" y1="68" x2="50" y2="68" />
          <line x1="38" y1="380" x2="50" y2="380" />
        </g>
      </g>
    </svg>
  );
}

function AdminLoginContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if already logged in
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__cleanBitdefenderAttributes) {
      window.__cleanBitdefenderAttributes();
    }

    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          router.push('/admin/dashboard');
        }
      } catch {
        // Not logged in, stay on login page
      }
    };

    checkLoginStatus();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : name === 'email' ? value.toLowerCase() : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cookieExpiry = formData.rememberMe ? 30 : 1; // 30 days or 1 day
    // Mobile keyboards and autofill append trailing spaces; Firebase rejects those
    // with auth/invalid-email. Passwords are never trimmed - a space can be intentional.
    const email = formData.email.trim().toLowerCase();

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, formData.password);
      const idToken = await userCredential.user.getIdToken();

      const response = await fetch('/api/auth/verify-firebase-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          idToken,
          adminLogin: true,
          rememberMe: formData.rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Set client-readable cookies
      if (data.user) {
        Cookies.set('adminUser', JSON.stringify(data.user), {
          expires: cookieExpiry,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
      }

      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 400);
    } catch (err: any) {
      // If Firebase auth fails, try env var fallback
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        try {
          const envResponse = await fetch('/api/auth/verify-firebase-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              email,
              password: formData.password,
              rememberMe: formData.rememberMe,
            }),
          });

          const envData = await envResponse.json();

          if (envResponse.ok && envData.success) {
            if (envData.user) {
              Cookies.set('adminUser', JSON.stringify(envData.user), {
                expires: cookieExpiry,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
              });
            }
            setTimeout(() => { router.push('/admin/dashboard'); }, 400);
            return;
          } else {
            setError(envData.error || 'Invalid email or password');
            return;
          }
        } catch {
          // Fall through
        }
      }

      let errorMessage = 'Authentication failed';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'That email address is not valid. Check for stray spaces or missing characters.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .sd-wipe {
          transform-origin: left center;
          animation: sd-wipe 900ms cubic-bezier(.33,0,.15,1) 120ms both;
        }
        @keyframes sd-wipe {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .sd-lease {
          opacity: 0;
          animation: sd-lease 420ms ease-out 780ms both;
        }
        @keyframes sd-lease {
          from { opacity: 0; }
          to   { opacity: .9; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sd-wipe, .sd-lease { animation: none; }
          .sd-lease { opacity: .9; }
        }
      `}</style>

      <div className="flex min-h-screen justify-center bg-[#F1F3F5] text-[#0D2E43]">
        <div className="relative flex min-h-screen w-full max-w-[1320px] flex-col">
          {/* Drawing sheet frame */}
          <div className="pointer-events-none absolute inset-4 border border-[rgba(13,46,67,0.14)]" />

          <div className="relative flex flex-1 flex-col px-8 py-8 sm:px-12 sm:py-12 lg:px-20 lg:py-16">
            <p className="text-[15px] font-semibold tracking-[-0.01em]">Stealdeals</p>

            <div className="grid flex-1 items-center gap-12 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-20">
              <div className="hidden lg:block">
                <BlockElevation />
              </div>

              <div className="w-full max-w-[360px] mx-auto lg:mx-0">
                <h1 className="text-[30px] font-medium leading-[1.15] tracking-[-0.02em]">
                  Admin sign-in
                </h1>
                <p className="mt-2.5 text-[15px] leading-relaxed text-[#5A7183]">
                  Use your work email to manage properties, franchise and pre-leased listings.
                </p>

                {error && (
                  <p
                    role="alert"
                    className="mt-6 border-l-2 border-[#A02B21] bg-[#A02B21]/[0.06] px-3.5 py-3 text-[13.5px] leading-snug text-[#7E2119]"
                  >
                    {error}
                  </p>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-[13px] font-medium text-[#3C566B]">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@stealdeals.com"
                      className="mt-2 block h-11 w-full rounded border border-[rgba(13,46,67,0.18)] bg-white px-3.5 text-[15px] text-[#0D2E43] outline-none transition-colors placeholder:text-[#9AAAB8] hover:border-[rgba(13,46,67,0.32)] focus:border-[#0D2E43] focus:ring-2 focus:ring-[#33A1E0]/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-[13px] font-medium text-[#3C566B]">
                      Password
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="block h-11 w-full rounded border border-[rgba(13,46,67,0.18)] bg-white pl-3.5 pr-[68px] text-[15px] text-[#0D2E43] outline-none transition-colors hover:border-[rgba(13,46,67,0.32)] focus:border-[#0D2E43] focus:ring-2 focus:ring-[#33A1E0]/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute inset-y-0 right-0 rounded-r px-3.5 text-[13px] font-medium text-[#5A7183] transition-colors hover:text-[#0D2E43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#33A1E0]"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[13.5px] text-[#3C566B]">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 accent-[#0D2E43]"
                    />
                    Keep me signed in for 30 days
                  </label>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="h-11 w-full rounded bg-[#0D2E43] text-[14px] font-medium text-white transition-colors hover:bg-[#154D71] disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#33A1E0]"
                  >
                    {isLoading ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>

                <p className="mt-8 text-[13.5px]">
                  <Link
                    href="/"
                    className="rounded-sm text-[#5A7183] underline decoration-[rgba(13,46,67,0.25)] underline-offset-4 transition-colors hover:text-[#0D2E43] hover:decoration-[#0D2E43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#33A1E0]"
                  >
                    Back to stealdeals.com
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
