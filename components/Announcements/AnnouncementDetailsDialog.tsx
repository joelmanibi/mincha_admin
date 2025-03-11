"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Home,
  MapPin,
  Calendar,
  Eye,
  SquareIcon as SquareFeet,
  Bed,
  Bath,
  Sofa,
  Car,
  PocketIcon as Pool,
  Image,
  Badge,
} from "lucide-react"
import { useState, useEffect } from "react"
import type { Announcement, PropertyPhoto } from "@/lib/types/announcement.types"
import { announcementService } from "@/lib/services/announcement.service"
import { Skeleton } from "@/components/ui/skeleton"

interface AnnouncementDetailsDialogProps {
  announcement: Announcement | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AnnouncementDetailsDialog({ announcement, open, onOpenChange }: AnnouncementDetailsDialogProps) {
  const [photos, setPhotos] = useState<PropertyPhoto[]>([])
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  useEffect(() => {
    if (announcement && open) {
      const fetchPhotos = async () => {
        try {
          setIsLoadingPhotos(true)
          setPhotoError(null)
          const propertyPhotos = await announcementService.getPropertyPhotos(announcement.property.propertyId)
          setPhotos(propertyPhotos)
        } catch (error) {
          setPhotoError("Impossible de charger les photos")
          console.error("Error fetching photos:", error)
        } finally {
          setIsLoadingPhotos(false)
        }
      }

      fetchPhotos()
    }
  }, [announcement, open])

  if (!announcement) return null

  const getStatusBadge = (statusId: number) => {
    switch (statusId) {
      case 1:
        return <Badge className="bg-yellow-100 text-yellow-800">Validation en cours</Badge>
      case 2:
        return <Badge className="bg-red-100 text-red-800">Refusé</Badge>
      case 3:
        return <Badge className="bg-green-100 text-green-800">En ligne</Badge>
      case 4:
        return <Badge className="bg-blue-100 text-blue-800">Conclus</Badge>
      case 5:
        return <Badge className="bg-gray-100 text-gray-800">Retiré</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {announcement.property.propertytype.propertyTypeName} - {announcement.property.ville.villeName}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] overflow-y-auto mt-4">
          <Tabs defaultValue="photos" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="details">Détails de l'annonce</TabsTrigger>
              <TabsTrigger value="property">Détails de la propriété</TabsTrigger>
            </TabsList>

            <TabsContent value="photos" className="mt-4">
              {isLoadingPhotos ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((n) => (
                    <Skeleton key={n} className="aspect-video w-full rounded-lg" />
                  ))}
                </div>
              ) : photoError ? (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">{photoError}</p>
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Aucune photo disponible</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.propertyPhotoId} className="relative aspect-video group">
                      <img
                        src={`http://dev-mani.tech:8000/static/property/photo/${photo.propertyPhotoName}`}
                        alt={`Photo ${photo.propertyPhotoId}`}
                        className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Code de l'annonce</span>
                  <span>{announcement.announcementCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Type d'annonce</span>
                  <span>{announcement.announcementtype.announcementTypeName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Prix</span>
                  <span className="text-xl font-bold text-green-600">
                    {announcementService.formatPrice(announcement.propertyPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Statut</span>
                  {getStatusBadge(announcement.announcementStatusID)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Vues</span>
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    <span>{announcement.announcementView}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Date de création</span>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{format(new Date(announcement.createdAt), "PPP", { locale: fr })}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="property" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Home className="w-5 h-5 mr-2" />
                    <span>{announcement.property.propertytype.propertyTypeName}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{announcement.property.ville.villeName}</span>
                  </div>
                  <div className="flex items-center">
                    <SquareFeet className="w-5 h-5 mr-2" />
                    <span>{announcement.property.propertyArea} m²</span>
                  </div>
                  <div className="flex items-center">
                    <Bed className="w-5 h-5 mr-2" />
                    <span>{announcement.property.bedroom} chambre(s)</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-5 h-5 mr-2" />
                    <span>{announcement.property.bathroom} salle(s) de bain</span>
                  </div>
                  <div className="flex items-center">
                    <Sofa className="w-5 h-5 mr-2" />
                    <span>{announcement.property.livingRoom} salon(s)</span>
                  </div>
                  <div className="flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    <span>{announcement.property.garagePlace} place(s) de garage</span>
                  </div>
                  <div className="flex items-center">
                    <Pool className="w-5 h-5 mr-2" />
                    <span>{announcement.property.piscine ? "Avec piscine" : "Sans piscine"}</span>
                  </div>
                </div>
                <div>
                  <span className="text-lg font-semibold">Niveau</span>
                  <p>{announcement.property.level.levelName}</p>
                </div>
                <div>
                  <span className="text-lg font-semibold">Description</span>
                  <p className="mt-2 text-gray-600">{announcement.propertyDescription}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

