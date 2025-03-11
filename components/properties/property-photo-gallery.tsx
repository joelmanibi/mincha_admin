"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { PropertyPhoto } from "@/lib/types/property.types"

interface PropertyPhotoGalleryProps {
  photos: PropertyPhoto[]
  isMobileView: boolean
}

export function PropertyPhotoGallery({ photos, isMobileView }: PropertyPhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PropertyPhoto | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
  }

  const getFullImageUrl = (photoName: string) => {
    return `http://dev-mani.tech:8000/static/property/photo/${photoName}`
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.propertyPhotoId}
            className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
            onClick={() => {
              setSelectedPhoto(photo)
              setCurrentIndex(index)
            }}
          >
            <img
              src={getFullImageUrl(photo.propertyPhotoName) || "/placeholder.svg"}
              alt={`Photo ${index + 1}`}
              className="object-cover w-full h-full transition-transform group-hover:scale-110"
            />
          </div>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 bg-transparent border-0">
          <div className="relative aspect-square md:aspect-[4/3] bg-black">
            {selectedPhoto && (
              <img
                src={getFullImageUrl(photos[currentIndex].propertyPhotoName) || "/placeholder.svg"}
                alt={`Photo ${currentIndex + 1}`}
                className="w-full h-full object-contain"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

