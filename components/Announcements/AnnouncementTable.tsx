"use client"

import { TableHeader } from "@/components/ui/table"

import { ChevronDown, MoreHorizontal, Search, Download, Plus } from "lucide-react"
import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import * as XLSX from "xlsx"
import { useState } from "react"

import { announcementService } from "@/lib/services/announcement.service"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { Announcement } from "@/lib/types/announcement.types"
import { AnnouncementDetailsDialog } from "./AnnouncementDetailsDialog"

interface Filters {
  announcementTypeId: number | null
  statusId: number | null
  minPrice: number | null
  maxPrice: number | null
}

const ANNOUNCEMENT_TYPES = [
  { id: 1, name: "Vente" },
  { id: 2, name: "Location" },
]

const ANNOUNCEMENT_STATUS = [
  { id: 1, name: "Validation en cours" },
  { id: 2, name: "Refusé" },
  { id: 3, name: "En ligne" },
  { id: 4, name: "Conclus" },
  { id: 5, name: "Retiré" },
] as const

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50]

export function AnnouncementsTable() {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filters, setFilters] = React.useState<Filters>({
    announcementTypeId: null,
    statusId: null,
    minPrice: null,
    maxPrice: null,
  })
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isMobileView, setIsMobileView] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<Announcement | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)

  const refreshAnnouncements = async () => {
    try {
      setIsLoading(true)
      const data = await announcementService.getAllAnnouncements()
      setAnnouncements(data.announcement)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      console.error("Erreur:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  React.useEffect(() => {
    refreshAnnouncements()
  }, []) //Fixed useEffect dependency

  React.useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768) // Adjust this breakpoint as needed
    }
    checkMobileView()
    window.addEventListener("resize", checkMobileView)
    return () => window.removeEventListener("resize", checkMobileView)
  }, [])

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.announcementCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.property.propertytype.propertyTypeName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType =
      filters.announcementTypeId === null || announcement.announcementTypeID === filters.announcementTypeId
    const matchesStatus = filters.statusId === null || announcement.announcementStatusID === filters.statusId
    const matchesMinPrice = filters.minPrice === null || announcement.propertyPrice >= filters.minPrice
    const matchesMaxPrice = filters.maxPrice === null || announcement.propertyPrice <= filters.maxPrice

    return matchesSearch && matchesType && matchesStatus && matchesMinPrice && matchesMaxPrice
  })

  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (!sortColumn) return 0

    // Handle nested properties
    const getValue = (obj: any, path: string) => {
      return path.split(".").reduce((acc, part) => acc?.[part] ?? "", obj)
    }

    const valueA = getValue(a, sortColumn)
    const valueB = getValue(b, sortColumn)

    if (valueA < valueB) {
      return sortDirection === "asc" ? -1 : 1
    }
    if (valueA > valueB) {
      return sortDirection === "asc" ? 1 : -1
    }
    return 0
  })

  const totalPages = Math.ceil(sortedAnnouncements.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAnnouncements = sortedAnnouncements.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [filters, itemsPerPage, sortColumn, sortDirection]) //Fixed useEffect dependency

  const clearFilters = () => {
    setFilters({
      announcementTypeId: null,
      statusId: null,
      minPrice: null,
      maxPrice: null,
    })
  }

  const exportToExcel = () => {
    const exportData = filteredAnnouncements.map((announcement) => ({
      Code: announcement.announcementCode,
      Type: announcement.announcementtype.announcementTypeName,
      "Type de bien": announcement.property.propertytype.propertyTypeName,
      Prix: announcementService.formatPrice(announcement.propertyPrice),
      Localisation: announcement.property.ville.villeName,
      Statut: ANNOUNCEMENT_STATUS.find((status) => status.id === announcement.announcementStatusID)?.name || "Inconnu",
      Vues: announcement.announcementView,
      "Date de création": format(new Date(announcement.createdAt), "PPP", { locale: fr }),
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    XLSX.utils.book_append_sheet(wb, ws, "Annonces")
    XLSX.writeFile(wb, `annonces_${format(new Date(), "dd-MM-yyyy")}.xlsx`)
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const maxVisiblePages = 5
    let startPage = 1
    let endPage = totalPages

    if (totalPages > maxVisiblePages) {
      const leftOffset = Math.floor(maxVisiblePages / 2)
      const rightOffset = maxVisiblePages - leftOffset - 1

      if (currentPage <= leftOffset) {
        endPage = maxVisiblePages
      } else if (currentPage > totalPages - rightOffset) {
        startPage = totalPages - maxVisiblePages + 1
      } else {
        startPage = currentPage - leftOffset
        endPage = currentPage + rightOffset
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          className="w-8"
        >
          {i}
        </Button>,
      )
    }

    return buttons
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium">Erreur de chargement</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full md:w-64">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une annonce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                Type d'annonce <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {ANNOUNCEMENT_TYPES.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type.id}
                  checked={filters.announcementTypeId === type.id}
                  onCheckedChange={() =>
                    setFilters((prev) => ({
                      ...prev,
                      announcementTypeId: prev.announcementTypeId === type.id ? null : type.id,
                    }))
                  }
                >
                  {type.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                Statut <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {ANNOUNCEMENT_STATUS.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status.id}
                  checked={filters.statusId === status.id}
                  onCheckedChange={() =>
                    setFilters((prev) => ({
                      ...prev,
                      statusId: prev.statusId === status.id ? null : status.id,
                    }))
                  }
                >
                  {status.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {(filters.announcementTypeId !== null ||
            filters.statusId !== null ||
            filters.minPrice !== null ||
            filters.maxPrice !== null) && (
            <Button variant="ghost" onClick={clearFilters} className="text-red-500 hover:text-red-600 w-full md:w-auto">
              Réinitialiser les filtres
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button className="flex items-center gap-2 w-full md:w-auto">
            <Plus className="h-4 w-4" />
            Ajouter une annonce
          </Button>
        </div>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("announcementCode")} className="cursor-pointer">
                Code
                {sortColumn === "announcementCode" && (
                  <span className={`ml-2 text-xs ${sortDirection === "asc" ? "text-green-500" : "text-red-500"}`}>
                    {sortDirection === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </TableHead>
              {!isMobileView && (
                <>
                  <TableHead
                    onClick={() => handleSort("announcementtype.announcementTypeName")}
                    className="cursor-pointer"
                  >
                    Type d'annonce
                    {sortColumn === "announcementtype.announcementTypeName" && (
                      <span className={`ml-2 text-xs ${sortDirection === "asc" ? "text-green-500" : "text-red-500"}`}>
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("property.propertytype.propertyTypeName")}
                    className="cursor-pointer"
                  >
                    Type de bien
                    {sortColumn === "property.propertytype.propertyTypeName" && (
                      <span className={`ml-2 text-xs ${sortDirection === "asc" ? "text-green-500" : "text-red-500"}`}>
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead onClick={() => handleSort("propertyPrice")} className="cursor-pointer">
                    Prix
                    {sortColumn === "propertyPrice" && (
                      <span className={`ml-2 text-xs ${sortDirection === "asc" ? "text-green-500" : "text-red-500"}`}>
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead onClick={() => handleSort("property.ville.villeName")} className="cursor-pointer">
                    Localisation
                    {sortColumn === "property.ville.villeName" && (
                      <span className={`ml-2 text-xs ${sortDirection === "asc" ? "text-green-500" : "text-red-500"}`}>
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </TableHead>
                </>
              )}
              <TableHead onClick={() => handleSort("announcementStatusID")} className="cursor-pointer">
                Statut
                {sortColumn === "announcementStatusID" && (
                  <span className={`ml-2 text-xs ${sortDirection === "asc" ? "text-green-500" : "text-red-500"}`}>
                    {sortDirection === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </TableHead>
              {!isMobileView && (
                <>
                  <TableHead onClick={() => handleSort("announcementView")} className="cursor-pointer">
                    Vues
                    {sortColumn === "announcementView" && (
                      <span className={`ml-2 text-xs ${sortDirection === "asc" ? "text-green-500" : "text-red-500"}`}>
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                    Date de création
                    {sortColumn === "createdAt" && (
                      <span className={`ml-2 text-xs ${sortDirection === "asc" ? "text-green-500" : "text-red-500"}`}>
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </TableHead>
                </>
              )}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: itemsPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[250px]" />
                    </TableCell>
                    {!isMobileView && (
                      <>
                        <TableCell>
                          <Skeleton className="h-4 w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    {!isMobileView && (
                      <>
                        <TableCell>
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              : paginatedAnnouncements.map((announcement) => (
                  <TableRow key={announcement.announcementId}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{announcement.announcementCode}</div>
                        {isMobileView && (
                          <>
                            <div className="text-sm">{announcement.announcementtype.announcementTypeName}</div>
                            <div className="text-sm">{announcementService.formatPrice(announcement.propertyPrice)}</div>
                          </>
                        )}
                      </div>
                    </TableCell>
                    {!isMobileView && (
                      <>
                        <TableCell>{announcement.announcementtype.announcementTypeName}</TableCell>
                        <TableCell>{announcement.property.propertytype.propertyTypeName}</TableCell>
                        <TableCell>{announcementService.formatPrice(announcement.propertyPrice)}</TableCell>
                        <TableCell>{announcement.property.ville.villeName}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          announcement.announcementStatusID === 1
                            ? "bg-yellow-100 text-yellow-800"
                            : announcement.announcementStatusID === 2
                              ? "bg-red-100 text-red-800"
                              : announcement.announcementStatusID === 3
                                ? "bg-green-100 text-green-800"
                                : announcement.announcementStatusID === 4
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ANNOUNCEMENT_STATUS.find((status) => status.id === announcement.announcementStatusID)?.name ||
                          "Inconnu"}
                      </div>
                    </TableCell>
                    {!isMobileView && (
                      <>
                        <TableCell>{announcement.announcementView}</TableCell>
                        <TableCell>{format(new Date(announcement.createdAt), "PPP", { locale: fr })}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => {
                              setSelectedAnnouncement(announcement)
                              setIsDetailsOpen(true)
                            }}
                          >
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>Modifier</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Affichage de {Math.min(startIndex + 1, filteredAnnouncements.length)} à{" "}
            {Math.min(endIndex, filteredAnnouncements.length)} sur {filteredAnnouncements.length} annonce(s)
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
          <div className="flex items-center gap-1">{renderPaginationButtons()}</div>
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
      <AnnouncementDetailsDialog
        announcement={selectedAnnouncement}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  )
}

