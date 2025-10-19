import { redirect } from 'next/navigation'

export default function Home() {
  // Skip login - go directly to dashboard
  redirect('/dashboard')
}
