"use client"

import { AlertCircle } from "lucide-react"

import { deleteProperty } from "@/lib/actions/property.actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Property } from "@/lib/types/property.types"

interface PropertyDeleteDialogProps {
  property: Property | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function PropertyDeleteDialog({ property, open, onOpenChange, onSuccess }: PropertyDeleteDialogProps) {
  const { toast } = useToast()

  if (!property) return null

  async function handleDelete() {
    try {
      if (!property) return
      const result = await deleteProperty(property.propertyId)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Succès",
        description: "La propriété a été supprimée avec succès",
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la propriété",
        variant: "destructive",
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action est irréversible.
          </AlertDialogDescription>
          {/* Move the property details outside of the description */}
          <div className="mt-2 rounded-lg border p-3">
            <div className="font-medium">Propriété #{property.propertyId}</div>
            <div className="text-sm text-muted-foreground">
              {property.propertytype.propertyTypeName} - {property.ville?.villeName}
            </div>
            <div className="text-sm text-muted-foreground">Propriétaire: {property.account?.accounTitle}</div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

