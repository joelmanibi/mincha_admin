"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import * as z from "zod"
import { Loader2, Check, ChevronDown, Building2 } from "lucide-react"
import { useState, useEffect } from "react"

import { API_ROUTES } from "@/lib/constants/routes"
import { propertyService } from "@/lib/services/property.service"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { City } from "@/lib/types/city.types"
import type { Account } from "@/lib/types/account.types"
import type { PropertyLevel } from "@/lib/types/property-level.types"
import type { PropertyType } from "@/lib/types/property-type.types"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const ACCEPTED_DOC_TYPES = ["application/pdf"]

const formSchema = z.object({
  propertyTypeID: z.string().min(1, "Le type de bien est requis"),
  propertyLocation: z.string().min(1, "La localisation est requise"),
  propertyPrice: z.string().min(1, "Le prix est requis"),
  propertyArea: z.string().min(1, "La surface est requise"),
  livingRoom: z.string().min(1, "Le nombre de salons est requis"),
  bedroom: z.string().min(1, "Le nombre de chambres est requis"),
  bathroom: z.string().min(1, "Le nombre de salles de bain est requis"),
  propertyLevel: z.string().min(1, "Le niveau est requis"),
  accountId: z.string().min(1, "Le compte propriétaire est requis"),
  property_photo: z
    .custom<FileList>()
    .refine((files) => files?.length >= 1, "Au moins une photo est requise")
    .refine((files) => {
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > MAX_FILE_SIZE) return false
      }
      return true
    }, "La taille maximale par fichier est de 5MB")
    .refine((files) => {
      for (let i = 0; i < files.length; i++) {
        if (!ACCEPTED_IMAGE_TYPES.includes(files[i].type)) return false
      }
      return true
    }, "Seuls les formats .jpg, .jpeg, .png et .webp sont acceptés"),
  propertyDoc: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Un document est requis")
    .refine((files) => files[0]?.size <= MAX_FILE_SIZE, "La taille maximale est de 5MB")
    .refine((files) => ACCEPTED_DOC_TYPES.includes(files[0]?.type), "Seul le format PDF est accepté"),
})

const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([])
const [isLoadingPropertyTypes, setIsLoadingPropertyTypes] = useState(true)
const [isLoadingCities, setIsLoadingCities] = useState(true)
const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
const [openCityCombobox, setOpenCityCombobox] = useState(false)
const [openAccountCombobox, setOpenAccountCombobox] = useState(false)
const [levels, setLevels] = useState<PropertyLevel[]>([])
const [isLoadingLevels, setIsLoadingLevels] = useState(true)
const [cities, setCities] = useState<City[]>([])
const [accounts, setAccounts] = useState<Account[]>([])

