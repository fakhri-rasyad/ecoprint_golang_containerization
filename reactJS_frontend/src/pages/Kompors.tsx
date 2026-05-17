import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getKompors, createKompor, deleteKompor } from '../api/kompors'
import { useToastStore } from '../store/toastStore'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function Kompors() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [komporName, setKomporName] = useState('')
  const [formError, setFormError] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const kompors = useQuery({
    queryKey: ['kompors'],
    queryFn: getKompors,
  })

  const { addToast } = useToastStore()  
  const createMutation = useMutation({
    mutationFn: createKompor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kompors'] })
      setShowForm(false)
      setKomporName('')
      setFormError('')
      addToast('Kompor registered successfully!', 'success')
    },
    onError: () => {
      addToast('Failed to add kompor. Please try again.', 'error')
    },
  })  

  const deleteMutation = useMutation({
    mutationFn: deleteKompor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kompors'] })
      addToast('Kompor deleted.', 'info')
    },
    onError: () => {
      addToast('Failed to delete kompor.', 'error')
    },
  })

  const handleCreate = () => {
    if (!komporName.trim()) {
      setFormError('Kompor name is required.')
      return
    }
    createMutation.mutate({ kompor_name: komporName.trim() })
  }

  const allKompors = kompors.data?.Data ?? []

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Kompors</h2>
          <p className="text-sm text-gray-400 mt-0.5">{allKompors.length} registered kompors</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add Kompor
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Register Kompor</h3>
          <div className="flex gap-3 items-end">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-medium text-gray-500">Kompor Name</label>
              <input
                type="text"
                value={komporName}
                onChange={(e) => setKomporName(e.target.value)}
                placeholder="e.g. Kompor A"
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
              <th className="px-5 py-3 text-xs font-medium text-gray-400">Name</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400">Kompor ID</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400">Status</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400">Registered</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400"></th>
            </tr>
          </thead>
          <tbody>
            {kompors.isLoading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">Loading kompors...</td>
              </tr>
            )}
            {!kompors.isLoading && allKompors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">No kompors yet</td>
              </tr>
            )}
            {allKompors.map((kompor) => (
              <tr key={kompor.public_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 text-sm font-medium text-gray-700">{kompor.kompor_name}</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-400">{kompor.public_id}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    kompor.is_active
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {kompor.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-400">
                  {new Date(kompor.created_at.replace(' ', 'T')).toLocaleDateString('id-ID')}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => setConfirmId(kompor.public_id)}
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
            title="Delete Kompor"
            message="Are you sure you want to delete this kompor? This action cannot be undone."
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