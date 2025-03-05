'use client';

import * as React from 'react';
import {
  EventParticipantStatus,
  EventParticipantType,
} from '../../../services/api/type.api';
import { Check, Clock, MapPin, User, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { updateParticipantStatus } from '../../../services/api/event-participant.api';
import { toast } from 'sonner';

interface PendingEventsProps {
  data?: EventParticipantType[];
  onUpdate?(): void;
}

const PendingEvents = ({ data, onUpdate }: PendingEventsProps) => {
  const [pendingEvents, setPendingEvents] = React.useState<
    EventParticipantType[]
  >([]);

  const handleInvitationUpdate = React.useCallback(
    (
      invitationId: number,
      eventTitle: string,
      status: EventParticipantStatus,
    ) => {
      updateParticipantStatus(invitationId, { status });
      onUpdate?.();
      toast(`You have ${status.toLowerCase()} the event: ${eventTitle}!`);
    },
    [onUpdate],
  );

  React.useEffect(() => {
    if (data) {
      const filteredPendingEvents = data
        .filter(
          (item) =>
            item.status === EventParticipantStatus.PENDING &&
            new Date(item.event.dateTime) > new Date(),
        )
        .sort(
          (a, b) =>
            new Date(b.event.dateTime).getDate() -
            new Date(a.event.dateTime).getDate(),
        );

      setPendingEvents(filteredPendingEvents);
    }
  }, [data]);

  return pendingEvents.length === 0 ? (
    <p className="text-muted-foreground italic">No pending events invitation</p>
  ) : (
    <div className="grid max-h-[100vh] overflow-y-auto gap-4 pr-2">
      {pendingEvents.map((invitation, index) => (
        <div
          className="flex flex-col w-full h-full bg-white rounded-xl"
          key={index}
        >
          <div className="flex w-full gap-4">
            <div className="flex flex-col p-4 pr-0 pt-6">
              <p className="text-lg font-medium text-white bg-gray-500 px-2 rounded-t-md">
                {format(parseISO(invitation.event.dateTime), 'MMM')}
              </p>
              <p className="text-lg font-medium self-center text-center border-2 border-gray-500 rounded-b-md w-full">
                {format(parseISO(invitation.event.dateTime), 'd')}
              </p>
            </div>
            <div className="p-4 pl-0 h-fit">
              <h3 className="text-lg font-medium">{invitation.event.title}</h3>
              <p className="text-sm text-muted-foreground">
                {invitation.event.description}
              </p>
              <div className="flex gap-4">
                <p className="flex text-sm my-1 items-center">
                  <MapPin className="mr-2" size="16" />
                  <span className="font-medium">
                    {invitation.event.location.name}
                  </span>
                </p>
                <p className="flex text-sm items-center">
                  <Clock className="mr-2" size="16" />{' '}
                  <span className="font-medium">
                    {format(parseISO(invitation.event.dateTime), 'hh:mm a')}
                  </span>
                </p>
              </div>
              <p className="flex text-sm items-center">
                <User size="16" className="mr-2" />
                <span className="font-medium mr-2">Sent by: </span>
                {invitation.event.creator.name}
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex w-full">
            <Button
              variant="ghost"
              className="flex flex-1 gap-2 rounded-t-none rounded-br-none rounded-bl-xl"
              onClick={() =>
                handleInvitationUpdate(
                  invitation.id,
                  invitation.event.title,
                  EventParticipantStatus.DECLINED,
                )
              }
            >
              <X />
              Decline
            </Button>
            <Button
              className="flex flex-1 gap-2 rounded-t-none rounded-bl-none rounded-br-xl"
              onClick={() =>
                handleInvitationUpdate(
                  invitation.id,
                  invitation.event.title,
                  EventParticipantStatus.ACCEPTED,
                )
              }
            >
              <Check /> Accept
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingEvents;
