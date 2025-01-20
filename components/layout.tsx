import { NavHeader } from "@/components/nav-header"
import { SidebarNav } from "@/components/sidebar-nav"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-[#213B4C] p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">MINCHA ADMIN</h1>
        </div>
        <SidebarNav />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <NavHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

