import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split('@')[0] ??
    'there'

  const email = user?.email ?? ''
  const provider = user?.app_metadata?.provider ?? 'email'

  const stats = [
    { label: 'Applications', value: '0', icon: '📋', color: '#6366f1' },
    { label: 'Interviews', value: '0', icon: '🎯', color: '#06b6d4' },
    { label: 'Offers', value: '0', icon: '🏆', color: '#10b981' },
    { label: 'Profile Score', value: '—', icon: '✨', color: '#f59e0b' },
  ]

  return (
    <div className="dash-page">
      {/* Welcome Hero */}
      <div className="welcome-section">
        <div className="welcome-badge">
          <span className="welcome-dot" aria-hidden />
          Account active
        </div>
        <h1 className="welcome-title">
          Welcome back, <span className="welcome-name">{displayName}</span>! 👋
        </h1>
        <p className="welcome-sub">
          Your AI-powered placement dashboard is ready. Start by completing your profile.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Account Card */}
      <div className="account-card">
        <div className="account-card-header">
          <h2 className="account-card-title">Account Details</h2>
          <span className="account-card-badge">Active</span>
        </div>
        <div className="account-rows">
          <div className="account-row">
            <span className="account-row-label">Email</span>
            <span className="account-row-value">{email}</span>
          </div>
          <div className="account-row">
            <span className="account-row-label">Sign-in method</span>
            <span className="account-row-value account-provider">
              {provider === 'google' ? (
                <>
                  <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <rect x="1" y="1" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M4.5 7h5M7 4.5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  Email & Password
                </>
              )}
            </span>
          </div>
          <div className="account-row">
            <span className="account-row-label">User ID</span>
            <span className="account-row-value account-id">{user?.id}</span>
          </div>
        </div>
      </div>

      {/* CTA card */}
      <div className="cta-card">
        <div className="cta-content">
          <h3 className="cta-title">Complete your profile</h3>
          <p className="cta-desc">
            Add your skills, experience, and resume to unlock AI-powered job matches.
          </p>
        </div>
        <button id="complete-profile-btn" className="cta-btn" disabled>
          Get started
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <style>{`
        .dash-page {
          display: flex; flex-direction: column; gap: 1.75rem;
          animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Welcome */
        .welcome-section { display: flex; flex-direction: column; gap: 0.5rem; }
        .welcome-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.8125rem; font-weight: 500;
          color: #34d399; width: fit-content;
        }
        .welcome-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          animation: pulse-dot 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.5); }
          50% { box-shadow: 0 0 0 5px rgba(52,211,153,0); }
        }
        .welcome-title {
          font-size: 2rem; font-weight: 800;
          color: #fff; letter-spacing: -0.04em; margin: 0;
          line-height: 1.15;
        }
        .welcome-name {
          background: linear-gradient(135deg, #818cf8, #c084fc);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .welcome-sub {
          font-size: 1rem; color: rgba(255,255,255,0.45); margin: 0;
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }
        .stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.375rem 1.25rem;
          display: flex; flex-direction: column; gap: 0.625rem;
          transition: all 0.2s;
        }
        .stat-card:hover {
          background: rgba(255,255,255,0.07);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .stat-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.125rem;
        }
        .stat-value {
          font-size: 1.75rem; font-weight: 800; color: #fff;
          letter-spacing: -0.04em;
        }
        .stat-label {
          font-size: 0.875rem; color: rgba(255,255,255,0.45); font-weight: 500;
        }

        /* Account card */
        .account-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
        }
        .account-card-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .account-card-title {
          font-size: 1rem; font-weight: 600; color: #fff; margin: 0;
        }
        .account-card-badge {
          font-size: 0.75rem; font-weight: 600;
          color: #34d399;
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 999px;
          padding: 0.2rem 0.625rem;
        }
        .account-rows { display: flex; flex-direction: column; }
        .account-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.5rem; gap: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .account-row:last-child { border-bottom: none; }
        .account-row-label {
          font-size: 0.875rem; color: rgba(255,255,255,0.4); flex-shrink: 0;
        }
        .account-row-value {
          font-size: 0.9rem; color: rgba(255,255,255,0.8);
          text-align: right; font-weight: 500;
        }
        .account-provider {
          display: flex; align-items: center; gap: 0.375rem;
        }
        .account-id {
          font-family: monospace; font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
          overflow: hidden; text-overflow: ellipsis;
          max-width: 280px;
        }

        /* CTA */
        .cta-card {
          background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; flex-wrap: wrap;
        }
        .cta-content { display: flex; flex-direction: column; gap: 0.25rem; }
        .cta-title {
          font-size: 1.0625rem; font-weight: 700; color: #fff; margin: 0;
        }
        .cta-desc {
          font-size: 0.9rem; color: rgba(255,255,255,0.5); margin: 0;
        }
        .cta-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.65rem 1.25rem; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; font-size: 0.9rem; font-weight: 600;
          border: none; cursor: pointer; font-family: inherit;
          transition: all 0.2s; white-space: nowrap;
          box-shadow: 0 4px 16px rgba(99,102,241,0.3);
        }
        .cta-btn:hover:not(:disabled) {
          filter: brightness(1.1); transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.4);
        }
        .cta-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  )
}
