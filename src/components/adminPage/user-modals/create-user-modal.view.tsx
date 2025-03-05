'use client';

import * as React from 'react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { register } from '../../../../services/api/auth.api';
import { toast } from 'sonner';

export default function CreateUserModal({ onClose }: { onClose?(): void }) {
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');

  const handleUsernameChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(event.target.value);
    },
    [],
  );

  const handleEmailChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(event.target.value);
    },
    [],
  );

  const handleCreate = React.useCallback(async () => {
    try {
      await register(email, email, username).then(() => onClose?.());
      toast('Create new User successful!');
    } catch (err) {
      toast('Create failed: ' + err);
    }
  }, [email, username, onClose]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create...</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Declare user information here. Click save when you&#39;re done.
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={handleEmailChange}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={() => handleCreate()}>Create</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
