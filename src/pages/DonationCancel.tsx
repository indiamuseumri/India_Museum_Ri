import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DonationCancel() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/?payment=cancelled', { replace: true })
  }, [navigate])

  return null
}
