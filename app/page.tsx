import { redirect } from 'next/navigation'

export default function Home() {
  // proxy.ts will redirect authenticated users to /dashboard,
  // so unauthenticated users landing here go to /login.
  redirect('/login')
}
