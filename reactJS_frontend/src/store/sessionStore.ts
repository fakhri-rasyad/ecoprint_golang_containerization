import { create } from 'zustand'
import type { TelemetryMessage } from '../types/session'

interface SessionState {
  readings: TelemetryMessage[]
  isFinished: boolean
  addReading: (reading: TelemetryMessage) => void
  setFinished: () => void
  reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  readings: [],
  isFinished: false,

  addReading: (reading) =>
    set((state) => ({
      readings: [...state.readings.slice(-60), reading],
    })),

  setFinished: () => set({ isFinished: true }),

  reset: () => set({ readings: [], isFinished: false }),
}))