"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AlertCircle } from 'lucide-react'

import { validateProperty } from "@/lib/actions/property.actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Property } from "@/lib/types/property.types"

const validationSchema = z.object({
  approvalComment: z.string().optional(),
})

interface PropertyApprovalDialogProps {
  property: Property | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  mode: 'approve' | 'reject'
}

export function PropertyApprovalDialog({
  property,
  open,
  onOpenChange,
  onSuccess,
  mode
}: PropertyApprovalDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      approvalComment: "",
    },
  })

  if (!property) return null

  async function onSubmit(values: z.infer<typeof validationSchema>) {
    if (!property) return
    
    try {
      setIsSubmitting(true)
      const response = await validateProperty({
        propertyId: property.propertyId,
        propertyApproved: mode === 'approve' ? 1 : 0,
        approvalComment: mode === 'reject' ? values.approvalComment : null,
      })

      if (!response.success) {
        throw new Error(response.error)
      }

      toast({
        title: "Succès",
        description: mode === 'approve' 
          ? "La propriété a été approuvée avec succès"
          : "La propriété a été rejetée avec succès",
      })

      onSuccess?.()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la validation de la propriété",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className={`h-5 w-5 ${mode === 'approve' ? 'text-green-500' : 'text-red-500'}`} />
            {mode === 'approve' ? 'Approuver la propriété' : 'Rejeter la propriété'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'approve' 
              ? 'Êtes-vous sûr de vouloir approuver cette propriété ?'
              : 'Veuillez indiquer la raison du rejet de cette propriété.'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 rounded-lg border p-3">
          <div className="font-medium">Propriété #{property.propertyId}</div>
          <div className="text-sm text-muted-foreground">
            {property.propertytype.propertyTypeName} - {property.ville?.villeName}
          </div>
          <div className="text-sm text-muted-foreground">
            Propriétaire: {property.account?.accounTitle}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'reject' && (
              <FormField
                control={form.control}
                name="approvalComment"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Raison du rejet..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                variant={mode === 'approve' ? 'default' : 'destructive'}
              >
                {isSubmitting ? 'En cours...' : mode === 'approve' ? 'Approuver' : 'Rejeter'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

