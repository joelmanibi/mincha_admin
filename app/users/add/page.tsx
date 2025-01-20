import { Layout } from "@/components/layout"
import { AddUserForm } from "@/components/users/add-user-form"

export default function AddUserPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Ajouter un utilisateur</h2>
          <p className="text-gray-600">Créez un nouvel utilisateur en remplissant le formulaire ci-dessous</p>
        </div>
        <AddUserForm />
      </div>
    </Layout>
  )
}