export function AddPropertyForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyTypeID: "",
      propertyLocation: "",
      propertyPrice: "",
      propertyArea: "",
      livingRoom: "1",
      bedroom: "1",
      bathroom: "1",
      propertyLevel: "1",
      accountId: "",
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("micha_auth_token="))
          ?.split("=")[1]

        if (!authToken) {
          throw new Error("Token d'authentification manquant")
        }

        const headers = {
          Authorization: `Bearer ${authToken}`,
          Accept: "*/*",
        }

        // Fetch cities
        setIsLoadingCities(true)
        const citiesResponse = await fetch(API_ROUTES.GET_ALL_CITIES, { headers })
        if (!citiesResponse.ok) {
          throw new Error("Erreur lors de la récupération des villes")
        }
        const citiesData = await citiesResponse.json()
        setCities(citiesData.city)
        setIsLoadingCities(false)

        // Fetch accounts
        setIsLoadingAccounts(true)
        const accountsResponse = await fetch(API_ROUTES.GET_ALL_ACCOUNTS, { headers })
        if (!accountsResponse.ok) {
          throw new Error("Erreur lors de la récupération des comptes")
        }
        const accountsData = await accountsResponse.json()
        // Filter only approved accounts
        setAccounts(accountsData.account.filter((acc: Account) => acc.accountIsApproved))
        setIsLoadingAccounts(false)

        // Fetch levels
        setIsLoadingLevels(true)
        const levelsResponse = await fetch(API_ROUTES.GET_ALL_LEVELS, { headers })
        if (!levelsResponse.ok) {
          throw new Error("Erreur lors de la récupération des niveaux")
        }
        const levelsData = await levelsResponse.json()
        setLevels(levelsData.level)
        setIsLoadingLevels(false)

        // Fetch property types
        setIsLoadingPropertyTypes(true)
        const propertyTypesResponse = await fetch(API_ROUTES.GET_ALL_PROPERTY_TYPES, { headers })
        if (!propertyTypesResponse.ok) {
          throw new Error("Erreur lors de la récupération des types de propriété")
        }
        const propertyTypesData = await propertyTypesResponse.json()
        setPropertyTypes(propertyTypesData.propertyType)
        setIsLoadingPropertyTypes(false)
      } catch (error) {
        console.error("Erreur:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les données nécessaires",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [toast])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("propertyTypeID", values.propertyTypeID)
      formData.append("propertyLocation", values.propertyLocation)
      formData.append("propertyPrice", values.propertyPrice)
      formData.append("propertyArea", values.propertyArea)
      formData.append("livingRoom", values.livingRoom)
      formData.append("bedroom", values.bedroom)
      formData.append("bathroom", values.bathroom)
      formData.append("propertyLevel", values.propertyLevel)
      formData.append("accountId", values.accountId)

      // Append all property photos
      for (let i = 0; i < values.property_photo.length; i++) {
        formData.append("property_photo", values.property_photo[i])
      }

      // Append property document
      formData.append("propertyDoc", values.propertyDoc[0])

      // Log the form data
      console.log("Form Values:", values)
      console.log("FormData entries:")
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1])
      }

      const result = await propertyService.addProperty(formData)

      if (result.success) {
        toast({
          title: "Succès",
          description: "La propriété a été ajoutée avec succès",
        })
        router.push("/properties")
        router.refresh()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="propertyTypeID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de bien</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type.propertyTypeId} value={type.propertyTypeId.toString()}>
                            {type.propertyTypeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyLocation"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Localisation</FormLabel>
                    <Popover open={openCityCombobox} onOpenChange={setOpenCityCombobox}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCityCombobox}
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                          >
                            {field.value
                              ? cities.find((city) => city.villeId.toString() === field.value)?.villeName
                              : "Sélectionner une ville"}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Rechercher une ville..." className="h-9" />
                          <CommandEmpty>Aucune ville trouvée.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {cities.map((city) => (
                              <CommandItem
                                value={city.villeName}
                                key={city.villeId}
                                onSelect={() => {
                                  form.setValue("propertyLocation", city.villeId.toString())
                                  setOpenCityCombobox(false)
                                }}
                              >
                                {city.villeName}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    city.villeId.toString() === field.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="500000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surface (m²)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="livingRoom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de salons</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bedroom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de chambres</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bathroom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de salles de bain</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level.levelId} value={level.levelId.toString()}>
                            {level.levelName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Account Selection Field */}
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Compte propriétaire</FormLabel>
                    <Popover open={openAccountCombobox} onOpenChange={setOpenAccountCombobox}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openAccountCombobox}
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                          >
                            {field.value
                              ? accounts.find((account) => account.accountId.toString() === field.value)?.accounTitle
                              : "Sélectionner un compte"}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Rechercher un compte..." className="h-9" />
                          <CommandEmpty>Aucun compte trouvé.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {accounts.map((account) => (
                              <CommandItem
                                value={account.accounTitle}
                                key={account.accountId}
                                onSelect={() => {
                                  form.setValue("accountId", account.accountId.toString())
                                  setOpenAccountCombobox(false)
                                }}
                                className="flex items-center gap-2"
                              >
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                  <span>{account.accounTitle}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {account.accounttype.accountTypeName}
                                  </span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    account.accountId.toString() === field.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="property_photo"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Photos</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        onChange={(e) => onChange(e.target.files)}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Formats acceptés : JPG, PNG, WebP. Taille max : 5MB</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyDoc"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Document de propriété</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept={ACCEPTED_DOC_TYPES.join(",")}
                        onChange={(e) => onChange(e.target.files)}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Format accepté : PDF. Taille max : 5MB</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Ajout en cours..." : "Ajouter la propriété"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

