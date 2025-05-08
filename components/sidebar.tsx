"use client";
import { usePathname, useRouter } from "next/navigation";
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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCallback } from "react";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleNavigation = useCallback(
    (path: string) => {
      if (isMobile) {
        setOpenMobile(false);
        setTimeout(() => {
          router.push(path);
        }, 100);
      }
      router.push(path);
    },
    [isMobile, router, setOpenMobile]
  );

  return (
    <Sidebar
      collapsible={isMobile ? "offcanvas" : "icon"}
      className="[--sheet-duration:150ms]"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Getting Started</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/")}
                  tooltip="Home"
                  onClick={() => handleNavigation("/")}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/basic")}
                  tooltip="Basic Query"
                  onClick={() => handleNavigation("/basic")}
                >
                  <Zap className="h-4 w-4" />
                  <span>Basic Query</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/practices")}
                  tooltip="Best Practices"
                  onClick={() => handleNavigation("/practices")}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Best Practices</span>
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
                <SidebarMenuButton
                  isActive={isActive("/refetch")}
                  tooltip="Refetch"
                  onClick={() => handleNavigation("/refetch")}
                >
                  <Radio className="h-4 w-4" />
                  <span>Refetch</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/invalidation")}
                  tooltip="Invalidation"
                  onClick={() => handleNavigation("/invalidation")}
                >
                  <XCircle className="h-4 w-4" />
                  <span>Invalidation</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/dependent")}
                  tooltip="Dependent Queries"
                  onClick={() => handleNavigation("/dependent")}
                >
                  <Workflow className="h-4 w-4" />
                  <span>Dependent Queries</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/optimistic")}
                  tooltip="Optimistic Updates"
                  onClick={() => handleNavigation("/optimistic")}
                >
                  <ArrowsUpFromLine className="h-4 w-4" />
                  <span>Optimistic Updates</span>
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
                <SidebarMenuButton
                  isActive={isActive("/pagination")}
                  tooltip="Pagination"
                  onClick={() => handleNavigation("/pagination")}
                >
                  <Pagination className="h-4 w-4" />
                  <span>Pagination</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/infinite")}
                  tooltip="Infinite Queries"
                  onClick={() => handleNavigation("/infinite")}
                >
                  <InfinityIcon className="h-4 w-4" />
                  <span>Infinite Queries</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/prefetching")}
                  tooltip="Prefetching"
                  onClick={() => handleNavigation("/prefetching")}
                >
                  <Download className="h-4 w-4" />
                  <span>Prefetching</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/cancellation")}
                  tooltip="Query Cancellation"
                  onClick={() => handleNavigation("/cancellation")}
                >
                  <ShieldX className="h-4 w-4" />
                  <span>Query Cancellation</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/suspense")}
                  tooltip="Suspense Mode"
                  onClick={() => handleNavigation("/suspense")}
                >
                  <Layers className="h-4 w-4" />
                  <span>Suspense Mode</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/websocket")}
                  tooltip="WebSocket/Realtime"
                  onClick={() => handleNavigation("/websocket")}
                >
                  <Unplug className="h-4 w-4" />
                  <span>WebSocket/Realtime</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/testing")}
                  tooltip="Testing"
                  onClick={() => handleNavigation("/testing")}
                >
                  <TestTube className="h-4 w-4" />
                  <span>Testing</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
