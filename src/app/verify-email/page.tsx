"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEnvelope, FaCheckCircle } from "react-icons/fa";
import { useAuth, useUser } from "@/contexts/AuthContext";
import { auth } from "@/lib/auth-client";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { verifyEmail, isLoaded } = useAuth();
  const { user } = useUser();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get("oobCode");
    if (oobCode) {
      handleVerifyCode(oobCode);
    }
  }, []);

  const handleVerifyCode = async (code: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      const { applyActionCode } = await import("firebase/auth");
      await applyActionCode(auth, code);
      setMessage("Email verified successfully!");
      await auth.currentUser?.reload();
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to verify email");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      await verifyEmail();
      setMessage("Verification email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send verification email");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-pulse text-gray-500">Loading...</div></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to verify your email</h2>
          <Link href="/sign-in" className="text-blue-600 hover:text-blue-500">Go to Sign In</Link>
        </div>
      </div>
    );
  }

  const isEmailVerified = (user as any).emailVerified;

  if (isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Email Already Verified</h2>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block">Go to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <FaEnvelope className="mx-auto h-16 w-16 text-blue-500 mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900">Verify Your Email</h2>
          <p className="mt-4 text-sm text-gray-600">We have sent a verification email to <strong>{user.email}</strong></p>
          <p className="mt-2 text-sm text-gray-600">Please check your inbox and click the verification link.</p>
        </div>
        {message && <div className="rounded-md bg-green-50 p-4"><p className="text-sm text-green-800">{message}</p></div>}
        {error && <div className="rounded-md bg-red-50 p-4"><p className="text-sm text-red-800">{error}</p></div>}
        {isVerifying && <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-sm text-gray-600">Verifying your email...</p></div>}
        <div className="flex flex-col space-y-4">
          <button onClick={handleResendVerification} disabled={isLoading} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            {isLoading ? "Sending..." : "Resend Verification Email"}
          </button>
          <Link href="/" className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center">
            Skip for Now
          </Link>
        </div>
      </div>
    </div>
  );
}
