import { AnnouncementsTable } from "@/components/Announcements/AnnouncementTable"
import { Layout } from "@/components/layout"

export default function AnnouncementsListPage() {
  return (
   
    <Layout>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Liste des annonces</h2>
              <p className="text-gray-600">Gérez les annonces de votre plateforme immobilière</p>
            </div>
            <AnnouncementsTable />
          </div>
        </Layout>
  )
}

