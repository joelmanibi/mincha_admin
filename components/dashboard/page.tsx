"use client"

import { Building, ChevronRight, Home, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "@/components/dashboard/stats-card"
import { getUserData } from "@/lib/actions/user.actions"
import { userService } from "@/lib/services/userService"
import type { User } from "@/lib/types/user.types"

export function Dashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const data = await getUserData()
        if ('error' in data) {
          throw new Error(data.error)
        }
        setUsers(userService.parseUserData(data))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
        console.error('Erreur:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Bienvenue !</h2>
          <p className="text-gray-600">Tableau de bord MINCHA ADMIN</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">Semaine</Button>
          <Button variant="outline">Mois</Button>
          <Button className="bg-[#22A4D5] hover:bg-[#22A4D5]/90">Année</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Stats Cards */}
        <StatsCard users={users} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publications Actives</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,547</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% ce mois
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Propriétés</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,721</div>
            <p className="text-xs text-muted-foreground mt-1">
              2,890 Ventes • 831 Locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Statistiques Mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold">847</div>
                <div className="text-sm text-green-500">+23% de mises en relation</div>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Taux de réponse</div>
                    <Progress value={78} className="bg-gray-200" />
                    <div className="text-sm font-medium mt-1">78%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Visites organisées</div>
                    <Progress value={65} className="bg-gray-200" />
                    <div className="text-sm font-medium mt-1">65%</div>
                  </div>
                </div>
              </div>
              <Button className="bg-[#22A4D5] hover:bg-[#22A4D5]/90">
                Voir les détails <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Property Trends */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tendances Immobilières</CardTitle>
            <Tabs defaultValue="year">
              <TabsList>
                <TabsTrigger value="week">Semaine</TabsTrigger>
                <TabsTrigger value="month">Mois</TabsTrigger>
                <TabsTrigger value="year">Année</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end justify-between">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 bg-[#22A4D5] rounded-t"
                  style={{
                    height: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-sm">
                <div className="font-medium">Prix moyen</div>
                <div className="text-muted-foreground">325,000 €</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Délai de vente moyen</div>
                <div className="text-muted-foreground">45 jours</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

