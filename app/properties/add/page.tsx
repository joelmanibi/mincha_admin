import { AddPropertyForm } from "@/components/properties/add-property-form"
import { Layout } from "@/components/layout"

export default function AddPropertyPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Ajouter une propriété</h2>
          <p className="text-gray-600">Créez une nouvelle propriété en remplissant le formulaire ci-dessous</p>
        </div>
        <AddPropertyForm />
      </div>
    </Layout>
  )
}

