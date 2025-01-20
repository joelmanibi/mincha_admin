"use client"

import { Building2, ChevronDown, LayoutDashboard, Users } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface NavItem {
  title: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  submenu?: NavItem[]
}

const navItems: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Utilisateurs",
    icon: Users,
    submenu: [
      {
        title: "Liste des utilisateurs",
        href: "/users/list",
      },
      {
        title: "Ajouter un utilisateur",
        href: "/users/add",
      }
    ]
  },
  {
    title: "Propriétés",
    icon: Building2,
    submenu: [
      {
        title: "Liste des propriétés",
        href: "/properties/list",
      },
      {
        title: "Ajouter une propriété",
        href: "/properties/add",
      }
    ]
  }
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {navItems.map((item, index) => {
        if (item.submenu) {
          return (
            <Collapsible key={index} className="w-full">
              <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2 text-white hover:bg-white/10 rounded-md">
                <div className="flex items-center gap-2">
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.title}</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 mt-1">
                {item.submenu.map((subItem, subIndex) => (
                  <Link
                    key={subIndex}
                    href={subItem.href || '#'}
                    className={`flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-md ${
                      pathname === subItem.href ? 'bg-white/20' : ''
                    }`}
                  >
                    <span className="h-1 w-1 rounded-full bg-current" />
                    <span>{subItem.title}</span>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )
        }

        return (
          <Link
            key={index}
            href={item.href || '#'}
            className={`flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-md ${
              pathname === item.href ? 'bg-white/20' : ''
            }`}
          >
            {item.icon && <item.icon className="h-5 w-5" />}
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

