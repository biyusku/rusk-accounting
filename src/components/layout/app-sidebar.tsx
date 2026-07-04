"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Home,
  Receipt,
  CreditCard,
  ArrowRightLeft,
  FileText,
  BarChart3,
  PieChart,
  Settings,
  LogOut,
  HelpCircle,
  ChevronsUpDown,
  Shield,
  type LucideIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { SettingsDialog } from "@/components/layout/settings-dialog"
import { UserManagementDialog } from "@/components/auth/UserManagementDialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/transactions", label: "İşlemler", icon: Receipt },
  { href: "/accounts", label: "Hesaplar", icon: CreditCard },
  { href: "/transfers", label: "Transfer", icon: ArrowRightLeft },
  { href: "/invoices", label: "Faturalar", icon: FileText },
  { href: "/reports", label: "Raporlar", icon: BarChart3 },
  { href: "/budget", label: "Bütçe", icon: PieChart },
]

const user = {
  name: "Rusk Kurumsal",
  email: "admin@rusk.com.tr",
  emailMasked: "a***@rusk.com.tr",
  initials: "RK",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { state, setOpenMobile } = useSidebar()
  const collapsed = state === "collapsed"
  const closeMobile = () => setOpenMobile(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [userMgmtOpen, setUserMgmtOpen] = useState(false)
  const [sessionUser, setSessionUser] = useState<{ name: string | null; email: string; initials: string; emailMasked: string; role?: string } | null>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: { name?: string | null; email?: string; role?: string }) => {
        if (data.email) {
          const name = data.name ?? data.email.split("@")[0] ?? "Kullanıcı";
          const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
          const [localPart, domain] = data.email.split("@");
          const emailMasked = `${localPart?.[0] ?? ""}***@${domain}`;
          setSessionUser({ name, email: data.email, initials, emailMasked, role: data.role });
        }
      })
      .catch(() => null);
  }, []);

  const displayUser = sessionUser ?? user;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Çıkış yapıldı.");
      router.push("/auth");
      router.refresh();
    } catch {
      toast.error("Çıkış yapılırken hata oluştu.");
    }
  }

  return (
    <>
      <Sidebar collapsible="icon" className="border-r-0" {...props}>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className={cn(
            "flex items-center py-3 px-2",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 min-w-0"
                onClick={closeMobile}
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-black uppercase tracking-widest text-sidebar-foreground/90">
                    Rusk Muhasebe
                  </p>
                  <p className="text-[10px] text-sidebar-foreground/40 font-medium">
                    v1.0.0
                  </p>
                </div>
              </Link>
            )}
            <SidebarTrigger className="bg-transparent text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent" />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-1">
                Ana Menü
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {MAIN_NAV.map((item) => {
                const isActive = item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "h-10 px-3 text-[14px] font-medium my-0.5 transition-all duration-200",
                        isActive
                          ? "bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      <Link href={item.href} onClick={closeMobile}>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <div className="border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex w-full items-center py-3.5 hover:bg-sidebar-accent transition-colors data-[state=open]:bg-sidebar-accent",
                collapsed ? "justify-center px-0" : "gap-3 px-4"
              )}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-[11px] font-bold text-sidebar-primary-foreground">
                  {displayUser.initials}
                </div>
                {!collapsed && (
                  <>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-[13px] font-semibold text-sidebar-foreground leading-tight">
                        {displayUser.name}
                      </p>
                      <p className="truncate text-[11px] text-sidebar-foreground/50 leading-tight mt-0.5">
                      {displayUser.emailMasked}
                    </p>
                    </div>
                    <ChevronsUpDown className="shrink-0 h-4 w-4 text-sidebar-foreground/40" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="center"
              sideOffset={8}
              className="w-52 bg-popover text-popover-foreground border border-border shadow-lg rounded-xl"
            >
              <DropdownMenuLabel className="font-normal px-3 py-2">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[13px] font-semibold text-foreground truncate">
                    {displayUser.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                  {displayUser.emailMasked}
                </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 px-3 py-2 text-[13px] text-foreground hover:bg-accent rounded-md"
                  onSelect={() => setSettingsOpen(true)}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Ayarlar
                </DropdownMenuItem>
                {sessionUser?.role === "admin" && (
                  <DropdownMenuItem
                    className="cursor-pointer flex items-center gap-2 px-3 py-2 text-[13px] text-foreground hover:bg-accent rounded-md"
                    onSelect={() => setUserMgmtOpen(true)}
                  >
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Kullanıcı Yönetimi
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link
                    href="/help"
                    className="cursor-pointer flex items-center gap-2 px-3 py-2 text-[13px] text-foreground hover:bg-accent rounded-md"
                  >
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    Yardım
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 text-[13px] text-destructive hover:bg-destructive/10 hover:text-destructive rounded-md focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <SidebarRail />
      </Sidebar>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <UserManagementDialog open={userMgmtOpen} onOpenChange={setUserMgmtOpen} />
    </>
  )
}
