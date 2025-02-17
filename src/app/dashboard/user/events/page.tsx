import { SidebarLeft } from '@/components/sidebar-left';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserRole } from '../../../../../services/api/type.api';

export default async function UserEvents() {
  const cookieStore = await cookies();
  const role = cookieStore.get('role')?.value;

  if (role !== UserRole.USER) {
    redirect('/dashboard'); // Prevent access if not a regular user
  }

  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="p-2 bg-gray-100 rounded-md">
              <a>Events </a>
            </div>
          </div>
        </header>
        <div className="flex flex-1 gap-4 p-4">
          <div className="ml-4 h-full w-[30vw] max-w-3xl rounded-xl bg-muted/50" />
          <Separator orientation="vertical" />
          <div className="h-full w-full rounded-xl bg-muted/50" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
