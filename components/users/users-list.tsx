"use client"

import { CalendarIcon, ChevronDown, Download, MoreHorizontal, Search, AlertCircle } from 'lucide-react'
import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useState } from 'react'
import * as XLSX from 'xlsx'
import { toast } from "@/hooks/use-toast"

import { getUserData, deleteUser } from "@/lib/actions/user.actions"
import { userService } from "@/lib/services/userService"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { UserProfileDialog } from "@/components/users/user-profile-dialog"
import { AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { User } from "@/lib/types/user.types"

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface Filters {
  status: boolean | null
  userTypeId: number | null
  userRoleId: number | null
  dateRange: DateRange
  accountApproved: boolean | null
  accountTypeId: number | null
}

const USER_TYPES = [
  { id: 1, name: "Propriétaire" },
  { id: 2, name: "Agent immobilier" },
  { id: 3, name: "Agence immobilière" },
  { id: 4, name: "Client" },
  { id: 5, name: "Equipe Mincha" },
]

const USER_ROLES = [
  { id: 1, name: "Super Admin" },
  { id: 2, name: "Administrateur BO" },
  { id: 3, name: "Administrateur propriété" },
  { id: 4, name: "Locataire" },
  { id: 5, name: "client visiteur" },
]

const ACCOUNT_TYPES = [
  { id: 1, name: "Experts" },
  { id: 2, name: "Professionnels" },
  { id: 3, name: "Particuliers" },
  { id: 4, name: "Validation en cours" },
]

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100]

