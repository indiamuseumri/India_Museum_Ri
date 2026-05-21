import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DonationSuccess() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/?payment=success', { replace: true })
  }, [navigate])

  return null
}
