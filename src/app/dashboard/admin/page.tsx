'use client';
import * as React from 'react';

import Cookie from 'js-cookie';
import { redirect } from 'next/navigation';
import { EventType, UserRole } from '../../../../services/api/type.api';
import UserTabContent from '@/components/adminPage/users-tab.view';
import { getAllUsers, getUserById } from '../../../../services/api/user.api';
import { useUserContext } from '@/contexts/user-context';
import { getMe } from '../../../../services/api/auth.api';
import EventsListPanel from '@/components/userPage/events-list-panel.view';
import MapContainer from '@/components/userPage/maps/map.view';
import { Separator } from '@/components/ui/separator';
import EventDetailsPanel from '@/components/userPage/event-details-panel.view';
import { APIProvider } from '@vis.gl/react-google-maps';
import { GoogleMapsContext } from '@/contexts/google-maps-context';
import { TravelProvider } from '@/contexts/travel-context';
import { getAllEvents } from '../../../../services/api/event.api';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getFilteredEvents } from '@/utils/events-util';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { setUser, allEvents, setAllEvents } = useUserContext();
  const [userId, setUserId] = React.useState<number | undefined>();
  const [selectedTab, setSelectedTab] = React.useState('users');
  const [userData, setUserData] = React.useState([]);
  const [googleMaps, setGoogleMaps] = React.useState<
    typeof google.maps | undefined
  >(undefined);
  const [filterType, setFilterType] = React.useState('lifetime');
  const [selectedMonth, setSelectedMonth] = React.useState<
    string | undefined
  >();
  const [selectedYear, setSelectedYear] = React.useState<string | undefined>();
  const [key, setKey] = React.useState(+new Date());

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
      getAllEvents().then((value) => {
        setAllEvents?.(value);
      });
    }
  }, [userId, setUser, setAllEvents]);

  const filterEvents = React.useCallback(() => {
    let events: EventType[] = [];
    if (allEvents) {
      if (filterType === 'lifetime') {
        handleGetUserData();
        return;
      } else {
        events = getFilteredEvents(allEvents, {
          month: selectedMonth,
          year: selectedYear,
        });
      }
      setAllEvents?.(events);
    }
  }, [
    allEvents,
    filterType,
    handleGetUserData,
    selectedMonth,
    selectedYear,
    setAllEvents,
  ]);

  const handleGetUsersData = React.useCallback(() => {
    getAllUsers().then((value) => setUserData(value));
  }, []);

  const handleFilterTypeChange = React.useCallback((type: string) => {
    setFilterType(type);
    if (type === 'lifetime') {
      setSelectedMonth(undefined);
      setSelectedYear(undefined);
      setKey(+new Date());
    }
    if (type === 'yearly') {
      setSelectedMonth(undefined);
      setKey(+new Date());
    }
  }, []);

  React.useEffect(() => {
    const role = Cookie.get('role');

    if (role !== UserRole.ADMIN) {
      redirect('/dashboard');
    } else {
      getMe().then((userId) => setUserId(userId));
      handleGetUserData();
      handleGetUsersData();
    }
  }, [handleGetUserData, handleGetUsersData]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (typeof google !== 'undefined' && google.maps) {
        setGoogleMaps(google.maps);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
      libraries={['marker']}
    >
      <GoogleMapsContext.Provider value={googleMaps}>
        {googleMaps ? (
          <TravelProvider>
            <div className="flex flex-col">
              <div className="flex p-4 pt-2 pb-0 border-b-2 border-muted gap-2">
                <div
                  className={`py-1 px-4 rounded-t-sm font-semibold text-gray-500 bg-gray-50 hover:bg-muted/20 hover:text-primary cursor-pointer ${selectedTab === 'users' ? ' text-primary font-semibold bg-muted/50 hover:bg-muted/30' : ''}`}
                  onClick={() => setSelectedTab('users')}
                >
                  <div className={'flex gap-2 items-center'}>
                    <span>Users</span>
                  </div>
                </div>
                <div
                  className={`py-1 px-4 rounded-t-sm  font-semibold text-gray-500 bg-gray-50 hover:bg-muted/20 hover:text-primary cursor-pointer ${selectedTab === 'events' ? 'text-primary font-semibold bg-muted/50 hover:bg-muted/30' : ''}`}
                  onClick={() => setSelectedTab('events')}
                >
                  Events
                </div>
              </div>
              <div className="min-h-[100vh] flex-1 md:min-h-min">
                {selectedTab === 'users' ? (
                  <UserTabContent
                    data={userData}
                    handleReload={handleGetUsersData}
                  />
                ) : (
                  <div className={'flex flex-col gap-4'}>
                    <div className={'flex flex-col p-4 pb-0'}>
                      <Separator orientation={'horizontal'} />
                      <div className="flex gap-4 items-center border-r">
                        <div
                          className={`text-md font-semibold p-4 bg-gray-200`}
                        >
                          Filters
                        </div>
                        <div className="flex gap-2 items-center">
                          <Label>Type: </Label>
                          <div className="flex p-1 bg-gray-100 w-fit rounded gap-1">
                            <div
                              className={`px-4 rounded cursor-pointer font-semibold text-gray-500 hover:bg-muted/30 hover:text-primary ${filterType === 'lifetime' && 'bg-muted/50 text-primary'}`}
                              onClick={() => handleFilterTypeChange('lifetime')}
                            >
                              Lifetime
                            </div>
                            <Separator
                              orientation={'vertical'}
                              className={'bg-primary h-auto'}
                            />
                            <div
                              className={`px-4 rounded cursor-pointer font-semibold text-gray-500 hover:bg-muted/30 hover:text-primary ${filterType === 'monthly' && 'bg-muted/50 text-primary'}`}
                              onClick={() => handleFilterTypeChange('monthly')}
                            >
                              Monthly
                            </div>
                            <Separator
                              orientation={'vertical'}
                              className={'bg-primary h-auto'}
                            />
                            <div
                              className={`px-4 rounded cursor-pointer font-semibold text-gray-500 hover:bg-muted/30 hover:text-primary  ${filterType === 'yearly' && 'bg-muted/50 text-primary'}`}
                              onClick={() => handleFilterTypeChange('yearly')}
                            >
                              Yearly
                            </div>
                          </div>
                        </div>
                        <div
                          className={`flex gap-2 items-center ${filterType !== 'monthly' && 'text-gray-400'}`}
                        >
                          <Label>Month:</Label>
                          <Select
                            onValueChange={setSelectedMonth}
                            disabled={filterType !== 'monthly'}
                            value={selectedMonth}
                            key={key}
                          >
                            <SelectTrigger className={`min-w-[148px]`}>
                              <SelectValue placeholder="Select a month" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={'1'}>January</SelectItem>
                              <SelectItem value={'2'}>February</SelectItem>
                              <SelectItem value={'3'}>March</SelectItem>
                              <SelectItem value={'4'}>April</SelectItem>
                              <SelectItem value={'5'}>May</SelectItem>
                              <SelectItem value={'6'}>June</SelectItem>
                              <SelectItem value={'7'}>July</SelectItem>
                              <SelectItem value={'8'}>August</SelectItem>
                              <SelectItem value={'9'}>September</SelectItem>
                              <SelectItem value={'10'}>October</SelectItem>
                              <SelectItem value={'11'}>November</SelectItem>
                              <SelectItem value={'12'}>December</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div
                          className={`flex gap-2 items-center ${filterType === 'lifetime' && 'text-gray-400'}`}
                        >
                          <Label>Year:</Label>
                          <Select
                            onValueChange={setSelectedYear}
                            disabled={filterType === 'lifetime'}
                            value={selectedYear}
                            key={key}
                          >
                            <SelectTrigger className={`min-w-36`}>
                              <SelectValue placeholder="Select a year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={'2024'}>2024</SelectItem>
                              <SelectItem value={'2025'}>2025</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button size={'sm'} onClick={() => filterEvents()}>
                          Apply
                        </Button>
                      </div>
                      <Separator orientation={'horizontal'} />
                    </div>
                    <div className="flex flex-1 gap-2">
                      <EventsListPanel extended adminMode />
                      <div
                        className={`flex flex-1 flex-col overflow-y-auto`}
                        style={{ maxHeight: 'calc(90vh - 0.5rem)' }}
                      >
                        <div className="h-fit">
                          <MapContainer />
                        </div>
                        <div className="flex">
                          <Separator orientation="vertical" />
                          <EventDetailsPanel extended adminMode />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TravelProvider>
        ) : (
          <div className="flex flex-1 gap-2 pt-2">
            <div className="ml-4 h-full w-[30vw] max-w-3xl rounded-xl bg-muted/50" />
            <Separator orientation="vertical" />
            <div className="h-full w-full rounded-xl bg-muted/50" />
          </div>
        )}
      </GoogleMapsContext.Provider>
    </APIProvider>
  );
}
