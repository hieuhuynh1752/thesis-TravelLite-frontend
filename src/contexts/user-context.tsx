'use client';

import * as React from 'react';
import {
  EventParticipantType,
  EventType,
  UserType,
} from '../../services/api/type.api';

type UserContextType = {
  user?: UserType;
  events?: EventParticipantType[];
  selectedEvent?: EventType;
  setUser?: (userInfo: UserType) => void;
  setEvents?: (events: EventParticipantType[]) => void;
  setSelectedEvent?: (event?: EventType) => void;
};

const UserContext = React.createContext<UserContextType | undefined>(undefined);

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = React.useState<UserType | undefined>();
  const [events, setEvents] = React.useState<
    EventParticipantType[] | undefined
  >();
  const [selectedEvent, setSelectedEvent] = React.useState<
    EventType | undefined
  >();

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        events,
        setEvents,
        selectedEvent,
        setSelectedEvent,
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
