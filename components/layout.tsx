"use client"

import { useState, useEffect } from "react"
import { Menu } from "lucide-react"

import { NavHeader } from "@/components/nav-header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
      }, 300) // Adjust this value to match your transition duration

      return () => clearTimeout(timer)
    }
  }, [open])

  const handleOpenChange = (isOpen: boolean) => {
    setIsTransitioning(true)
    setOpen(isOpen)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild className="md:hidden absolute top-3 left-4 z-50">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-[#213B4C]" forceMount>
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="h-full flex flex-col">
            <div className="p-4 mb-8">
              <h1 className="text-xl font-bold text-white">MINCHA ADMIN</h1>
            </div>
            <SidebarNav closeSheet={() => handleOpenChange(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <div className="hidden md:block w-64 fixed inset-y-0 bg-[#213B4C] p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">MINCHA ADMIN</h1>
        </div>
        <SidebarNav />
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex-1 flex flex-col">
        <NavHeader />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

