import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEsps, createEsp, deleteEsp } from '../api/esps'
import { useToastStore } from '../store/toastStore'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function Devices() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [macAddress, setMacAddress] = useState('')
  const [formError, setFormError] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const {addToast} = useToastStore()

  const esps = useQuery({
    queryKey: ['esps'],
    queryFn: getEsps,
  })

  const createMutation = useMutation({
    mutationFn: createEsp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['esps'] })
      setShowForm(false)
      setMacAddress('')
      setFormError('')
      addToast('Device registered successfully!', 'success')
    },
    onError: () => {
      addToast('Failed to add device. Please try again.', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEsp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['esps'] })
      addToast('Device deleted.', 'info')
    },
    onError: () => {
      addToast('Failed to delete device.', 'error')
    },
  })

  const handleCreate = () => {
    if (!macAddress.trim()) {
      setFormError('MAC address is required.')
      return
    }
    createMutation.mutate({ mac_address: macAddress.trim() })
  }

  const allEsps = esps.data?.Data ?? []

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">ESP Devices</h2>
          <p className="text-sm text-gray-400 mt-0.5">{allEsps.length} registered devices</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add Device
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Register ESP Device</h3>
          <div className="flex gap-3 items-end">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-medium text-gray-500">MAC Address</label>
              <input
                type="text"
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                placeholder="e.g. AA:BB:CC:DD:EE:FF"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {createMutation.isPending ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => { setShowForm(false); setFormError('') }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
          {formError && <p className="text-xs text-red-500 mt-2">{formError}</p>}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-3 text-xs font-medium text-gray-400">MAC Address</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400">Device ID</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400">Status</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400">Registered</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400"></th>
            </tr>
          </thead>
          <tbody>
            {esps.isLoading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">Loading devices...</td>
              </tr>
            )}
            {!esps.isLoading && allEsps.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">No devices yet</td>
              </tr>
            )}
            {allEsps.map((esp) => (
              <tr key={esp.public_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-mono text-xs text-gray-700">{esp.mac_address}</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-400">{esp.public_id}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    esp.is_active
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {esp.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-400">
                  {new Date(esp.created_at.replace(' ', 'T')).toLocaleDateString('id-ID')}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => setConfirmId(esp.public_id)}
                    className="text-xs text-red-400 hover:text-red-600 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    {confirmId && (
      <ConfirmDialog
          title="Delete Device"
          message="Are you sure you want to delete this device? This action cannot be undone."
          onConfirm={() => {
            deleteMutation.mutate(confirmId)
            setConfirmId(null)
          }}
          onCancel={() => setConfirmId(null)}
      />
    )}
    </div>
  )
}