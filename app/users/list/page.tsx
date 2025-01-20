import { UsersTable } from "@/components/users/users-list"
import { Layout } from "@/components/layout"

export default function UsersPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Liste des Utilisateurs</h2>
          <p className="text-gray-600">Gérez les utilisateurs de votre plateforme immobilière</p>
        </div>
        <UsersTable />
      </div>
    </Layout>
  )
}

