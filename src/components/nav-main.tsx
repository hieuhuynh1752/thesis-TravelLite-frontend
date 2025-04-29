'use client';

import * as React from 'react';
import { type LucideIcon } from 'lucide-react';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePathname, redirect } from 'next/navigation';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  const handleSidebarMenuItemClick = React.useCallback((path: string) => {
    redirect(path);
  }, []);

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item, key) => (
          <div key={key}>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => handleSidebarMenuItemClick(item.url)}
                isActive={
                  pathname === item.url ||
                  (pathname.split('/')[1] === 'explore' &&
                    item.url === '/explore')
                }
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </div>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
