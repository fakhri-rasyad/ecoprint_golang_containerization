import {create} from 'zustand'

interface AuthStore {
    token: string | null,
    username: string | null,
    setToken: (token:string, username: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
    setToken: (token, username) => {
        localStorage.setItem("token", token)
        localStorage.setItem("username", username)
        set({token: token, username: username})
    }, 
    logout: () => {
        localStorage.removeItem('token')
        set ({ token: null, username: null })
    },
}))