'use client';

import * as React from 'react';
import {
  EventParticipantType,
  EventType,
  UserType,
} from '../../services/api/type.api';

export type EventsMixedType = {
  created: EventType[];
  participated: EventParticipantType[];
};

type UserContextType = {
  user?: UserType;
  events?: EventsMixedType;
  setUser?: (userInfo: UserType) => void;
  setEvents?: (events: EventsMixedType) => void;
};

const UserContext = React.createContext<UserContextType | undefined>(undefined);

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = React.useState<UserType | undefined>();
  const [events, setEvents] = React.useState<EventsMixedType | undefined>();

  return (
    <UserContext.Provider value={{ user, setUser, events, setEvents }}>
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
