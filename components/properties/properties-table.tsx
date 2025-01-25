"use client"

import { ChevronDown, MoreHorizontal, Search, Download, Plus, Home } from "lucide-react"
import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useState } from "react"
import * as XLSX from "xlsx"

import { propertyService } from "@/lib/services/property.service"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { PropertyDetailsDialog } from "@/components/properties/property-details-dialog"
import { PropertyApprovalDialog } from "@/components/properties/property-approval-dialog"
import { PropertyDeleteDialog } from "@/components/properties/property-delete-dialog"
import type { Property } from "@/lib/types/property.types"

interface Filters {
  propertyTypeId: number | null
  approved: boolean | null
  hasPool: boolean | null
  minPrice: number | null
  maxPrice: number | null
}

const PROPERTY_TYPES = [
  { id: 1, name: "Appartement" },
  { id: 2, name: "Maison" },
  { id: 3, name: "Terrain" },
]

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50]

export function PropertiesTable() {
  const [properties, setProperties] = React.useState<Property[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filters, setFilters] = React.useState<Filters>({
    propertyTypeId: null,
    approved: null,
    hasPool: null,
    minPrice: null,
    maxPrice: null,
  })
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [propertyToApprove, setPropertyToApprove] = useState<{
    property: Property | null
    mode: "approve" | "reject"
  }>({
    property: null,
    mode: "approve",
  })
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isMobileView, setIsMobileView] = useState(false)

  const refreshProperties = async () => {
    try {
      setIsLoading(true)
      const data = await propertyService.getAllProperties()
      if ("error" in data) {
        throw new Error(data.error)
      }
      setProperties(data)
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
    refreshProperties()
  }, [])

  React.useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768) // Adjust this breakpoint as needed
    }
    checkMobileView()
    window.addEventListener("resize", checkMobileView)
    return () => window.removeEventListener("resize", checkMobileView)
  }, [])

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.account?.accounTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.propertytype.propertyTypeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.level.levelName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filters.propertyTypeId === null || property.propertyTypeID === filters.propertyTypeId
    const matchesApproval = filters.approved === null || property.propertyApproved === filters.approved
    const matchesPool = filters.hasPool === null || property.piscine === filters.hasPool
    const matchesMinPrice = filters.minPrice === null || property.propertyPrice >= filters.minPrice
    const matchesMaxPrice = filters.maxPrice === null || property.propertyPrice <= filters.maxPrice

    return matchesSearch && matchesType && matchesApproval && matchesPool && matchesMinPrice && matchesMaxPrice
  })

  const sortedProperties = [...filteredProperties].sort((a, b) => {
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

  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProperties = sortedProperties.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filters, itemsPerPage, sortColumn, sortDirection])

  const clearFilters = () => {
    setFilters({
      propertyTypeId: null,
      approved: null,
      hasPool: null,
      minPrice: null,
      maxPrice: null,
    })
  }

  const exportToExcel = () => {
    const exportData = filteredProperties.map((property) => ({
      Référence: property.propertyId,
      Type: property.propertytype.propertyTypeName,
      Propriétaire: property.account?.accounTitle || "N/A",
      Prix: propertyService.formatPrice(property.propertyPrice),
      Surface: propertyService.formatArea(property.propertyArea),
      Étage: property.level.levelName,
      Chambres: property.bedroom || "N/A",
      "Salles de bain": property.bathroom || "N/A",
      Salon: property.livingRoom || "N/A",
      Garage: property.garagePlace,
      Piscine: property.piscine ? "Oui" : "Non",
      Statut: property.propertyApproved ? "Approuvé" : "En attente",
      "Date de création": format(new Date(property.createdAt), "PPP", { locale: fr }),
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    XLSX.utils.book_append_sheet(wb, ws, "Propriétés")
    XLSX.writeFile(wb, `proprietes_${format(new Date(), "dd-MM-yyyy")}.xlsx`)
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
                placeholder="Rechercher une propriété..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                Type de bien <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {PROPERTY_TYPES.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type.id}
                  checked={filters.propertyTypeId === type.id}
                  onCheckedChange={() =>
                    setFilters((prev) => ({
                      ...prev,
                      propertyTypeId: prev.propertyTypeId === type.id ? null : type.id,
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
              <DropdownMenuCheckboxItem
                checked={filters.approved === true}
                onCheckedChange={() => setFilters((prev) => ({ ...prev, approved: true }))}
              >
                Approuvé
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.approved === false}
                onCheckedChange={() => setFilters((prev) => ({ ...prev, approved: false }))}
              >
                En attente
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                Caractéristiques <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuCheckboxItem
                checked={filters.hasPool === true}
                onCheckedChange={() => setFilters((prev) => ({ ...prev, hasPool: true }))}
              >
                Avec piscine
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.hasPool === false}
                onCheckedChange={() => setFilters((prev) => ({ ...prev, hasPool: false }))}
              >
                Sans piscine
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {(filters.propertyTypeId !== null ||
            filters.approved !== null ||
            filters.hasPool !== null ||
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
            Ajouter une propriété
          </Button>
        </div>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("propertyId")} className="cursor-pointer">
                Propriété
                {sortColumn === "propertyId" && (
                  <span className={`ml-2 text-xs ${sortDirection === "asc" ? "text-green-500" : "text-red-500"}`}>
                    {sortDirection === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </TableHead>
              {!isMobileView && (
                <>
                  <TableHead onClick={() => handleSort("account.accounTitle")} className="cursor-pointer">
                    Propriétaire
                    {sortColumn === "account.accounTitle" && (
                      <span className={`ml-2 text-xs ${sortDirection === "asc" ? "text-green-500" : "text-red-500"}`}>
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead onClick={() => handleSort("propertytype.propertyTypeName")} className="cursor-pointer">
                    Type
                    {sortColumn === "propertytype.propertyTypeName" && (
                      <span className={`ml-2 text-xs ${sortDirection === "asc" ? "text-green-500" : "text-red-500"}`}>
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead onClick={() => handleSort("ville.villeName")} className="cursor-pointer">
                    Localisation
                    {sortColumn === "ville.villeName" && (
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
                  <TableHead onClick={() => handleSort("propertyArea")} className="cursor-pointer">
                    Surface
                    {sortColumn === "propertyArea" && (
                      <span className={`ml-2 text-xs ${sortDirection === "asc" ? "text-green-500" : "text-red-500"}`}>
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Caractéristiques</TableHead>
                </>
              )}
              <TableHead onClick={() => handleSort("propertyApproved")} className="cursor-pointer">
                Statut
                {sortColumn === "propertyApproved" && (
                  <span className={`ml-2 text-xs ${sortDirection === "asc" ? "text-green-500" : "text-red-500"}`}>
                    {sortDirection === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </TableHead>
              {!isMobileView && (
                <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                  Date d'ajout
                  {sortColumn === "createdAt" && (
                    <span className={`ml-2 text-xs ${sortDirection === "asc" ? "text-green-500" : "text-red-500"}`}>
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </TableHead>
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
                        <TableCell>
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[200px]" />
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    {!isMobileView && (
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                    )}
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              : paginatedProperties.map((property) => (
                  <TableRow key={property.propertyId}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">Propriété #{property.propertyId}</div>
                        <div className="text-sm text-muted-foreground">{property.level.levelName}</div>
                        {isMobileView && (
                          <>
                            <div className="text-sm">{property.propertytype.propertyTypeName}</div>
                            <div className="text-sm">{propertyService.formatPrice(property.propertyPrice)}</div>
                          </>
                        )}
                      </div>
                    </TableCell>
                    {!isMobileView && (
                      <>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{property.account?.accounTitle}</div>
                            <div className="text-sm text-muted-foreground">
                              {property.account?.accounttype.accountTypeName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{property.propertytype.propertyTypeName}</TableCell>
                        <TableCell>{property.ville?.villeName || "N/A"}</TableCell>
                        <TableCell>{propertyService.formatPrice(property.propertyPrice)}</TableCell>
                        <TableCell>{propertyService.formatArea(property.propertyArea)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {property.bedroom && (
                              <div className="text-sm">
                                {property.bedroom} chambre{property.bedroom > 1 ? "s" : ""}
                              </div>
                            )}
                            {property.bathroom && (
                              <div className="text-sm">
                                {property.bathroom} salle{property.bathroom > 1 ? "s" : ""} de bain
                              </div>
                            )}
                            {property.livingRoom && (
                              <div className="text-sm">
                                {property.livingRoom} salon{property.livingRoom > 1 ? "s" : ""}
                              </div>
                            )}
                            {property.garagePlace > 0 && (
                              <div className="text-sm">
                                {property.garagePlace} place{property.garagePlace > 1 ? "s" : ""} de garage
                              </div>
                            )}
                            {property.piscine && <div className="text-sm">Piscine</div>}
                          </div>
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          property.propertyApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {property.propertyApproved ? "Approuvé" : "En attente"}
                      </div>
                    </TableCell>
                    {!isMobileView && (
                      <TableCell>{format(new Date(property.createdAt), "PPP", { locale: fr })}</TableCell>
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
                              setSelectedProperty(property)
                              setIsDetailsOpen(true)
                            }}
                          >
                            Voir les détails
                          </DropdownMenuItem>
                          {!property.propertyApproved && (
                            <>
                              <DropdownMenuItem
                                onSelect={() =>
                                  setPropertyToApprove({
                                    property,
                                    mode: "approve",
                                  })
                                }
                                className="text-green-600"
                              >
                                Approuver
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() =>
                                  setPropertyToApprove({
                                    property,
                                    mode: "reject",
                                  })
                                }
                                className="text-red-600"
                              >
                                Rejeter
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>Modifier</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onSelect={() => setPropertyToDelete(property)}>
                            Supprimer
                          </DropdownMenuItem>
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
            Affichage de {Math.min(startIndex + 1, filteredProperties.length)} à{" "}
            {Math.min(endIndex, filteredProperties.length)} sur {filteredProperties.length} propriété(s)
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
      <PropertyDetailsDialog property={selectedProperty} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />
      <PropertyApprovalDialog
        property={propertyToApprove.property}
        mode={propertyToApprove.mode}
        open={!!propertyToApprove.property}
        onOpenChange={(open) => {
          if (!open) {
            setPropertyToApprove({ property: null, mode: "approve" })
          }
        }}
        onSuccess={() => {
          refreshProperties()
        }}
      />
      <PropertyDeleteDialog
        property={propertyToDelete}
        open={!!propertyToDelete}
        onOpenChange={(open) => {
          if (!open) setPropertyToDelete(null)
        }}
        onSuccess={() => {
          refreshProperties()
        }}
      />
    </div>
  )
}

