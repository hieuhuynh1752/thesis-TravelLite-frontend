'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { usersColumns } from './columns.view';
import { DataTable } from '@/components/adminPage/data-table.view';

import EditUserModal from '@/components/adminPage/user-modals/edit-user-modal.view';
import DeleteUserModal from '@/components/adminPage/user-modals/delete-user-modal.view';
import CreateUserModal from '@/components/adminPage/user-modals/create-user-modal.view';
import { UserType } from '../../../services/api/type.api';

export default function UserTabContent({
  data,
  handleReload,
}: {
  data: UserType[];
  handleReload?(): void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <CreateUserModal onClose={handleReload} />
        <span>Or</span>
        <Button variant={'outline'}>Upload CSV...</Button>
      </div>
      <DataTable
        columns={[
          ...usersColumns,
          {
            id: 'actions',
            cell: ({ row }) => {
              return (
                <div className="flex gap-2">
                  <EditUserModal
                    userData={row.original}
                    onClose={handleReload}
                  />
                  <DeleteUserModal
                    userData={row.original}
                    onClose={handleReload}
                  />
                </div>
              );
            },
          },
        ]}
        data={data}
      />
    </div>
  );
}
