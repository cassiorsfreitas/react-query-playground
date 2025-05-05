"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookmarkIcon as Pagination,
  InfinityIcon,
  Download,
  XCircle,
  Layers,
  Radio,
  TestTube,
  Zap,
  Home,
  BookOpen,
  ArrowsUpFromLine,
  ShieldX,
  Unplug,
  Workflow,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Getting Started</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/")}>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/basic")}>
                  <Link href="/basic">
                    <Zap className="h-4 w-4" />
                    <span>Basic Query</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/practices")}>
                  <Link href="/practices">
                    <BookOpen className="h-4 w-4" />
                    <span>Best Practices</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Core Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/refetch")}>
                  <Link href="/refetch">
                    <Radio className="h-4 w-4" />
                    <span>Refetch</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/invalidation")}>
                  <Link href="/invalidation">
                    <XCircle className="h-4 w-4" />
                    <span>Invalidation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dependent")}>
                  <Link href="/dependent">
                    <Workflow className="h-4 w-4" />
                    <span>Dependent Queries</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/optimistic")}>
                  <Link href="/optimistic">
                    <ArrowsUpFromLine className="h-4 w-4" />
                    <span>Optimistic Updates</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Advanced Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/pagination")}>
                  <Link href="/pagination">
                    <Pagination className="h-4 w-4" />
                    <span>Pagination</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/infinite")}>
                  <Link href="/infinite">
                    <InfinityIcon className="h-4 w-4" />
                    <span>Infinite Queries</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/prefetching")}>
                  <Link href="/prefetching">
                    <Download className="h-4 w-4" />
                    <span>Prefetching</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/cancellation")}>
                  <Link href="/cancellation">
                    <ShieldX className="h-4 w-4" />
                    <span>Query Cancellation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/suspense")}>
                  <Link href="/suspense">
                    <Layers className="h-4 w-4" />
                    <span>Suspense Mode</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/websocket")}>
                  <Link href="/websocket">
                    <Unplug className="h-4 w-4" />
                    <span>WebSocket/Realtime</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/testing")}>
                  <Link href="/testing">
                    <TestTube className="h-4 w-4" />
                    <span>Testing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
