import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { validateAccount } from "@/lib/actions/account.actions"
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/types/user.types"

const ACCOUNT_TYPES = [
  { id: 1, name: "Experts" },
  { id: 2, name: "Professionnels" },
  { id: 3, name: "Particuliers" },
]

const validationSchema = z.object({
  firstWallet: z.string().min(1, "Le montant est requis"),
  accountTypeID: z.string().optional(),
  validationComment: z.string().optional().default(""),
})

interface AccountValidationDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AccountValidationDialog({
  user,
  open,
  onOpenChange,
  onSuccess
}: AccountValidationDialogProps) {
  const [isApproving, setIsApproving] = useState(true)
  const { toast } = useToast()
  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      firstWallet: "",
      accountTypeID: "",
      validationComment: "",
    },
  })

  // Early return if no user or if account is already approved
  if (!user?.account || user.account.accountIsApproved) return null

  async function onSubmit(values: z.infer<typeof validationSchema>) {
    if (!user) return;
    try {
      const response = await validateAccount({
        userId: user.userId,
        firstWallet: Number(values.firstWallet),
        accountIsApproved: isApproving ? 1 : 0,
        accountTypeID: isApproving ? Number(values.accountTypeID) : 4,
        validationComment: isApproving ? null : (values.validationComment || null),
      })

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Succès",
        description: isApproving 
          ? "Le compte a été approuvé avec succès"
          : "Le compte a été désapprouvé avec succès",
      })

      onOpenChange(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la validation du compte",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isApproving ? "Approuver le compte" : "Désapprouver le compte"}
          </DialogTitle>
          <DialogDescription>
            {isApproving 
              ? "Veuillez remplir les informations suivantes pour approuver le compte."
              : "Veuillez indiquer la raison du refus."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstWallet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Premier rechargement</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Montant en FCFA"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isApproving && (
              <FormField
                control={form.control}
                name="accountTypeID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de compte</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type de compte" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACCOUNT_TYPES.map((type) => (
                          <SelectItem
                            key={type.id}
                            value={type.id.toString()}
                          >
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!isApproving && (
              <FormField
                control={form.control}
                name="validationComment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raison du refus</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Veuillez expliquer la raison du refus"
                        {...field}
                        value={field.value ?? ""}
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
                onClick={() => setIsApproving(!isApproving)}
              >
                {isApproving ? "Désapprouver" : "Approuver"}
              </Button>
              <Button type="submit">
                {isApproving ? "Approuver" : "Refuser"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

