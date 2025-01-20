import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from 'lucide-react'
import type { User } from "@/lib/types/user.types"

interface StatsCardProps {
  users: User[]
}

export function StatsCard({ users }: StatsCardProps) {
  // Calculer le nombre total d'utilisateurs
  const totalUsers = users.length

  // Calculer le nombre de clients (userTypeID === 4)
  const totalClients = users.filter(user => user.userTypeID === 4).length

  const validUserTypeIDs = [1, 2, 3];
const totalAgents = users.filter(user => validUserTypeIDs.includes(user.userTypeID)).length;


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {totalClients.toLocaleString()} Clients • {totalAgents.toLocaleString()} Agents
        </p>
      </CardContent>
    </Card>
  )
}

