'use client';
import { AppSidebar } from '@/components/app-sidebar';
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from '@/components/ui/breadcrumb';
// import { Separator } from '@/components/ui/separator';
import * as React from 'react';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import Cookie from 'js-cookie';
import { redirect } from 'next/navigation';
import { UserRole } from '../../../../services/api/type.api';
import UserTabContent from '@/components/adminPage/users-tab.view';
import { getAllUsers } from '../../../../services/api/user.api';
import { UserContextProvider } from '@/contexts/user-context';

export default function AdminDashboard() {
  const [selectedPage, setSelectedPage] = React.useState('users');
  const [userData, setUserData] = React.useState([]);

  const handleGetUsersData = React.useCallback(() => {
    getAllUsers().then((value) => setUserData(value));
  }, []);

  const handleSetSelectedPage = React.useCallback((page: string) => {
    setSelectedPage(page);
  }, []);

  React.useEffect(() => {
    const role = Cookie.get('role');

    if (role !== UserRole.ADMIN) {
      redirect('/dashboard');
    } else {
      handleGetUsersData();
    }
  }, [handleGetUsersData]);

  return (
    <UserContextProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 fixed top-0 shrink-0 items-center gap-2 transition-[width,height] bg-white w-[100vw] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
          </header>
          <div className="flex flex-1 flex-col p-4 pt-20">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div
                className={`rounded-xl border-muted border-2 rounded-b-none ${selectedPage === 'users' ? 'bg-white' : 'bg-muted/50'}`}
                onClick={() => handleSetSelectedPage('users')}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between p-4">
                    <span className="font-bold text-xl">Users</span>
                    <span className="font-bold text-2xl">
                      {userData.length}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`rounded-xl border-muted border-2 rounded-b-none ${selectedPage === 'events' ? 'bg-white' : 'bg-muted/50'}`}
                onClick={() => handleSetSelectedPage('events')}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between p-4">
                    <span className="font-bold text-xl">Events</span>
                    {/*get events size here*/}
                    <span className="font-bold text-2xl">69</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="min-h-[100vh] flex-1 border-muted rounded-tr-xl rounded-b-xl border-2 md:min-h-min">
              <div className=" flex flex-col overflow-hidden h-[70vh]">
                <div className="overflow-y-auto p-8">
                  {selectedPage === 'users' && (
                    <UserTabContent
                      data={userData}
                      handleReload={handleGetUsersData}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </UserContextProvider>
  );
}
