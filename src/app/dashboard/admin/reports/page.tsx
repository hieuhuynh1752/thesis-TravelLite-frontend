'use client';
import * as React from 'react';
import Cookie from 'js-cookie';
import {
  EventParticipantType,
  UserRole,
} from '../../../../../services/api/type.api';
import { redirect } from 'next/navigation';
import { getMe } from '../../../../../services/api/auth.api';
import { useUserContext } from '@/contexts/user-context';
import { getUserById } from '../../../../../services/api/user.api';
import { getAllEventParticipants } from '../../../../../services/api/event-participant.api';
import OverviewTravelHistoryReport from '@/components/userPage/overview-travel-history-report.view';

export default function ReportsPage() {
  const { setUser } = useUserContext();
  const [userId, setUserId] = React.useState<number | undefined>();
  const [allEventParticipants, setAllEventParticipants] = React.useState<
    EventParticipantType[]
  >([]);

  const handleGetUserData = React.useCallback(() => {
    if (!!userId) {
      getUserById(userId).then((value) => {
        setUser?.({
          id: value.id,
          name: value.name,
          email: value.email,
          role: value.role,
        });
      });
      getAllEventParticipants().then((value) => {
        setAllEventParticipants?.(value);
      });
    }
  }, [userId, setUser]);

  React.useEffect(() => {
    const role = Cookie.get('role');

    if (role !== UserRole.ADMIN) {
      redirect('/dashboard');
    } else {
      getMe().then((userId) => setUserId(userId));
      handleGetUserData();
    }
  }, [handleGetUserData]);
  return (
    <OverviewTravelHistoryReport events={allEventParticipants} adminMode />
  );
}
