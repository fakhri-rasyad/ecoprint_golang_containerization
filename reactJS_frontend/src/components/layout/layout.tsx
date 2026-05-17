import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import { ToastContainer } from '../ui/Toast'

const navItems = [
  { label: 'Dashboard', path: '/', icon: '▦' },
  { label: 'Sessions', path: '/sessions', icon: '◎' },
  { label: 'Devices', path: '/devices', icon: '⬡' },
  { label: 'Kompors', path: '/kompors', icon: '◈' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { username, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const { toasts, removeToast } = useToastStore()

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-52 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-gray-200">
          <h1 className="text-base font-bold text-green-600">🌿 Ecoprint</h1>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{username}</p>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span>⇢</span>
            Logout
          </button>
        </div>

      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}