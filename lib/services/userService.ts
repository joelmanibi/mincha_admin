import type { User } from '@/lib/types/user.types'

export const userService = {
  parseUserData: (data: any) => {
    if (!data || !Array.isArray(data.user)) {
      return []
    }
    return data.user as User[]
  },

  formatUserName: (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`.trim()
  },

  getUserStatus: (isActive: boolean) => {
    return {
      text: isActive ? 'Actif' : 'Inactif',
      className: isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }
  },

  getAccountStatus: (isActive: boolean) => {
    return {
      text: isActive ? 'Approuvé' : 'Non approuvé',
      className: isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }
  }
}

