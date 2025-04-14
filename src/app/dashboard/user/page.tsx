'use client';
import * as React from 'react';
import { Separator } from '@/components/ui/separator';

import Cookie from 'js-cookie';
import { redirect } from 'next/navigation';
import { UserRole } from '../../../../services/api/type.api';
import { useUserContext } from '@/contexts/user-context';
import { getUserById } from '../../../../services/api/user.api';
import { getMe } from '../../../../services/api/auth.api';
import TodayEventsVerticalStepper from '@/components/userPage/today-events-vertical-stepper.view';
import PendingEvents from '@/components/userPage/pending-events.view';

import {
  calculateTotalCo2,
  flattenTravelHistoryChartData,
  flattenTravelPreferencesHistoryChartData,
  getTravelHistoryData,
} from '@/utils/charts-util';
import TravelHistoryChart from '@/components/charts/travel-history-chart.view';
import TravelPreferencesHistoryChart from '@/components/charts/travel-preference-pie-chart.view';

export default function UserDashboard() {
  const { user, setUser, events, setEvents } = useUserContext();
  const [userId, setUserId] = React.useState<number | undefined>();
  const [today, setToday] = React.useState<string>('');

  const travelHistoryData = React.useMemo(() => {
    if (events) {
      return getTravelHistoryData(events);
    }
    return undefined;
  }, [events]);

  const travelHistoryChartData = React.useMemo(() => {
    if (travelHistoryData) {
      return flattenTravelHistoryChartData(travelHistoryData);
    }
  }, [travelHistoryData]);

  const travelPreferencesChartData = React.useMemo(() => {
    if (travelHistoryData) {
      return flattenTravelPreferencesHistoryChartData(travelHistoryData);
    }
  }, [travelHistoryData]);

  const handleGetUserData = React.useCallback(() => {
    if (!!userId) {
      getUserById(userId).then((value) => {
        setUser?.({
          id: value.id,
          name: value.name,
          email: value.email,
          role: value.role,
        });
        setEvents?.(value.eventsParticipated);
      });
    }
  }, [userId, setUser, setEvents]);

  React.useEffect(() => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    });
    setToday(currentDate);
  }, [setToday]);

  React.useEffect(() => {
    const role = Cookie.get('role');
    if (role !== UserRole.USER) {
      redirect('/dashboard');
    } else {
      getMe().then((userId) => setUserId(userId));
      handleGetUserData();
    }
  }, [handleGetUserData]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <p>
          Hello{' '}
          <a className="bg-gray-100 p-2 font-mono rounded">{user?.name}</a> !
        </p>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-1 gap-4">
          <div className="flex h-fit w-1/2 max-w-3xl rounded-xl bg-muted/50">
            <TravelHistoryChart data={travelHistoryChartData} />
          </div>
          <Separator orientation="vertical" className="h-full" />
          <div className="flex h-fit w-1/2 max-w-3xl rounded-xl bg-muted/50">
            <TravelPreferencesHistoryChart
              chartData={travelPreferencesChartData}
              totalTravels={travelHistoryData?.length}
              totalCo2={
                travelHistoryChartData
                  ? calculateTotalCo2(travelHistoryChartData)
                  : undefined
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="flex gap-2 text-3xl bold group relative w-max">
            <a href="/dashboard/user/events">Events</a>
            <span className="absolute -bottom-1 left-0 w-0 transition-all h-0.5 bg-gray-700 group-hover:w-full" />
          </p>
          <Separator />
          <div className="flex flex-1">
            <div className="flex flex-col flex-1 gap-4">
              <div className="flex flex-col">
                <p className="text-xl text-gray-500">Today</p>
                <p className="text-3xl">
                  <span className="font-bold">{today.split(',')[0]},</span>
                  <span className="text-gray-500">{today.split(',')[1]}</span>
                </p>
              </div>
              <TodayEventsVerticalStepper />
            </div>
            <div className="flex flex-col w-1/4 min-w-96 h-full max-h-[80vh] bg-muted p-4 gap-4 rounded-xl">
              <p className="text-3xl font-bold">Invitations</p>
              <PendingEvents
                data={events}
                onUpdate={() => handleGetUserData()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
