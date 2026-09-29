'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signIn, signInWithGoogle } from '@/app/actions/auth'
import type { Metadata } from 'next'

// Google Icon SVG
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isGooglePending, startGoogleTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  function handleGoogleSignIn() {
    setError(null)
    startGoogleTransition(async () => {
      const result = await signInWithGoogle()
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="login-page">
      {/* Animated background blobs */}
      <div className="blob blob-1" aria-hidden />
      <div className="blob blob-2" aria-hidden />
      <div className="blob blob-3" aria-hidden />

      <div className="login-card">
        {/* Logo / Brand */}
        <div className="brand">
          <div className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="8" fill="url(#grad)" />
              <path d="M8 20L14 8L20 20M10.5 16H17.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="brand-name">AI Placement</span>
        </div>

        <div className="card-header">
          <h1 className="card-title">Welcome back</h1>
          <p className="card-subtitle">Sign in to your account to continue</p>
        </div>

        {/* Google Sign In */}
        <button
          id="google-signin-btn"
          type="button"
          className="google-btn"
          onClick={handleGoogleSignIn}
          disabled={isGooglePending || isPending}
        >
          {isGooglePending ? (
            <span className="spinner" aria-hidden />
          ) : (
            <GoogleIcon />
          )}
          <span>Continue with Google</span>
        </button>

        <div className="divider">
          <span>or continue with email</span>
        </div>

        {/* Email/Password Form */}
        <form action={handleSubmit} className="auth-form">
          <div className="field-group">
            <label htmlFor="login-email" className="field-label">Email address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="field-input"
              autoComplete="email"
              required
            />
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <label htmlFor="login-password" className="field-label">Password</label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="field-input"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="error-banner" role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 5v4M8 11h.01M1.5 14h13l-6.5-12L1.5 14z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {error}
            </div>
          )}

          <button
            id="email-signin-btn"
            type="submit"
            className="submit-btn"
            disabled={isPending || isGooglePending}
          >
            {isPending ? (
              <>
                <span className="spinner spinner-light" aria-hidden />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="auth-switch-link">
            Create account
          </Link>
        </p>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0f;
          position: relative;
          overflow: hidden;
          padding: 1.5rem;
        }

        /* Animated blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          animation: float 8s ease-in-out infinite;
        }
        .blob-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #6366f1, #8b5cf6);
          top: -150px; left: -150px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #06b6d4, #3b82f6);
          bottom: -100px; right: -100px;
          animation-delay: -3s;
        }
        .blob-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #ec4899, #f43f5e);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -6s;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 10px) scale(0.97); }
        }
        .blob-3 {
          animation-name: float-center;
        }
        @keyframes float-center {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          33% { transform: translate(-45%, -55%) scale(1.05); }
          66% { transform: translate(-55%, -45%) scale(0.97); }
        }

        /* Card */
        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.05),
            0 20px 60px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.1);
          animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Brand */
        .brand {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 2rem;
        }
        .brand-icon {
          flex-shrink: 0;
          display: flex;
          filter: drop-shadow(0 0 12px rgba(99, 102, 241, 0.5));
        }
        .brand-name {
          font-size: 1.0625rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        /* Header */
        .card-header { margin-bottom: 1.75rem; }
        .card-title {
          font-size: 1.625rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.03em;
          margin: 0 0 0.375rem;
        }
        .card-subtitle {
          font-size: 0.9375rem;
          color: rgba(255,255,255,0.45);
          margin: 0;
        }

        /* Google button */
        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: #ffffff;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          letter-spacing: -0.01em;
        }
        .google-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.11);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }
        .google-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .google-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          margin: 1.5rem 0;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .divider span {
          font-size: 0.8125rem;
          color: rgba(255,255,255,0.3);
          white-space: nowrap;
        }

        /* Form fields */
        .auth-form { display: flex; flex-direction: column; gap: 1.125rem; }
        .field-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .field-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .field-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
          letter-spacing: -0.01em;
        }
        .forgot-link {
          font-size: 0.8125rem;
          color: #818cf8;
          text-decoration: none;
          transition: color 0.15s;
        }
        .forgot-link:hover { color: #a5b4fc; }
        .field-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.05);
          color: #ffffff;
          font-size: 0.9375rem;
          font-family: inherit;
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.22); }
        .field-input:focus {
          border-color: rgba(99, 102, 241, 0.6);
          background: rgba(99, 102, 241, 0.08);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .field-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #1a1a2e inset;
          -webkit-text-fill-color: #ffffff;
        }

        /* Error */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
          font-size: 0.875rem;
          animation: shake 0.3s ease;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.8125rem 1.25rem;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #ffffff;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          letter-spacing: -0.01em;
          margin-top: 0.25rem;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(99, 102, 241, 0.5);
          filter: brightness(1.08);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
          filter: brightness(0.96);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Spinner */
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: rgba(255,255,255,0.9);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer */
        .auth-switch {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.4);
        }
        .auth-switch-link {
          color: #818cf8;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.15s;
        }
        .auth-switch-link:hover { color: #a5b4fc; text-decoration: underline; }
      `}</style>
    </div>
  )
}
