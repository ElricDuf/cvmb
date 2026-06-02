import { useEffect } from 'react'
import { useRouter } from 'next/router'

// Redirige vers le tableau de bord par défaut.
export default function AdminIndex() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/questionnaires')
  }, [router])
  return null
}
