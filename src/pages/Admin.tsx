import { Routes, Route } from 'react-router-dom'
import { useUser, RedirectToSignIn } from '@clerk/clerk-react'
import { isAdminEmail } from '@/lib/adminAuth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminStats from '@/components/admin/AdminStats'
import EventManager from '@/components/admin/EventManager'
import ExhibitionUploader from '@/components/admin/ExhibitionUploader'
import RegistrationsTable from '@/components/admin/RegistrationsTable'
import DonationsTable from '@/components/admin/DonationsTable'

export default function Admin() {
  const { user, isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0D1433',
        }}
      >
        <p style={{ color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>
          Loading…
        </p>
      </div>
    )
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  const email = user?.primaryEmailAddress?.emailAddress
  const authorized = !!user && isAdminEmail(email)

  if (!authorized) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0D1433',
          color: '#F5F0E8',
          fontFamily: 'var(--font-body)',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Access Denied</h1>
        <p style={{ color: '#9CA3AF', marginTop: '0.5rem' }}>
          You are not authorized to view this page.
        </p>
        <a
          href="/"
          style={{
            marginTop: '1rem',
            color: '#C9A84C',
            textDecoration: 'underline',
          }}
        >
          Return to Home
        </a>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D1433' }}>
      <AdminSidebar />
      <main
        style={{
          flex: 1,
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          overflowY: 'auto',
        }}
      >
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<EventManager />} />
          <Route path="exhibitions" element={<ExhibitionUploader />} />
          <Route path="registrations" element={<RegistrationsTable />} />
          <Route path="donations" element={<DonationsTable />} />
        </Routes>
      </main>
    </div>
  )
}

function Dashboard() {
  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 600,
          color: '#F5F0E8',
          margin: '0 0 2rem',
        }}
      >
        Dashboard
      </h1>
      <AdminStats />
    </div>
  )
}
