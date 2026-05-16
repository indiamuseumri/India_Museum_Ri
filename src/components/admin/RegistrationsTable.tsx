import { useState, useEffect } from 'react'
import { useAuthenticatedSupabase } from '@/hooks/useAuthenticatedSupabase'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

interface Registration {
  id: string
  full_name: string
  phone_number: string
  preferred_time: string
  created_at: string
  events?: { title: string } | null
}

const ITEMS_PER_PAGE = 20

export default function RegistrationsTable() {
  const { getClient, isSignedIn, isLoaded } = useAuthenticatedSupabase()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [events, setEvents] = useState<{ id: string; title: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEvent, setFilterEvent] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    const fetchData = async () => {
      try {

        // MUST use authenticated client — registrations has NO public SELECT policy
        const client = await getClient()

        const [regsRes, eventsRes] = await Promise.all([
          client
            .from('registrations')
            .select('*, events(title)')
            .order('created_at', { ascending: false }),
          // Events have public SELECT, but use auth client for consistency in admin panel
          supabase.from('events').select('id, title').order('date', { ascending: true }),
        ])

        if (regsRes.error) {
          console.error('[REGISTRATIONS] Error:', regsRes.error)
          console.error('[REGISTRATIONS] Code:', regsRes.error.code)
          if (regsRes.error.code === '42501') {
            throw new Error(
              'RLS blocked registrations read (42501). ' +
              'Verify registrations SELECT policy allows authenticated.'
            )
          }
          throw regsRes.error
        }
        if (eventsRes.error) throw eventsRes.error

        setRegistrations(regsRes.data || [])
        setEvents(eventsRes.data || [])
      } catch (err) {
        console.error('[REGISTRATIONS] Failed:', err)
        toast.error('Failed to load registrations')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isLoaded, isSignedIn])

  const filtered = registrations.filter((r) => {
    const matchesEvent = !filterEvent || (r as unknown as Record<string, string>).event_id === filterEvent
    const matchesSearch = !search || r.full_name.toLowerCase().includes(search.toLowerCase())
    return matchesEvent && matchesSearch
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  const exportCSV = () => {
    const header = 'Name,Phone,Preferred Time,Event,Date Registered\n'
    const rows = filtered.map((r) =>
      `"${r.full_name}","${r.phone_number}","${r.preferred_time}","${r.events?.title || 'N/A'}","${new Date(r.created_at).toLocaleDateString()}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'registrations.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported')
  }

  // TODO: Add PDF export using jspdf
  // Install: npm install jspdf
  // Generate table as PDF on button click

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: '#F5F0E8', margin: 0 }}>
          Registrations
        </h2>
        <button
          onClick={exportCSV}
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: '#F5F0E8',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          style={{
            flex: '1 1 200px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(0,0,0,0.2)',
            color: '#F5F0E8',
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
          }}
        />
        <select
          value={filterEvent}
          onChange={(e) => { setFilterEvent(e.target.value); setPage(0) }}
          style={{
            flex: '0 1 250px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(0,0,0,0.2)',
            color: '#F5F0E8',
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
          }}
        >
          <option value="">All Events</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(245,240,232,0.5)' }}>Loading…</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {['Name', 'Phone', 'Preferred Time', 'Event', 'Date Registered'].map((h) => (
                    <th key={h} style={{ padding: '12px 8px', textAlign: 'left', color: 'rgba(245,240,232,0.5)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'rgba(245,240,232,0.4)' }}>
                      No registrations found.
                    </td>
                  </tr>
                ) : (
                  paged.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 8px', color: '#F5F0E8', fontWeight: 500 }}>{r.full_name}</td>
                      <td style={{ padding: '12px 8px', color: 'rgba(245,240,232,0.7)' }}>{r.phone_number}</td>
                      <td style={{ padding: '12px 8px', color: 'rgba(245,240,232,0.7)', textTransform: 'capitalize' }}>{r.preferred_time}</td>
                      <td style={{ padding: '12px 8px', color: 'rgba(245,240,232,0.7)' }}>{r.events?.title || 'N/A'}</td>
                      <td style={{ padding: '12px 8px', color: 'rgba(245,240,232,0.7)' }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{ background: 'rgba(255,255,255,0.08)', color: '#F5F0E8', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}
              >
                Prev
              </button>
              <span style={{ color: 'rgba(245,240,232,0.5)', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{ background: 'rgba(255,255,255,0.08)', color: '#F5F0E8', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: page >= totalPages - 1 ? 'default' : 'pointer', opacity: page >= totalPages - 1 ? 0.4 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
