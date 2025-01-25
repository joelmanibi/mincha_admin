"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Bath, Bed, Car, Home, Loader2, PocketIcon as Pool, Sofa } from "lucide-react"

import { propertyService } from "@/lib/services/property.service"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyPhotoGallery } from "@/components/properties/property-photo-gallery"
import type { Property, PropertyPhoto } from "@/lib/types/property.types"

interface PropertyDetailsDialogProps {
  property: Property | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PropertyDetailsDialog({ property, open, onOpenChange }: PropertyDetailsDialogProps) {
  const [photos, setPhotos] = useState<PropertyPhoto[]>([])
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    checkMobileView()
    window.addEventListener("resize", checkMobileView)
    return () => window.removeEventListener("resize", checkMobileView)
  }, [])

  useEffect(() => {
    const fetchPhotos = async () => {
      if (property && open) {
        setIsLoadingPhotos(true)
        setPhotoError(null)
        try {
          const data = await propertyService.getPropertyPhotos(property.propertyId)
          if ("error" in data) {
            throw new Error(data.error)
          }
          setPhotos(data)
        } catch (error) {
          setPhotoError(error instanceof Error ? error.message : "Une erreur est survenue")
          console.error("Erreur:", error)
        } finally {
          setIsLoadingPhotos(false)
        }
      }
    }

    fetchPhotos()
  }, [property, open])

  if (!property) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${isMobileView ? "p-0 h-[100dvh] max-w-[100vw]" : "max-w-3xl"}`}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          <DialogHeader className={`${isMobileView ? "p-4 border-b" : ""}`}>
            <DialogTitle>Détails de la propriété #{property.propertyId}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="photos" className="flex-1 flex flex-col">
            <TabsList className="w-full border-b rounded-none px-0 justify-between">
              <TabsTrigger value="photos" className="flex-1 rounded-none">
                Photos
              </TabsTrigger>
              <TabsTrigger value="info" className="flex-1 rounded-none">
                Informations
              </TabsTrigger>
              <TabsTrigger value="features" className="flex-1 rounded-none">
                Caractéristiques
              </TabsTrigger>
              <TabsTrigger value="owner" className="flex-1 rounded-none">
                Propriétaire
              </TabsTrigger>
            </TabsList>

            <div className={`flex-1 overflow-y-auto ${isMobileView ? "p-4" : "p-6"}`}>
              <TabsContent value="photos" className="mt-0">
                {isLoadingPhotos ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : photoError ? (
                  <div className="text-center py-8 text-muted-foreground">{photoError}</div>
                ) : photos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Aucune photo disponible</div>
                ) : (
                  <PropertyPhotoGallery photos={photos} isMobileView={isMobileView} />
                )}
              </TabsContent>

              <TabsContent value="info" className="mt-0 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Type de bien</h4>
                      <p className="mt-1 flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        {property.propertytype.propertyTypeName}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Prix</h4>
                      <p className="mt-1 font-semibold">{propertyService.formatPrice(property.propertyPrice)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Surface</h4>
                      <p className="mt-1">{propertyService.formatArea(property.propertyArea)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Niveau</h4>
                      <p className="mt-1">{property.level.levelName}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Statut d'approbation</h4>
                      <div className="mt-2">
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            property.propertyApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {property.propertyApproved ? "Approuvé" : "En attente d'approbation"}
                        </div>
                      </div>
                      {property.approvalComment && (
                        <p className="mt-2 text-sm text-gray-500">Commentaire: {property.approvalComment}</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Dates</h4>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm">
                          Création: {format(new Date(property.createdAt), "PPP", { locale: fr })}
                        </p>
                        <p className="text-sm">
                          Mise à jour: {format(new Date(property.updatedAt), "PPP", { locale: fr })}
                        </p>
                      </div>
                    </div>

                    {property.propertyDoc && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Document de propriété</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => window.open(`http://dev-mani.tech:8000/static/property/doc/${property.propertyDoc}`, "_blank")}
                        >
                          Voir le document
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    {property.bedroom !== null && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Bed className="h-5 w-5 text-gray-500 shrink-0" />
                        <div>
                          <p className="font-medium">{property.bedroom}</p>
                          <p className="text-sm text-gray-500">Chambre{property.bedroom > 1 ? "s" : ""}</p>
                        </div>
                      </div>
                    )}

                    {property.bathroom !== null && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Bath className="h-5 w-5 text-gray-500 shrink-0" />
                        <div>
                          <p className="font-medium">{property.bathroom}</p>
                          <p className="text-sm text-gray-500">Salle{property.bathroom > 1 ? "s" : ""} de bain</p>
                        </div>
                      </div>
                    )}

                    {property.livingRoom !== null && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Sofa className="h-5 w-5 text-gray-500 shrink-0" />
                        <div>
                          <p className="font-medium">{property.livingRoom}</p>
                          <p className="text-sm text-gray-500">Salon{property.livingRoom > 1 ? "s" : ""}</p>
                        </div>
                      </div>
                    )}

                    {property.garagePlace > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Car className="h-5 w-5 text-gray-500 shrink-0" />
                        <div>
                          <p className="font-medium">{property.garagePlace}</p>
                          <p className="text-sm text-gray-500">Place{property.garagePlace > 1 ? "s" : ""} de garage</p>
                        </div>
                      </div>
                    )}

                    {property.piscine && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Pool className="h-5 w-5 text-gray-500 shrink-0" />
                        <div>
                          <p className="font-medium">Piscine</p>
                          <p className="text-sm text-gray-500">La propriété dispose d'une piscine</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="owner" className="mt-0">
                {property.account ? (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      {property.account.accountLogo && (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0">
                          <img
                            src={property.account.accountLogo || "/placeholder.svg"}
                            alt="Logo du compte"
                            className="w-full h-full rounded-lg object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold truncate">{property.account.accounTitle}</h3>
                        <p className="text-sm text-muted-foreground truncate">{property.account.accountEmail}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              property.account.accountIsActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {property.account.accountIsActive ? "Actif" : "Inactif"}
                          </div>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              property.account.accountIsApproved
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {property.account.accountIsApproved ? "Approuvé" : "En attente"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Type de compte</h4>
                        <p className="mt-1">{property.account.accounttype.accountTypeName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Numéro de compte</h4>
                        <p className="mt-1">{property.account.accountNumber}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Date de création</h4>
                        <p className="mt-1">{format(new Date(property.account.createdAt), "PPP", { locale: fr })}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Dernière mise à jour</h4>
                        <p className="mt-1">{format(new Date(property.account.updatedAt), "PPP", { locale: fr })}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune information sur le propriétaire disponible
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