export function UsersTable() {
  const [users, setUsers] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const [filters, setFilters] = React.useState<Filters>({
    status: null,
    userTypeId: null,
    userRoleId: null,
    dateRange: {
      from: undefined,
      to: undefined
    },
    accountApproved: null,
    accountTypeId: null
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const refreshUsers = async () => {
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

  React.useEffect(() => {
    refreshUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.userFirstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userLastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.usertype.userTypeName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filters.status === null || user.userIsActive === filters.status

    const matchesType = filters.userTypeId === null || user.userTypeID === filters.userTypeId

    const matchesRole = filters.userRoleId === null || user.userRoleID === filters.userRoleId

    const userDate = new Date(user.createdAt)
    const matchesDateRange =
      (!filters.dateRange.from || userDate >= filters.dateRange.from) &&
      (!filters.dateRange.to || userDate <= filters.dateRange.to)

    const matchesAccountApproval = filters.accountApproved === null ||
      (user.account && user.account.accountIsApproved === filters.accountApproved)

    const matchesAccountType = filters.accountTypeId === null ||
      (user.account && user.account.accounttype.accountTypeId === filters.accountTypeId)

    return matchesSearch && matchesStatus && matchesType && matchesRole &&
           matchesDateRange && matchesAccountApproval && matchesAccountType
  })

  const handleStatusChange = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) throw new Error('Erreur lors de la mise à jour du statut')

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.userId === userId
            ? { ...user, userIsActive: !currentStatus }
            : user
        )
      )
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err)
    }
  }

  const clearFilters = () => {
    setFilters({
      status: null,
      userTypeId: null,
      userRoleId: null,
      dateRange: {
        from: undefined,
        to: undefined
      },
      accountApproved: null,
      accountTypeId: null
    })
  }

  const exportToExcel = () => {
    // Préparer les données pour l'export
    const exportData = filteredUsers.map(user => ({
      'Nom': `${user.userFirstname} ${user.userLastname}`,
      'Email': user.userEmail,
      'Téléphone': user.userPhoneNumber,
      'Type': user.usertype.userTypeName,
      'Rôle': user.userrole.userRoleName,
      'Statut': user.userIsActive ? 'Actif' : 'Inactif',
      'Type de compte': user.account?.accounttype.accountTypeName || 'N/A',
      'Compte approuvé': user.account ? (user.account.accountIsApproved ? 'Oui' : 'Non') : 'N/A',
      'Date d\'inscription': format(new Date(user.createdAt), "PPP", { locale: fr }),
    }))

    // Créer le workbook et la worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Ajouter la worksheet au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Utilisateurs')

    // Générer le fichier Excel et le télécharger
    XLSX.writeFile(wb, `utilisateurs_${format(new Date(), "dd-MM-yyyy")}.xlsx`)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    const result = await deleteUser(userToDelete.userId)

    if (result.success) {
      toast({
        title: "Succès",
        description: "L'utilisateur a été supprimé avec succès",
      })
      setUsers(prevUsers => prevUsers.filter(user => user.userId !== userToDelete.userId))
    } else {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      })
    }

    setUserToDelete(null)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium">Erreur de chargement</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  // Calculer les indices de début et de fin pour la pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2 flex-wrap gap-y-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Statut <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuCheckboxItem
                checked={filters.status === true}
                onCheckedChange={() => setFilters(prev => ({ ...prev, status: true }))}
              >
                Actif
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.status === false}
                onCheckedChange={() => setFilters(prev => ({ ...prev, status: false }))}
              >
                Inactif
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Type d'utilisateur <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {USER_TYPES.map(type => (
                <DropdownMenuCheckboxItem
                  key={type.id}
                  checked={filters.userTypeId === type.id}
                  onCheckedChange={() => setFilters(prev => ({
                    ...prev,
                    userTypeId: prev.userTypeId === type.id ? null : type.id
                  }))}
                >
                  {type.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Rôle <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {USER_ROLES.map(role => (
                <DropdownMenuCheckboxItem
                  key={role.id}
                  checked={filters.userRoleId === role.id}
                  onCheckedChange={() => setFilters(prev => ({
                    ...prev,
                    userRoleId: prev.userRoleId === role.id ? null : role.id
                  }))}
                >
                  {role.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Type de compte <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {ACCOUNT_TYPES.map(type => (
                <DropdownMenuCheckboxItem
                  key={type.id}
                  checked={filters.accountTypeId === type.id}
                  onCheckedChange={() => setFilters(prev => ({
                    ...prev,
                    accountTypeId: prev.accountTypeId === type.id ? null : type.id
                  }))}
                >
                  {type.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "P", { locale: fr })} -{" "}
                      {format(filters.dateRange.to, "P", { locale: fr })}
                    </>
                  ) : (
                    format(filters.dateRange.from, "P", { locale: fr })
                  )
                ) : (
                  "Sélectionner une période"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from}
                selected={{
                  from: filters.dateRange.from,
                  to: filters.dateRange.to,
                }}
                onSelect={(range: any) =>
                  setFilters(prev => ({
                    ...prev,
                    dateRange: {
                      from: range?.from,
                      to: range?.to
                    }
                  }))
                }
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Compte approuvé <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuCheckboxItem
                checked={filters.accountApproved === true}
                onCheckedChange={() => setFilters(prev => ({ ...prev, accountApproved: true }))}
              >
                Approuvé
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.accountApproved === false}
                onCheckedChange={() => setFilters(prev => ({ ...prev, accountApproved: false }))}
              >
                En attente
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {(filters.status !== null ||
            filters.userTypeId !== null ||
            filters.userRoleId !== null ||
            filters.dateRange.from ||
            filters.dateRange.to ||
            filters.accountApproved !== null ||
            filters.accountTypeId !== null) && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-red-500 hover:text-red-600"
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Type de compte</TableHead>
              <TableHead>Compte approuvé</TableHead>
              <TableHead>Date d'inscription</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{`${user.userFirstname} ${user.userLastname}`}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.userEmail}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.userGender ? 'Homme' : 'Femme'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.userPhoneNumber}</TableCell>
                  <TableCell>{user.usertype.userTypeName}</TableCell>
                  <TableCell>{user.userrole.userRoleName}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.userIsActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.userIsActive ? 'Actif' : 'Inactif'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.account ? (
                      <span className="text-sm">{user.account.accounttype.accountTypeName}</span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.account ? (
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.account.accountIsApproved
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {user.account.accountIsApproved ? 'Approuvé' : 'En attente'}
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => {
                          setSelectedUser(user)
                          setIsProfileOpen(true)
                        }}>
                          Voir le profil
                        </DropdownMenuItem>
                        <DropdownMenuItem>Modifier</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleStatusChange(user.userId, user.userIsActive)}
                        >
                          {user.userIsActive ? 'Désactiver' : 'Activer'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={() => setUserToDelete(user)}
                        >
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Affichage de {Math.min(startIndex + 1, filteredUsers.length)} à{" "}
            {Math.min(endIndex, filteredUsers.length)} sur {filteredUsers.length} utilisateur(s)
          </p>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option} par page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8"
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Suivant
          </Button>
        </div>
      </div>

      <UserProfileDialog
        user={selectedUser}
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        onSuccess={() => {
          refreshUsers()
        }}
      />
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
              {userToDelete && (
                <div className="mt-2 rounded-lg border p-3">
                  <div className="font-medium">{userToDelete.userFirstname} {userToDelete.userLastname}</div>
                  <div className="text-sm text-muted-foreground">{userToDelete.userEmail}</div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

