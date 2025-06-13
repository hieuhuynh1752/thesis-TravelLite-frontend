'use client';

import * as React from 'react';
import {
  EventParticipantType,
  EventType,
  UserType,
} from '../../services/api/type.api';
import { Dispatch } from 'react';

type UserContextType = {
  user?: UserType;
  eventsAsParticipantList?: EventParticipantType[];
  allEvents?: EventType[];
  selectedEvent?: EventType;
  isEditingEvent?: boolean;

  setUser?: Dispatch<React.SetStateAction<UserType | undefined>>;
  setAllEvents?: Dispatch<React.SetStateAction<EventType[] | undefined>>;
  setEventsAsParticipantList?: Dispatch<
    React.SetStateAction<EventParticipantType[] | undefined>
  >;
  setSelectedEvent?: Dispatch<React.SetStateAction<EventType | undefined>>;
  setIsEditingEvent?: Dispatch<React.SetStateAction<boolean>>;
};

const UserContext = React.createContext<UserContextType | undefined>(undefined);

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = React.useState<UserType | undefined>();
  const [eventsAsParticipantList, setEventsAsParticipantList] = React.useState<
    EventParticipantType[] | undefined
  >();
  const [allEvents, setAllEvents] = React.useState<EventType[] | undefined>();
  const [selectedEvent, setSelectedEvent] = React.useState<
    EventType | undefined
  >();
  const [isEditingEvent, setIsEditingEvent] = React.useState(false);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        eventsAsParticipantList,
        setEventsAsParticipantList,
        selectedEvent,
        setSelectedEvent,
        isEditingEvent,
        setIsEditingEvent,
        allEvents,
        setAllEvents,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
};
