import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './app/App.tsx'
import './styles/index.css'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')!).render(
  <ClerkProvider publishableKey={clerkPubKey || 'pk_test_placeholder'}>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFDF8',
            color: '#1C1C1E',
            fontFamily: 'var(--font-body)',
            borderRadius: '12px',
            border: '1px solid rgba(201,168,76,0.2)',
          },
        }}
      />
      <App />
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  </ClerkProvider>
)