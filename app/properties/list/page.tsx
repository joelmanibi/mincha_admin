import { PropertiesTable } from "@/components/properties/properties-table"
import { Layout } from "@/components/layout"

export default function PropertiesPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Liste des Propriétés</h2>
          <p className="text-gray-600">Gérez les propriétés de votre plateforme immobilière</p>
        </div>
        <PropertiesTable />
      </div>
    </Layout>
  )
}

