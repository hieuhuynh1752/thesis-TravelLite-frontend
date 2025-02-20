'use client';
import * as React from 'react';
import { RoutesPanel } from '@/components/userPage/maps/routes-panel.view';
import { useUserContext } from '@/contexts/user-context';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  ChevronsDown,
  ChevronsUp,
  Clock,
  ScanText,
  UserCog,
  Users,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { EventParticipantStatus } from '../../../services/api/type.api';

function EventDetailPanel() {
  const { user, selectedEvent } = useUserContext();
  const [eventDetailExpanded, setEventDetailExpanded] = React.useState(false);

  const handleToggleEventDetail = React.useCallback(() => {
    setEventDetailExpanded((prevState) => !prevState);
  }, []);
  return (
    <div className="w-[30vw] bg-white flex flex-col px-4 gap-4">
      <div
        className={`${eventDetailExpanded ? 'h-1/3' : 'h-24'} relative transition-all duration-500 ease-in-out overflow-hidden`}
      >
        <div className="font-bold text-2xl">{selectedEvent?.title}</div>
        <div
          className={`text-gray-700 ${eventDetailExpanded ? '' : 'h-6 text-ellipsis overflow-hidden whitespace-nowrap'}`}
        >
          <div className="inline-flex items-baseline gap-1 pr-2 italic text-gray-500">
            <Clock size={16} className="self-center" />
            {'At: '}
          </div>
          {selectedEvent
            ? format(parseISO(selectedEvent.dateTime!), 'hh:mm a')
            : ''}
        </div>
        <div
          className={`text-gray-700 ${eventDetailExpanded ? '' : 'h-6 text-ellipsis overflow-hidden whitespace-nowrap'}`}
        >
          <div className="inline-flex italic text-gray-500 items-baseline gap-1 pr-2">
            <UserCog size={16} className="self-center" /> Host:{' '}
          </div>
          {selectedEvent && user?.name
            ? selectedEvent.creator.name === user.name
              ? 'Me'
              : selectedEvent.creator.name
            : 'undefined'}
        </div>
        <div
          className={`text-gray-700 ${eventDetailExpanded ? '' : 'h-6 text-ellipsis overflow-hidden whitespace-nowrap'}`}
        >
          <div className="inline-flex italic text-gray-500 items-baseline gap-1 pr-2">
            <Users size={16} className="self-center" /> Participants:{' '}
          </div>
          {selectedEvent &&
            selectedEvent.participants
              .filter(
                (participant) =>
                  participant.id !== user?.id &&
                  participant.status === EventParticipantStatus.ACCEPTED,
              )
              .map((participant, index, participants) => (
                <span key={index}>
                  {participant.user.name}
                  {index === participants.length - 1 ? '' : ', '}
                </span>
              ))}
        </div>
        <div
          className={`text-gray-700 ${eventDetailExpanded ? '' : 'h-6 text-ellipsis overflow-hidden whitespace-nowrap'}`}
        >
          <div className="inline-flex italic items-baseline gap-1 pr-2 text-gray-500">
            <ScanText size={16} className="self-center" /> Description:
          </div>
          {selectedEvent?.description}
        </div>

        <div className="flex py-2 w-full flex-wrap items-center gap-2 absolute bottom-0 backdrop-blur-xl">
          <Separator orientation="horizontal" className="flex flex-1" />
          <Button
            variant={'ghost'}
            className="h-6 border-gray-400 border bg-white"
            onClick={() => handleToggleEventDetail()}
          >
            {eventDetailExpanded ? (
              <ChevronsUp size={8} />
            ) : (
              <ChevronsDown size={8} />
            )}
            {eventDetailExpanded ? 'Hide details' : 'Show details'}
          </Button>
          <Separator orientation="horizontal" className="flex flex-1" />
        </div>
      </div>

      <RoutesPanel />
    </div>
  );
}

export default EventDetailPanel;
