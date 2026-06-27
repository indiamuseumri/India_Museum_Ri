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
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [inputKey, setInputKey] = useState(0)

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
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files)
    setPreview(files.length === 1 ? URL.createObjectURL(files[0]) : null)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image.')
      return
    }
    if (!isSignedIn) {
      toast.error('Please sign in to perform this action')
      return
    }

    setUploading(true)

    let successCount = 0
    let failCount = 0

    for (const file of selectedFiles) {
      // Validate each file
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png',
        'image/webp', 'image/gif'
      ]
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Skipped ${file.name}: invalid type`)
        failCount++
        continue
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Skipped ${file.name}: exceeds 10MB`)
        failCount++
        continue
      }

      try {
        const fileExt = file.name.split('.').pop()?.toLowerCase()
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        const filePath = `${activeTab}/${uniqueId}.${fileExt}`

        const client = await getClient()

        const { error: uploadError } = await client.storage
          .from('exhibition-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          })

        if (uploadError) throw uploadError

        const { data: urlData } = client.storage
          .from('exhibition-images')
          .getPublicUrl(filePath)

        const publicUrl = urlData?.publicUrl
        if (!publicUrl) throw new Error('No public URL')

        // Use file name (without extension) as title
        const autoTitle = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')

        const { error: dbError } = await client
          .from('exhibition_images')
          .insert([{
            title: autoTitle,
            image_url: publicUrl,
            category: activeTab,
          }])

        if (dbError) throw dbError

        successCount++
      } catch (err: any) {
        console.error('[UPLOAD] Failed:', file.name, err.message)
        failCount++
      }
    }

    setUploading(false)

    if (successCount > 0) {
      toast.success(
        `${successCount} image${successCount > 1 ? 's' : ''} uploaded successfully`
      )
    }
    if (failCount > 0) {
      toast.error(
        `${failCount} file${failCount > 1 ? 's' : ''} failed to upload`
      )
    }

    // Reset state — increment inputKey to force React to remount
    // the file input, fully clearing the browser's file selection
    setSelectedFiles([])
    setPreview(null)
    setInputKey(prev => prev + 1)
    await fetchImages(activeTab)
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
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(245,240,232,0.6)', marginBottom: '6px' }}>Image File *</label>
            <input
              key={inputKey}
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
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
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {/* Preview */}
        {selectedFiles.length > 1 && (
          <p style={{ fontSize: '0.85rem', color: 'rgba(245,240,232,0.5)', marginTop: '0.5rem' }}>
            {selectedFiles.length} images selected
          </p>
        )}
        {selectedFiles.length === 1 && preview && (
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
