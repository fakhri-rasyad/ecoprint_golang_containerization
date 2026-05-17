import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSessionById } from '../api/sessions'
import { useWebSocket } from '../hooks/useWebSocket'
import { useSessionStore } from '../store/sessionStore'
import { useCountdown } from '../hooks/useCountdown'

function TelemetryCard({
  label,
  value,
  unit,
  color,
}: {
  label: string
  value: number | null
  unit: string
  color: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-3xl font-semibold ${color}`}>
        {value !== null ? value.toFixed(1) : '—'}
        <span className="text-base font-normal text-gray-400 ml-1">{unit}</span>
      </p>
    </div>
  )
}

function CountdownTimer({ finishedAt }: { finishedAt: string }) {
  const timeLeft = useCountdown(finishedAt)

  if (!timeLeft) return (
    <span className="text-red-500 text-sm font-medium">Time's up</span>
  )

  return (
    <div className="flex items-center gap-1.5">
      {timeLeft.hours > 0 && (
        <span className="text-sm font-medium text-gray-700">
          {String(timeLeft.hours).padStart(2, '0')}
          <span className="text-gray-400 text-xs ml-0.5">h</span>
        </span>
      )}
      <span className="text-sm font-medium text-gray-700">
        {String(timeLeft.minutes).padStart(2, '0')}
        <span className="text-gray-400 text-xs ml-0.5">m</span>
      </span>
      <span className="text-sm font-medium text-gray-700">
        {String(timeLeft.seconds).padStart(2, '0')}
        <span className="text-gray-400 text-xs ml-0.5">s</span>
      </span>
    </div>
  )
}
export default function SessionLive() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { readings, isFinished, addReading, setFinished, reset } = useSessionStore()

  useEffect(() => {
    reset()
  }, [id])

  const session = useQuery({
    queryKey: ['session', id],
    queryFn: () => getSessionById(id!),
    enabled: !!id,
  })

  useWebSocket(id!, {
    onMessage: (data) => {
      if ('air_temp' in data) {
        addReading(data)
      }
    },
    onFinished: () => {
      setFinished()
    },
  })

  const latest = readings[readings.length - 1] ?? null

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Live Session</h2>
          <p className="text-sm text-gray-400 font-mono mt-0.5">{id}</p>
        </div>
        <div className="flex items-center gap-3">
          {session.data?.Data.finished_at && !isFinished && (
            <CountdownTimer finishedAt={session.data.Data.finished_at} />
          )}
          {!isFinished ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          ) : (
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              Finished
            </span>
          )}
        </div>
      </div>

      {isFinished && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-700">Session completed!</p>
            <p className="text-xs text-green-600 mt-0.5">The boiling process has finished.</p>
          </div>
          <button
            onClick={() => navigate(`/sessions/${id}/history`)}
            className="text-sm font-medium text-green-700 hover:text-green-900 bg-white border border-green-200 px-4 py-2 rounded-lg transition-colors"
          >
            View History →
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <TelemetryCard
          label="Water Temperature"
          value={latest?.water_temp ?? null}
          unit="°C"
          color="text-blue-600"
        />
        <TelemetryCard
          label="Air Temperature"
          value={latest?.air_temp ?? null}
          unit="°C"
          color="text-orange-500"
        />
        <TelemetryCard
          label="Humidity"
          value={latest?.humidity ?? null}
          unit="%"
          color="text-purple-600"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Readings Log</h3>
          <span className="text-xs text-gray-400">{readings.length} readings</span>
        </div>
        <div className="overflow-y-auto max-h-72">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-gray-100">
                <th className="px-5 py-2 text-xs font-medium text-gray-400 text-left">#</th>
                <th className="px-5 py-2 text-xs font-medium text-gray-400 text-left">Water °C</th>
                <th className="px-5 py-2 text-xs font-medium text-gray-400 text-left">Air °C</th>
                <th className="px-5 py-2 text-xs font-medium text-gray-400 text-left">Humidity %</th>
              </tr>
            </thead>
            <tbody>
              {readings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-xs">
                    Waiting for telemetry data...
                  </td>
                </tr>
              )}
              {[...readings].reverse().map((r, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-2 text-xs text-gray-400">{readings.length - i}</td>
                  <td className="px-5 py-2 text-blue-600 font-medium">{r.water_temp.toFixed(1)}</td>
                  <td className="px-5 py-2 text-orange-500 font-medium">{r.air_temp.toFixed(1)}</td>
                  <td className="px-5 py-2 text-purple-600 font-medium">{r.humidity.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}