import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { validateAccount } from "@/lib/actions/account.actions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

interface UserProfileDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UserProfileDialog({ user, open, onOpenChange, onSuccess }: UserProfileDialogProps) {
  const [isApproving, setIsApproving] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const { toast } = useToast()
  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      firstWallet: "",
      accountTypeID: "",
      validationComment: "",
    },
  })

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    checkMobileView()
    window.addEventListener("resize", checkMobileView)
    return () => window.removeEventListener("resize", checkMobileView)
  }, [])

  useEffect(() => {
    return () => {
      // Remove scroll lock and aria-hidden when component unmounts
      document.body.style.removeProperty("pointer-events")
      document.body.removeAttribute("data-scroll-locked")
    }
  }, [])

  if (!user || !open) return null

  const showValidationTab = user?.account && !user.account.accountIsApproved

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Remove scroll lock and aria-hidden when dialog closes
      document.body.style.removeProperty("pointer-events")
      document.body.removeAttribute("data-scroll-locked")
    }
    onOpenChange(open)
  }

  async function onSubmit(values: z.infer<typeof validationSchema>) {
    if (!user) return
    try {
      const response = await validateAccount({
        userId: user.userId,
        firstWallet: Number(values.firstWallet),
        accountIsApproved: isApproving ? 1 : 0,
        accountTypeID: isApproving ? Number(values.accountTypeID) : 4,
        validationComment: isApproving ? null : values.validationComment || null,
      })

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Succès",
        description: isApproving ? "Le compte a été approuvé avec succès" : "Le compte a été désapprouvé avec succès",
      })

      onSuccess?.()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la validation du compte",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[95vw] md:max-w-3xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Profil de l'utilisateur</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="info" className="w-full">
          <TabsList
            className={`grid w-full ${isMobileView ? "grid-cols-2" : showValidationTab ? "grid-cols-4" : "grid-cols-3"}`}
          >
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="account">Compte professionnel</TabsTrigger>
            {showValidationTab && <TabsTrigger value="validation">Validation du compte</TabsTrigger>}
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            {user && (
              <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                  {user.userProfilePhoto ? (
                    <img
                      src={user.userProfilePhoto || "/placeholder.svg"}
                      alt={`${user.userFirstname} ${user.userLastname}`}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-2xl font-semibold text-gray-500">
                      {user.userFirstname[0]}
                      {user.userLastname[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {user.userFirstname} {user.userLastname}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.userEmail}</p>
                  <div
                    className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.userIsActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.userIsActive ? "Actif" : "Inactif"}
                  </div>
                </div>
              </div>
            )}
            {user && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Type d'utilisateur</h4>
                    <p className="mt-1">{user.usertype.userTypeName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Rôle</h4>
                    <p className="mt-1">{user.userrole.userRoleName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Téléphone</h4>
                    <p className="mt-1">{user.userPhoneNumber}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Genre</h4>
                    <p className="mt-1">{user.userGender ? "Homme" : "Femme"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Pays</h4>
                    <p className="mt-1">Code pays: {user.userCountry}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date d'inscription</h4>
                    <p className="mt-1">{format(new Date(user.createdAt), "PPP", { locale: fr })}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Dernière mise à jour</h4>
                    <p className="mt-1">{format(new Date(user.updatedAt), "PPP", { locale: fr })}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            {user && (
              <div className="grid gap-6 md:grid-cols-2">
                {user.userIdCardFront && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Carte d'identité (Recto)</h4>
                    <img
                     src={`http://dev-mani.tech:8000/static/account/user_idCard/${user.userIdCardFront}`}
                      alt="Carte d'identité recto"
                      className="w-full rounded-lg border"
                    />
                  </div>
                )}
                {user.userIdCardBack && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Carte d'identité (Verso)</h4>
                    <img
                     src={`http://dev-mani.tech:8000/static/account/user_idCard/${user.userIdCardBack}`}
                      alt="Carte d'identité verso"
                      className="w-full rounded-lg border"
                    />
                  </div>
                )}
                {!user.userIdCardFront && !user.userIdCardBack && (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    Aucun document d'identité fourni
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            {user?.account ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
                  {user.account.accountLogo && (
                    <div className="h-24 w-24 rounded-lg bg-gray-100">
                      <img
                        src={user.account.accountLogo || "/placeholder.svg"}
                        alt="Logo du compte"
                        className="h-full w-full rounded-lg object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{user.account.accounTitle}</h3>
                    <p className="text-sm text-muted-foreground">{user.account.accountEmail}</p>
                    <div className="mt-2 flex gap-2">
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.account.accountIsActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.account.accountIsActive ? "Actif" : "Inactif"}
                      </div>
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.account.accountIsApproved
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user.account.accountIsApproved ? "Approuvé" : "En attente"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Type de compte</h4>
                      <p className="mt-1">{user.account.accounttype.accountTypeName}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Numéro de compte</h4>
                      <p className="mt-1">{user.account.accountNumber}</p>
                    </div>
                    {user.account.accountDoc && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Document professionnel</h4>
                        <a
                          href={user.account.accountDoc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-blue-600 hover:underline"
                        >
                          Voir le document
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Date de création</h4>
                      <p className="mt-1">{format(new Date(user.account.createdAt), "PPP", { locale: fr })}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Dernière mise à jour</h4>
                      <p className="mt-1">{format(new Date(user.account.updatedAt), "PPP", { locale: fr })}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Aucun compte professionnel associé</div>
            )}
          </TabsContent>

          {showValidationTab && (
            <TabsContent value="validation" className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="firstWallet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Premier rechargement</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Montant en FCFA" {...field} />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type de compte" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ACCOUNT_TYPES.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
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

                  <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsApproving(!isApproving)}
                      className="w-full md:w-auto"
                    >
                      {isApproving ? "Désapprouver" : "Approuver"}
                    </Button>
                    <Button type="submit" className="w-full md:w-auto">
                      {isApproving ? "Approuver" : "Refuser"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

