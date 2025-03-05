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
import { EditIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateUser } from '../../../../services/api/user.api';
import { toast } from 'sonner';

export default function EditUserModal({
  userData,
  onClose,
}: {
  userData: UserType;
  onClose?(): void;
}) {
  const [username, setUsername] = React.useState(userData.name);

  const handleUsernameChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(event.target.value);
    },
    [],
  );

  const handleUpdate = React.useCallback(async () => {
    try {
      await updateUser(userData.id, { name: username } as UserType).then(() =>
        onClose?.(),
      );
      toast('User Update successful!');
    } catch (err) {
      toast('Update failed: ' + err);
    }
  }, [onClose, userData.id, username]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-400">
          <EditIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&#39;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={username}
              onChange={handleUsernameChange}
              className="col-span-3"
            />
          </div>
          {/*<div className="grid grid-cols-4 items-center gap-4">*/}
          {/*    <Label htmlFor="username" className="text-right">*/}
          {/*        Username*/}
          {/*    </Label>*/}
          {/*    <Input id="username" value="@peduarte" className="col-span-3"/>*/}
          {/*</div>*/}
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={() => handleUpdate()}>Save changes</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
