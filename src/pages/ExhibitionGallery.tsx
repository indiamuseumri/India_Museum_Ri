import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  faith: 'Faith & Philosophy',
  art: 'Art & Architecture',
  music: 'Music & Dance',
  literature: 'Literature & Languages',
  ethnic: 'Ethnic Traditions',
}

interface ExhibitionImage {
  id: string
  title: string
  image_url: string
  category: string
}

export default function ExhibitionGallery() {
  const { category } = useParams<{ category: string }>()
  const navigate = useNavigate()
  const [images, setImages] = useState<ExhibitionImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const displayName = category ? CATEGORY_DISPLAY_NAMES[category] || category : 'Exhibition'

  useEffect(() => {
    document.title = `${displayName} — India Museum & Heritage Society of RI`
  }, [displayName])

  const fetchImages = async () => {
    if (!category) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('exhibition_images')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setImages(data || [])
    } catch (err) {
      console.error('[Exhibition Gallery] Fetch error:', err)
      setError('Failed to load exhibition images.')
      toast.error('Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [category])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [selectedImage])

  const handleBack = () => {
    navigate('/')
    setTimeout(() => {
      const el = document.getElementById('exhibitions')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0D1433',
        padding: 'clamp(1.5rem, 5vw, 4rem)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Back button */}
        <button
          onClick={handleBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(245,240,232,0.7)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 0',
            marginBottom: '2rem',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#E8871A' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(245,240,232,0.7)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Exhibitions
        </button>

        {/* Header */}
        <div style={{ marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-overline)',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#E8871A',
              marginBottom: '12px',
            }}
          >
            Exhibition
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
              fontWeight: 600,
              color: '#F5F0E8',
              margin: 0,
            }}
          >
            {displayName}
          </h1>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(232,135,26,0.2)',
                borderTopColor: '#E8871A',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'rgba(245,240,232,0.7)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{error}</p>
            <button
              onClick={fetchImages}
              style={{
                background: '#E8871A',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '100px',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && images.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'rgba(245,240,232,0.6)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
            <p style={{ fontSize: '1.1rem' }}>
              No exhibits uploaded yet. Check back soon.
            </p>
          </div>
        )}

        {/* Image grid */}
        {!loading && !error && images.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
              gap: 'clamp(1rem, 2.5vw, 1.5rem)',
            }}
          >
            {images.map((img) => (
              <ExhibitionCard key={img.id} image={img} onImageClick={() => setSelectedImage(img.image_url)} />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        >
          <img
            src={selectedImage}
            alt="Exhibition image full view"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-sm shadow-2xl"
          />
          <button
            onClick={() => setSelectedImage(null)}
            aria-label="Close image viewer"
            className="absolute top-6 right-6 text-white text-3xl font-bold leading-none hover:scale-110 hover:text-gray-300 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

function ExhibitionCard({ image, onImageClick }: { image: ExhibitionImage; onImageClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: hovered
          ? '0 8px 32px rgba(0,0,0,0.4)'
          : '0 2px 12px rgba(0,0,0,0.2)',
        aspectRatio: '4/3',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onImageClick}
    >
      <img
        src={image.image_url}
        alt={image.title}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      {/* Title overlay on hover */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1.5rem 1rem 1rem',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#FFFFFF',
            margin: 0,
          }}
        >
          {image.title}
        </p>
      </div>
    </div>
  )
}
