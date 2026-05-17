import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getSessions, createSession } from '../api/sessions'
import { getEsps } from '../api/esps'
import { getKompors } from '../api/kompors'
import type { FabricType } from '../types/session'
import { useToastStore } from '../store/toastStore'

const FABRIC_TYPES: FabricType[] = ['katun', 'polyester', 'linen', 'sutra']

export default function Sessions() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [espId, setEspId] = useState('')
  const [komporId, setKomporId] = useState('')
  const [fabricType, setFabricType] = useState<FabricType>('katun')
  const [formError, setFormError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const {addToast} = useToastStore()

  const sessions = useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions,
  })

  const esps = useQuery({
    queryKey: ['esps'],
    queryFn: getEsps,
  })

  const kompors = useQuery({
    queryKey: ['kompors'],
    queryFn: getKompors,
  })

  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      setShowForm(false)
      setFormError('')
      addToast('Session started successfully!', 'success')
      navigate(`/sessions/${data.Data.public_id}/live`)
    },
    onError: () => {
      addToast('Failed to create session. Please try again.', 'error')
    },
  })

  const handleCreate = () => {
    if (!espId || !komporId) {
      setFormError('Please select an ESP device and a kompor.')
      return
    }
    createMutation.mutate({
      esp_public_id: espId,
      kompor_public_id: komporId,
      fabric_type: fabricType,
    })
  }

  const allSessions = sessions.data?.Data ?? []
  const filteredSessions = allSessions
  .filter((s) => {
    const matchesSearch =
      s.public_id.toLowerCase().includes(search.toLowerCase()) ||
      s.fabric_type.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || s.boiling_status === statusFilter
    return matchesSearch && matchesStatus
  })
  const allEsps = esps.data?.Data ?? []
  const allKompors = kompors.data?.Data ?? []

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Sessions</h2>
          <p className="text-sm text-gray-400 mt-0.5">{allSessions.length} total sessions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Session
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by session ID or fabric type..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Status</option>
          <option value="boiling">Running</option>
          <option value="finished">Finished</option>
        </select>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">New Boiling Session</h3>

          <div className="grid grid-cols-3 gap-4 mb-4">

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">ESP Device</label>
              <select
                value={espId}
                onChange={(e) => setEspId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select ESP...</option>
                {allEsps.map((esp) => (
                  <option key={esp.public_id} value={esp.public_id}>
                    {esp.mac_address}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Kompor</label>
              <select
                value={komporId}
                onChange={(e) => setKomporId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Kompor...</option>
                {allKompors.map((kompor) => (
                  <option key={kompor.public_id} value={kompor.public_id}>
                    {kompor.kompor_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Fabric Type</label>
              <select
                value={fabricType}
                onChange={(e) => setFabricType(e.target.value as FabricType)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              >
                {FABRIC_TYPES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

          </div>

          {formError && (
            <p className="text-xs text-red-500 mb-3">{formError}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {createMutation.isPending ? 'Starting...' : 'Start Session'}
            </button>
            <button
              onClick={() => { setShowForm(false); setFormError('') }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-3 text-xs font-medium text-gray-400">Session ID</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400">Fabric</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400">Status</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400">Finished At</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400"></th>
            </tr>
          </thead>
          <tbody>
            {sessions.isLoading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  Loading sessions...
                </td>
              </tr>
            )}
            {!sessions.isLoading && allSessions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  No sessions yet — create one above
                </td>
              </tr>
            )}
            {filteredSessions.length === 0 && !sessions.isLoading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  No sessions match your search
                </td>
              </tr>
            )}
            {filteredSessions.map((session) => (
              <tr key={session.public_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-mono text-xs text-gray-600">{session.public_id}</td>
                <td className="px-5 py-3 capitalize text-gray-600">{session.fabric_type}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    session.boiling_status === 'boiling'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {session.boiling_status}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-400">
                  {new Date(session.finished_at).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() =>
                      session.boiling_status === 'boiling'
                        ? navigate(`/sessions/${session.public_id}/live`)
                        : navigate(`/sessions/${session.public_id}/history`)
                    }
                    className="text-xs text-green-600 hover:text-green-800 font-medium"
                  >
                    {session.boiling_status === 'boiling' ? 'View Live →' : 'View History →'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}