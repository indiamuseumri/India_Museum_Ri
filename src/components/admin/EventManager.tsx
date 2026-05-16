import { useState, useEffect } from 'react'
import { useAuthenticatedSupabase } from '@/hooks/useAuthenticatedSupabase'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

interface EventRow {
  id: string
  title: string
  category: string | null
  date: string
  time: string
  location: string
  description: string
  status: 'OPEN' | 'CLOSED' | 'COMING_SOON'
  image_url: string | null
}

const EMPTY_FORM: Omit<EventRow, 'id'> = {
  title: '',
  category: '',
  date: '',
  time: '',
  location: '',
  description: '',
  status: 'COMING_SOON',
  image_url: '',
}

const ITEMS_PER_PAGE = 10

export default function EventManager() {
  const { getClient, isSignedIn } = useAuthenticatedSupabase()
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error('[EventManager] fetch error:', err)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEvents() }, [])

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (event: EventRow) => {
    setEditingId(event.id)
    setForm({
      title: event.title,
      category: event.category || '',
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      status: event.status,
      image_url: event.image_url || '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.date || !form.time || !form.location || !form.description) {
      toast.error('Please fill in all required fields')
      return
    }
    if (!isSignedIn) {
      toast.error('Please sign in to perform this action')
      return
    }
    setSaving(true)
    try {
      // Format date correctly before inserting
      const formattedDate = new Date(form.date).toISOString().split('T')[0]

      const payload = {
        title: form.title,
        category: form.category || null,
        date: formattedDate,
        time: form.time,
        location: form.location,
        description: form.description,
        status: form.status,
        image_url: form.image_url || null,
      }

      // Use authenticated Supabase client for admin write operations
      const authSupabase = await getClient()

      if (editingId) {
        const { data, error } = await authSupabase.from('events').update(payload).eq('id', editingId)
        if (error) {
          console.error('[EVENTS] Update error:', error)
          console.error('[EVENTS] Error code:', error.code)
          console.error('[EVENTS] Error message:', error.message)
          console.error('[EVENTS] Error details:', error.details)
          console.error('[EVENTS] Error hint:', error.hint)
          if (error.code === '42501') {
            toast.error('Permission denied. Please ensure you are logged in as admin.')
          } else {
            toast.error(`Failed to update event: ${error.message}`)
          }
          return
        }
        toast.success('Event updated successfully')
      } else {
        const { data, error } = await authSupabase.from('events').insert([payload])
        if (error) {
          console.error('[EVENTS] Insert error:', error)
          console.error('[EVENTS] Error code:', error.code)
          console.error('[EVENTS] Error message:', error.message)
          console.error('[EVENTS] Error details:', error.details)
          console.error('[EVENTS] Error hint:', error.hint)
          if (error.code === '42501') {
            toast.error('Permission denied. Please ensure you are logged in as admin.')
          } else if (error.code === '23505') {
            toast.error('An event with this information already exists.')
          } else {
            toast.error(`Failed to save event: ${error.message}`)
          }
          return
        }
        toast.success('Event added successfully')
      }
      setModalOpen(false)
      await fetchEvents()
    } catch (err: unknown) {
      console.error('[EVENTS] Unexpected error:', err)
      const message = err instanceof Error ? err.message : 'Failed to save event'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!isSignedIn) {
      toast.error('Please sign in to perform this action')
      return
    }
    try {
      const authSupabase = await getClient()
      const { error } = await authSupabase.from('events').delete().eq('id', id)
      if (error) {
        console.error('[EVENTS] Delete error:', error)
        console.error('[EVENTS] Error code:', error.code)
        console.error('[EVENTS] Error message:', error.message)
        console.error('[EVENTS] Error details:', error.details)
        console.error('[EVENTS] Error hint:', error.hint)
        if (error.code === '42501') {
          toast.error('Permission denied. Please ensure you are logged in as admin.')
        } else {
          toast.error(`Failed to delete event: ${error.message}`)
        }
        return
      }
      toast.success('Event deleted successfully')
      setDeleteConfirm(null)
      await fetchEvents()
    } catch (err: unknown) {
      console.error('[EVENTS] Unexpected delete error:', err)
      const message = err instanceof Error ? err.message : 'Failed to delete event'
      toast.error(message)
    }
  }

  const toggleStatus = async (id: string, current: string) => {
    if (!isSignedIn) {
      toast.error('Please sign in to perform this action')
      return
    }
    const next = current === 'OPEN' ? 'CLOSED' : current === 'CLOSED' ? 'COMING_SOON' : 'OPEN'
    try {
      const authSupabase = await getClient()
      const { error } = await authSupabase.from('events').update({ status: next }).eq('id', id)
      if (error) {
        console.error('[EVENTS] Toggle error:', error)
        console.error('[EVENTS] Error code:', error.code)
        console.error('[EVENTS] Error message:', error.message)
        console.error('[EVENTS] Error details:', error.details)
        console.error('[EVENTS] Error hint:', error.hint)
        if (error.code === '42501') {
          toast.error('Permission denied. Please ensure you are logged in as admin.')
        } else {
          toast.error(`Failed to update status: ${error.message}`)
        }
        return
      }
      toast.success(`Status changed to ${next}`)
      await fetchEvents()
    } catch (err: unknown) {
      console.error('[EVENTS] Unexpected toggle error:', err)
      const message = err instanceof Error ? err.message : 'Failed to update status'
      toast.error(message)
    }
  }

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE)
  const paged = events.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(0,0,0,0.2)',
    color: '#F5F0E8',
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    OPEN: { bg: 'rgba(45,106,79,0.2)', text: '#40916C' },
    CLOSED: { bg: 'rgba(201,24,74,0.2)', text: '#E8566B' },
    COMING_SOON: { bg: 'rgba(232,135,26,0.2)', text: '#E8871A' },
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: '#F5F0E8', margin: 0 }}>
          Event Manager
        </h2>
        <button
          onClick={openAdd}
          style={{
            background: '#E8871A',
            color: '#FFF',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          + Add Event
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(245,240,232,0.5)' }}>Loading events…</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {['Title', 'Date', 'Time', 'Location', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 8px', textAlign: 'left', color: 'rgba(245,240,232,0.5)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((ev) => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 8px', color: '#F5F0E8', fontWeight: 500 }}>{ev.title}</td>
                    <td style={{ padding: '12px 8px', color: 'rgba(245,240,232,0.7)' }}>{ev.date}</td>
                    <td style={{ padding: '12px 8px', color: 'rgba(245,240,232,0.7)' }}>{ev.time}</td>
                    <td style={{ padding: '12px 8px', color: 'rgba(245,240,232,0.7)' }}>{ev.location}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <button
                        onClick={() => toggleStatus(ev.id, ev.status)}
                        style={{
                          background: statusColors[ev.status]?.bg || 'rgba(255,255,255,0.1)',
                          color: statusColors[ev.status]?.text || '#FFF',
                          border: 'none',
                          padding: '4px 12px',
                          borderRadius: '100px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {ev.status}
                      </button>
                    </td>
                    <td style={{ padding: '12px 8px', display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => openEdit(ev)}
                        style={{ background: 'rgba(255,255,255,0.08)', color: '#F5F0E8', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Edit
                      </button>
                      {deleteConfirm === ev.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(ev.id)}
                            style={{ background: '#C9184A', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{ background: 'rgba(255,255,255,0.08)', color: '#F5F0E8', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(ev.id)}
                          style={{ background: 'rgba(201,24,74,0.15)', color: '#E8566B', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Delete
                        </button>
                      )}
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

      {/* Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: '#151F4A',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#F5F0E8', marginBottom: '1.5rem' }}>
              {editingId ? 'Edit Event' : 'Add Event'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(245,240,232,0.6)', marginBottom: '6px' }}>Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(245,240,232,0.6)', marginBottom: '6px' }}>Category</label>
                <input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(245,240,232,0.6)', marginBottom: '6px' }}>Date *</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(245,240,232,0.6)', marginBottom: '6px' }}>Time *</label>
                  <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="e.g. 5:00 PM – 9:00 PM" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(245,240,232,0.6)', marginBottom: '6px' }}>Location *</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(245,240,232,0.6)', marginBottom: '6px' }}>Description *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(245,240,232,0.6)', marginBottom: '6px' }}>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EventRow['status'] })} style={inputStyle}>
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="COMING_SOON">COMING_SOON</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.08)', color: '#F5F0E8', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: saving ? '#B06A14' : '#E8871A',
                  color: '#FFF',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  cursor: saving ? 'wait' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
