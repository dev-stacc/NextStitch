'use client'

import { useState, type ReactNode } from 'react'
import { BreadcrumbProvider } from '@/src/contexts/BreadcrumbContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  return (
    <BreadcrumbProvider>
      <div className="flex flex-col h-[100dvh] overflow-hidden">
        <Navbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar open={sidebarOpen} />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 flex flex-col overflow-y-auto md:overflow-hidden">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </BreadcrumbProvider>
  )
}
