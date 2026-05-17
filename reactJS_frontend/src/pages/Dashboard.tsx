import { useQuery } from '@tanstack/react-query'
import { getSessions } from '../api/sessions'
import { getEsps } from '../api/esps'
import { getKompors } from '../api/kompors'
import type { Session } from '../types/session'

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function SessionRow({ session }: { session: Session }) {
  const isRunning = session.boiling_status === 'running'

  const timeLeft = () => {
    const diff = new Date(session.finished_at).getTime() - Date.now()
    if (diff <= 0) return 'Finished'
    const m = Math.floor(diff / 60000)
    const h = Math.floor(m / 60)
    const mins = m % 60
    return h > 0 ? `${h}h ${mins}m left` : `${mins}m left`
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-300'}`} />
        <div>
          <p className="text-sm font-medium text-gray-700">{session.public_id}</p>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">{session.fabric_type}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          isRunning
            ? 'bg-green-50 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {session.boiling_status}
        </span>
        {isRunning && (
          <p className="text-xs text-gray-400 mt-1">{timeLeft()}</p>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const sessions = useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions,
    refetchInterval: 10000,
  })

  const esps = useQuery({
    queryKey: ['esps'],
    queryFn: getEsps,
  })

  const kompors = useQuery({
    queryKey: ['kompors'],
    queryFn: getKompors,
  })

  const allSessions = sessions.data?.Data ?? []
  const runningSessions = allSessions.filter(s => s.boiling_status === 'boiling')
  const allEsps = esps.data?.Data ?? []
  const allKompors = kompors.data?.Data ?? []

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-400 mt-0.5">Ecoprint boiling monitor</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Active Sessions"
          value={runningSessions.length}
          sub={`${allSessions.length} total`}
        />
        <StatCard
          label="ESP Devices"
          value={allEsps.length}
          sub={`${allEsps.filter(e => e.is_active).length} active`}
        />
        <StatCard
          label="Kompors"
          value={allKompors.length}
          sub={`${allKompors.filter(k => k.is_active).length} active`}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Recent Sessions</h3>
          {sessions.isFetching && (
            <span className="text-xs text-gray-400">Refreshing...</span>
          )}
        </div>

        <div className="px-5">
          {sessions.isLoading && (
            <p className="text-sm text-gray-400 py-6 text-center">Loading sessions...</p>
          )}
          {sessions.isError && (
            <p className="text-sm text-red-400 py-6 text-center">Failed to load sessions</p>
          )}
          {!sessions.isLoading && allSessions.length === 0 && (
            <p className="text-sm text-gray-400 py-6 text-center">No sessions yet</p>
          )}
          {allSessions.map((session) => (
            <SessionRow key={session.public_id} session={session} />
          ))}
        </div>
      </div>

    </div>
  )
}