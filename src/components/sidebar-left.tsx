'use client';

import * as React from 'react';
import {
  Calendar,
  ChartNoAxesCombined,
  Home,
  NotepadText,
  Telescope,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarHeader } from '@/components/ui/sidebar';
import { NavUser } from '@/components/nav-user';
import { useUserContext } from '@/contexts/user-context';
import { UserRole } from '../../services/api/type.api';

const routes = {
  navUserMain: [
    {
      title: 'Home',
      url: '/dashboard/user',
      icon: Home,
    },
    {
      title: 'Events',
      url: '/dashboard/user/events',
      icon: Calendar,
    },
    {
      title: 'Travel Plans',
      url: '/dashboard/user/travelPlans',
      icon: NotepadText,
    },
    {
      title: 'Explore',
      url: '/explore',
      icon: Telescope,
    },
  ],
  navAdminMain: [
    {
      title: 'Home',
      url: '/dashboard/admin',
      icon: Home,
    },
    {
      title: 'Reports',
      url: '/dashboard/admin/reports',
      icon: ChartNoAxesCombined,
    },
  ],
};

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUserContext();
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        {user && user.name && user.email && (
          <NavUser user={{ name: user.name, email: user.email }} />
        )}
        <NavMain
          items={
            user?.role === UserRole.ADMIN
              ? routes.navAdminMain
              : routes.navUserMain
          }
        />
      </SidebarHeader>
    </Sidebar>
  );
}
