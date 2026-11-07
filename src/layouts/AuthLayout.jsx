import { Link, Outlet } from 'react-router-dom'
import Logo from '../components/Logo'

// Split layout for sign up, log in and password screens.
export default function AuthLayout() {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="flex flex-col justify-between gap-6 bg-forest p-6 text-white md:p-12">
        <Link to="/" aria-label="Pathora home"><Logo light /></Link>
        <div>
          <h2 className="text-3xl font-bold">Your next chapter starts here.</h2>
          <p className="mt-2 text-[#cfe0d6]">Understand the job, show your real evidence and move forward with confidence.</p>
        </div>
        <p className="hidden text-sm text-[#cfe0d6] md:block">
          Your career information stays yours. Pathora offers guidance, not guarantees.
        </p>
      </aside>
      <main className="flex items-start justify-center p-6 md:p-10">
        <div className="w-full max-w-sm"><Outlet /></div>
      </main>
    </div>
  )
}
