'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { usersColumns } from '../ui/table/columns.view';
import { DataTable } from '@/components/ui/table/data-table.view';

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
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-4 items-center self-end">
        <Button variant={'outline'}>Upload CSV...</Button>
        <CreateUserModal onClose={handleReload} />
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
