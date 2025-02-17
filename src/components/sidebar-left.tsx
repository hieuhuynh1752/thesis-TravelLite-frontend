'use client';

import * as React from 'react';
import { Home, Calendar } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarHeader } from '@/components/ui/sidebar';
import { NavUser } from '@/components/nav-user';

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
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
  ],
};

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <NavUser user={data.user} />
        <NavMain items={data.navMain} />
      </SidebarHeader>
    </Sidebar>
  );
}
