'use client';

import { ColumnDef } from '@tanstack/react-table';
import { UserType } from '../../../services/api/type.api';

export const usersColumns: ColumnDef<UserType>[] = [
  {
    accessorKey: 'name',
    header: 'Full Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
];
