'use client';

import * as React from 'react';
import { UserType } from '../../../../services/api/type.api';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteUser } from '../../../../services/api/user.api';
import { toast } from 'sonner';

export default function DeleteUserModal({
  userData,
  onClose,
}: {
  userData: UserType;
  onClose?(): void;
}) {
  const handleDelete = React.useCallback(async () => {
    try {
      await deleteUser(userData.id);
      toast('Delete successful!');
    } catch (err) {
      toast('Delete failed: ' + err);
    }
  }, [userData.id]);

  const handleModalClose = React.useCallback(
    (open: boolean) => {
      if (!open) {
        onClose?.();
      }
    },
    [onClose],
  );

  return (
    <Dialog onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <TrashIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete this user
            account and remove their data from our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <DialogFooter className="gap-4">
            <DialogClose>Cancel</DialogClose>
            <DialogClose asChild>
              <Button variant="destructive" onClick={() => handleDelete()}>
                <TrashIcon /> Delete
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
