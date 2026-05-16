import { useState, useEffect, useRef } from 'react'
import { useAuthenticatedSupabase } from '@/hooks/useAuthenticatedSupabase'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { key: 'faith', label: 'Faith' },
  { key: 'art', label: 'Art' },
  { key: 'music', label: 'Music' },
  { key: 'literature', label: 'Literature' },
  { key: 'ethnic', label: 'Ethnic' },
]

interface ExhibitionImage {
  id: string
  title: string
  image_url: string
  category: string
}

export default function ExhibitionUploader() {
  const { getClient, isSignedIn } = useAuthenticatedSupabase()
  const [activeTab, setActiveTab] = useState('faith')
  const [images, setImages] = useState<ExhibitionImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fetchImages = async (cat: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('exhibition_images')
        .select('*')
        .eq('category', cat)
        .order('created_at', { ascending: false })
      if (error) throw error
      setImages(data || [])
    } catch (err) {
      console.error('[ExhibitionUploader] fetch error:', err)
      toast.error('Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages(activeTab)
  }, [activeTab])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!title.trim()) {
      toast.error('Please enter an image title')
      return
    }
    if (!selectedFile) {
      toast.error('Please select an image file')
      return
    }
    if (!isSignedIn) {
      toast.error('Please sign in to perform this action')
      return
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png',
      'image/webp', 'image/gif'
    ]
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, WebP)')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      toast.error('File size must be under 10MB')
      return
    }

    setUploading(true)
    try {
      // Generate unique file path
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase()
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `${activeTab}/${uniqueName}`

      // Use authenticated Supabase client for storage
      const authSupabase = await getClient()

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await authSupabase.storage
        .from('exhibition-images')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: selectedFile.type,
        })

      if (uploadError) {
        console.error('[UPLOAD] Storage error:', uploadError)
        console.error('[UPLOAD] Error message:', uploadError.message)
        console.error('[UPLOAD] Error name:', uploadError.name)
        if (uploadError.message?.includes('security policy')) {
          toast.error('Upload permission denied. Please ensure you are logged in as admin.')
        } else {
          toast.error(`Upload failed: ${uploadError.message}`)
        }
        return
      }

      // Get public URL
      const { data: urlData } = authSupabase.storage
        .from('exhibition-images')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded image')
      }

      // Save to exhibition_images table
      const { data: dbData, error: insertError } = await authSupabase
        .from('exhibition_images')
        .insert([{
          title: title.trim(),
          image_url: publicUrl,
          category: activeTab,
        }])

      if (insertError) {
        console.error('[UPLOAD] DB insert error:', insertError)
        console.error('[UPLOAD] Error code:', insertError.code)
        console.error('[UPLOAD] Error message:', insertError.message)
        console.error('[UPLOAD] Error details:', insertError.details)
        console.error('[UPLOAD] Error hint:', insertError.hint)
        if (insertError.code === '42501') {
          toast.error('Permission denied. Please ensure you are logged in as admin.')
        } else {
          toast.error(`Failed to save image record: ${insertError.message}`)
        }
        return
      }

      toast.success('Image uploaded successfully')
      setTitle('')
      setSelectedFile(null)
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      await fetchImages(activeTab)
    } catch (err: unknown) {
      console.error('[UPLOAD] Unexpected error:', err)
      const message = err instanceof Error ? err.message : 'Failed to upload image'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (img: ExhibitionImage) => {
    if (!isSignedIn) {
      toast.error('Please sign in to perform this action')
      return
    }
    try {

      const authSupabase = await getClient()

      // Extract path from URL for storage deletion
      const urlParts = img.image_url.split('/exhibition-images/')
      const storagePath = urlParts[1] || ''

      if (storagePath) {
        const { error: storageError } = await authSupabase.storage
          .from('exhibition-images')
          .remove([storagePath])

        if (storageError) {
          console.error('[DELETE IMAGE] Storage error:', storageError)
          // Continue to DB deletion even if storage fails
        }
      }

      const { error } = await authSupabase.from('exhibition_images').delete().eq('id', img.id)
      if (error) {
        console.error('[DELETE IMAGE] DB error:', error)
        console.error('[DELETE IMAGE] Error code:', error.code)
        console.error('[DELETE IMAGE] Error message:', error.message)
        console.error('[DELETE IMAGE] Error details:', error.details)
        console.error('[DELETE IMAGE] Error hint:', error.hint)
        if (error.code === '42501') {
          toast.error('Permission denied. Please ensure you are logged in as admin.')
        } else {
          toast.error(`Failed to delete image: ${error.message}`)
        }
        return
      }

      toast.success('Image deleted')
      await fetchImages(activeTab)
    } catch (err: unknown) {
      console.error('[DELETE IMAGE] Unexpected error:', err)
      const message = err instanceof Error ? err.message : 'Failed to delete image'
      toast.error(message)
    }
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: '#F5F0E8', margin: '0 0 1.5rem' }}>
        Exhibition Uploader
      </h2>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            style={{
              background: activeTab === cat.key ? '#E8871A' : 'rgba(255,255,255,0.06)',
              color: activeTab === cat.key ? '#FFF' : 'rgba(245,240,232,0.6)',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '100px',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: activeTab === cat.key ? 600 : 400,
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Upload Form */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(245,240,232,0.6)', marginBottom: '6px' }}>Image Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter image title"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(0,0,0,0.2)',
                color: '#F5F0E8',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
              }}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(245,240,232,0.6)', marginBottom: '6px' }}>Image File *</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(0,0,0,0.2)',
                color: '#F5F0E8',
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
              }}
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              background: uploading ? '#B06A14' : '#E8871A',
              color: '#FFF',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              cursor: uploading ? 'wait' : 'pointer',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            {uploading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
            )}
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ marginTop: '1rem' }}>
            <img
              src={preview}
              alt="Preview"
              style={{ maxHeight: '120px', borderRadius: '8px', objectFit: 'cover' }}
            />
          </div>
        )}
      </div>

      {/* Image Grid */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(245,240,232,0.5)' }}>Loading images…</div>
      ) : images.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(245,240,232,0.5)' }}>
          No images in this category yet.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {images.map((img) => (
            <div
              key={img.id}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <img
                src={img.image_url}
                alt={img.title}
                style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: '0.75rem' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#F5F0E8', margin: '0 0 8px', fontWeight: 500 }}>
                  {img.title}
                </p>
                <button
                  onClick={() => handleDelete(img)}
                  style={{
                    background: 'rgba(201,24,74,0.15)',
                    color: '#E8566B',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
