import { useNavigate } from 'react-router-dom'

export default function DonationSuccess() {
  const navigate = useNavigate()

  // TODO: Fetch donation details by session_id from Supabase
  // to display exact amount donated
  const params = new URLSearchParams(window.location.search)
  const sessionId = params.get('session_id')

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D1433 0%, #1B2A6B 100%)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '520px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '24px',
          padding: 'clamp(2rem, 6vw, 3.5rem)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        }}
      >
        {/* Animated Checkmark */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2D6A4F, #40916C)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            animation: 'donationPulse 2s ease-in-out infinite',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 600,
            color: '#FFFFFF',
            margin: '0 0 1rem',
          }}
        >
          Thank You for Your Donation!
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'rgba(245,240,232,0.78)',
            margin: '0 0 2rem',
          }}
        >
          Your generosity helps preserve Indian heritage in America.
          {sessionId && (
            <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.85rem', color: 'rgba(245,240,232,0.5)' }}>
              Session: {sessionId.slice(0, 20)}...
            </span>
          )}
        </p>

        <button
          onClick={() => navigate('/')}
          style={{
            background: '#E8871A',
            color: '#FFFFFF',
            border: 'none',
            padding: '14px 36px',
            borderRadius: '100px',
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s ease, transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#D4780F';
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#E8871A';
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          Return to Home
        </button>
      </div>

      <style>{`
        @keyframes donationPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(45,106,79,0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(45,106,79,0); }
        }
      `}</style>
    </div>
  )
}
