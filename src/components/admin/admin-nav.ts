import type { LucideIcon } from 'lucide-react'
import {
  Battery,
  CircleDollarSign,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Wrench,
} from 'lucide-react'

export type AdminNavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export const adminNavItems: AdminNavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/llantas', label: 'Llantas', icon: Package },
  { href: '/admin/baterias', label: 'Baterías', icon: Battery },
  { href: '/admin/servicios', label: 'Servicios', icon: Wrench },
  { href: '/admin/marcas', label: 'Marcas', icon: Tag },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/ventas', label: 'Ventas', icon: CircleDollarSign },
]
