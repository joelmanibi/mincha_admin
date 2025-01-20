import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthStore, AuthResponse } from '@/lib/types/auth'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (data: AuthResponse) => {
        console.log('Setting auth state:', data)
        set({
          user: {
            userFirstname: data.userFirstname,
            userLastname: data.userLastname,
            userPhoneNumber: data.userPhoneNumber,
            userEmail: data.userEmail
          },
          token: data.userToken,
          isAuthenticated: true,
        })
      },
      clearAuth: () => {
        console.log('Clearing auth state')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage', // Ce nom doit correspondre à celui utilisé dans le middleware
      storage: {
        getItem: (name) => {
          try {
            const value = localStorage.getItem(name)
            return value ? JSON.parse(value) : null
          } catch {
            return null
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)

