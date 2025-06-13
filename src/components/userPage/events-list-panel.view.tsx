'use client';
import * as React from 'react';
import { useUserContext } from '@/contexts/user-context';
import Cookie from 'js-cookie';
import { UserRole } from '../../../services/api/type.api';
import { redirect } from 'next/navigation';
import { getMe } from '../../../services/api/auth.api';
import { getUserById } from '../../../services/api/user.api';
import EventsListPanelItems from '@/components/userPage/events-list-panel-items.view';

interface EventsListPanelProps {
  extended?: boolean;
  adminMode?: boolean;
}

const EventsListPanel = ({ extended, adminMode }: EventsListPanelProps) => {
  const { setUser, setEventsAsParticipantList } = useUserContext();
  const [userId, setUserId] = React.useState<number | undefined>();

  const handleGetUserData = React.useCallback(() => {
    if (!!userId) {
      getUserById(userId).then((value) => {
        setUser?.({
          id: value.id,
          name: value.name,
          email: value.email,
          role: value.role,
        });
        setEventsAsParticipantList?.(value.eventsParticipated);
      });
    }
  }, [userId, setUser, setEventsAsParticipantList]);

  React.useEffect(() => {
    if (!adminMode) {
      const role = Cookie.get('role');
      if (role !== UserRole.USER) {
        redirect('/dashboard');
      } else {
        getMe().then((userId) => setUserId(userId));
        handleGetUserData();
      }
    }
  }, [handleGetUserData, adminMode]);

  return (
    <div
      className={`flex flex-col gap-4 ${extended ? 'w-1/4 h-full' : 'w-1/2'}`}
    >
      <EventsListPanelItems extended={extended} adminMode={adminMode} />
    </div>
  );
};

export default EventsListPanel;
