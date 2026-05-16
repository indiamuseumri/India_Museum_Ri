import { useState, useEffect } from 'react'
import { useAuthenticatedSupabase } from '@/hooks/useAuthenticatedSupabase'
import toast from 'react-hot-toast'

interface Donation {
  id: string
  donor_name: string | null
  donor_email: string | null
  amount: number
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  stripe_session_id: string
  created_at: string
}

const ROWS_PER_PAGE = 20

const STATUS_BADGES: Record<string, { bg: string; text: string }> = {
  SUCCESS: { bg: 'rgba(45,106,79,0.2)', text: '#40916C' },
  PENDING: { bg: 'rgba(232,195,26,0.2)', text: '#C9A84C' },
  FAILED: { bg: 'rgba(201,24,74,0.2)', text: '#E8566B' },
}

export default function DonationsTable() {
  const { getClient, isSignedIn, isLoaded } = useAuthenticatedSupabase()
  const [allDonations, setAllDonations] = useState<Donation[]>([])
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch donations
  const fetchDonations = async () => {
    if (!isSignedIn) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {

      // MUST use authenticated client — donations has NO public SELECT policy
      const client = await getClient()

      const { data, error: fetchError } = await client
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('[DONATIONS] Fetch error:', fetchError)
        console.error('[DONATIONS] Error code:', fetchError.code)
        console.error('[DONATIONS] Error message:', fetchError.message)
        console.error('[DONATIONS] Error details:', fetchError.details)
        if (fetchError.code === '42501') {
          throw new Error(
            'RLS blocked donations read (42501). ' +
            'Verify donations SELECT policy allows authenticated.'
          )
        }
        throw fetchError
      }

      setAllDonations(data || [])
    } catch (err: unknown) {
      const e = err as { message?: string }
      console.error('[DONATIONS] Failed:', err)
      setError(e.message || 'Failed to load donations')
      toast.error('Failed to load donations. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) fetchDonations()
  }, [isLoaded, isSignedIn])

  // Filter and search logic
  useEffect(() => {
    let result = [...allDonations]

    // Apply status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(d => d.status === statusFilter)
    }

    // Apply search filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim()
      result = result.filter(d =>
        d.donor_email?.toLowerCase().includes(q) ||
        d.donor_name?.toLowerCase().includes(q)
      )
    }

    setFilteredDonations(result)
    setCurrentPage(1) // Reset to page 1 on filter change
  }, [statusFilter, debouncedSearch, allDonations])

  // Computed stats (always from full dataset)
  const totalRaised = allDonations
    .filter(d => d.status === 'SUCCESS')
    .reduce((sum, d) => sum + Number(d.amount), 0)

  const successCount = allDonations.filter(d => d.status === 'SUCCESS').length
  const pendingCount = allDonations.filter(d => d.status === 'PENDING').length
  const failedCount = allDonations.filter(d => d.status === 'FAILED').length

  // Pagination
  const totalPages = Math.ceil(filteredDonations.length / ROWS_PER_PAGE)
  const paginatedDonations = filteredDonations.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  )
  const rangeStart = filteredDonations.length > 0 ? (currentPage - 1) * ROWS_PER_PAGE + 1 : 0
  const rangeEnd = Math.min(currentPage * ROWS_PER_PAGE, filteredDonations.length)

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDonations()
    setRefreshing(false)
    toast.success('Donations refreshed')
  }

  // Copy session ID
  const copySessionId = (sessionId: string) => {
    navigator.clipboard.writeText(sessionId)
    toast.success('Session ID copied')
  }

  // CSV export
  const exportCSV = () => {
    const headers = [
      'Donor Name',
      'Email',
      'Amount',
      'Status',
      'Stripe Session ID',
      'Date',
    ]

    const rows = filteredDonations.map(d => [
      d.donor_name || '',
      d.donor_email || '',
      Number(d.amount).toFixed(2),
      d.status,
      d.stripe_session_id || '',
      d.created_at ? new Date(d.created_at).toLocaleString() : '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(r =>
        r.map(cell =>
          `"${String(cell).replace(/"/g, '""')}"`
        ).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `donations-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast.success('CSV exported successfully')
  }

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('ALL')
    setSearchQuery('')
    setDebouncedSearch('')
  }

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }) + ' at ' + d.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    })
  }

  // --- RENDER ---
  return (
    <div>
      {/* Header with Export + Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: '#F5F0E8', margin: 0 }}>
          Donations
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#F5F0E8',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              cursor: refreshing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ animation: refreshing ? 'donationSpin 1s linear infinite' : 'none' }}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button
            onClick={exportCSV}
            disabled={isLoading}
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
      </div>

      {/* Summary Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Total Raised */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(232,135,26,0.15), rgba(201,168,76,0.1))',
          border: '1px solid rgba(232,135,26,0.25)',
          borderRadius: '12px',
          padding: '1.25rem',
        }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'rgba(245,240,232,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Total Donations Received
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: '#E8871A' }}>
            ${totalRaised.toFixed(2)}
          </div>
        </div>
        {/* Successful */}
        <div style={{
          background: 'rgba(45,106,79,0.1)',
          border: '1px solid rgba(45,106,79,0.25)',
          borderRadius: '12px',
          padding: '1.25rem',
        }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'rgba(245,240,232,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Successful Payments
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: '#40916C' }}>
            {successCount}
          </div>
        </div>
        {/* Pending */}
        <div style={{
          background: 'rgba(232,195,26,0.08)',
          border: '1px solid rgba(232,195,26,0.2)',
          borderRadius: '12px',
          padding: '1.25rem',
        }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'rgba(245,240,232,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Pending Payments
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: '#C9A84C' }}>
            {pendingCount}
          </div>
        </div>
        {/* Failed */}
        <div style={{
          background: 'rgba(201,24,74,0.08)',
          border: '1px solid rgba(201,24,74,0.2)',
          borderRadius: '12px',
          padding: '1.25rem',
        }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'rgba(245,240,232,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Failed Payments
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: '#E8566B' }}>
            {failedCount}
          </div>
        </div>
      </div>

      {/* Search + Status Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search by email or donor name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading}
          style={{
            flex: '1 1 250px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(0,0,0,0.2)',
            color: '#F5F0E8',
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
          }}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['ALL', 'SUCCESS', 'PENDING', 'FAILED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              disabled={isLoading}
              style={{
                background: statusFilter === s ? '#E8871A' : 'rgba(255,255,255,0.06)',
                color: statusFilter === s ? '#FFF' : 'rgba(245,240,232,0.6)',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '100px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                fontWeight: statusFilter === s ? 600 : 400,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'rgba(245,240,232,0.45)', marginBottom: '0.75rem' }}>
          Showing {rangeStart}–{rangeEnd} of {filteredDonations.length} donations
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading ? (
        <div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1.5fr 0.8fr 0.8fr 1.5fr 1.5fr',
                gap: '8px',
                padding: '14px 8px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <div
                  key={j}
                  style={{
                    height: '14px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.06)',
                    animation: 'donationPulse 1.5s ease-in-out infinite',
                    animationDelay: `${j * 100}ms`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error state */
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'rgba(245,240,232,0.6)', marginBottom: '1rem' }}>
            {error}
          </p>
          <button
            onClick={fetchDonations}
            style={{
              background: '#E8871A',
              color: '#FFF',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      ) : allDonations.length === 0 ? (
        /* Empty state — no donations at all */
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💝</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>
            No donations yet
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(245,240,232,0.5)' }}>
            Donations will appear here after the first successful payment.
          </p>
        </div>
      ) : filteredDonations.length === 0 ? (
        /* No results from filter/search */
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>
            No donations match your search
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(245,240,232,0.5)', marginBottom: '1rem' }}>
            Try adjusting your filters or search query.
          </p>
          <button
            onClick={clearFilters}
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#F5F0E8',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '8px 20px',
              borderRadius: '8px',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Data table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {['Donor Name', 'Email', 'Amount', 'Status', 'Session ID', 'Date'].map((h) => (
                    <th key={h} style={{ padding: '12px 8px', textAlign: 'left', color: 'rgba(245,240,232,0.5)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedDonations.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 8px', color: '#F5F0E8', fontWeight: 500 }}>
                      {d.donor_name || '—'}
                    </td>
                    <td style={{ padding: '12px 8px', color: 'rgba(245,240,232,0.7)' }}>
                      {d.donor_email || '—'}
                    </td>
                    <td style={{ padding: '12px 8px', color: '#F5F0E8', fontWeight: 600 }}>
                      ${Number(d.amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span
                        style={{
                          background: STATUS_BADGES[d.status]?.bg || 'rgba(255,255,255,0.1)',
                          color: STATUS_BADGES[d.status]?.text || '#FFF',
                          padding: '3px 10px',
                          borderRadius: '100px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'rgba(245,240,232,0.5)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                          {d.stripe_session_id ? d.stripe_session_id.slice(0, 20) + '...' : '—'}
                        </span>
                        {d.stripe_session_id && (
                          <button
                            onClick={() => copySessionId(d.stripe_session_id)}
                            title="Copy Session ID"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'rgba(245,240,232,0.4)',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'color 0.2s ease',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#E8871A' }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(245,240,232,0.4)' }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', color: 'rgba(245,240,232,0.7)', fontSize: '0.8rem' }}>
                      {formatDate(d.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ background: 'rgba(255,255,255,0.08)', color: '#F5F0E8', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
              >
                Previous
              </button>
              <span style={{ color: 'rgba(245,240,232,0.5)', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                style={{ background: 'rgba(255,255,255,0.08)', color: '#F5F0E8', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: currentPage >= totalPages ? 'default' : 'pointer', opacity: currentPage >= totalPages ? 0.4 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes donationPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes donationSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
