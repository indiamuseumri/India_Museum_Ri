import { useNavigate } from 'react-router-dom'

export default function DonationCancel() {
  const navigate = useNavigate()

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
        {/* Info Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E8871A, #C9184A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            opacity: 0.9,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
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
          Donation Not Completed
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
          Your donation was not completed. No charges have been made.
          If you'd like to try again, you can return to the donation section.
        </p>

        <button
          onClick={() => navigate('/#donate')}
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
          Try Again
        </button>
      </div>
    </div>
  )
}
