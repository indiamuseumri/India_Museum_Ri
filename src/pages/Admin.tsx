import { Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminStats from '@/components/admin/AdminStats'
import EventManager from '@/components/admin/EventManager'
import ExhibitionUploader from '@/components/admin/ExhibitionUploader'
import RegistrationsTable from '@/components/admin/RegistrationsTable'
import DonationsTable from '@/components/admin/DonationsTable'

export default function Admin() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
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
      </SignedIn>
    </>
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
