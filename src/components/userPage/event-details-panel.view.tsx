'use client';
import * as React from 'react';
import { useUserContext } from '@/contexts/user-context';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  Clock,
  MapPin,
  ScanText,
  UserCog,
  Users,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ParticipantChip from '@/components/ui/chip';
import CreateOrUpdateEventDialog from '@/components/userPage/create-event-dialog.view';
import { useRouter } from 'next/navigation';
import { HorizontalBarChart } from '@/components/ui/charts/horizontal-bar-chart';
import {
  calculatePersonalEmissionPercentageOnEvent,
  calculatePersonalEmissionRateOnEvent,
} from '@/utils/charts-util';
import { PercentagePieChart } from '@/components/ui/charts/percentage-pie-chart';

interface EventDetailPanelProps {
  isRoutesPanelVisible?: boolean;
  toggleRoutesPanel?(): void;
  extended?: boolean;
}

function EventDetailPanel({
  isRoutesPanelVisible,
  toggleRoutesPanel,
  extended,
}: EventDetailPanelProps) {
  const { user, selectedEvent } = useUserContext();
  const router = useRouter();
  const [eventDetailExpanded, setEventDetailExpanded] = React.useState(false);

  const handleToggleEventDetail = React.useCallback(() => {
    setEventDetailExpanded((prevState) => !prevState);
  }, []);

  return (
    <div className="w-full bg-white flex flex-col px-4 gap-2 pt-2">
      <div
        className={`${eventDetailExpanded || extended ? 'h-full' : 'h-32'} relative flex flex-col gap-2 transition-all duration-500 ease-in-out overflow-hidden`}
      >
        <div className={'flex justify-between items-center'}>
          <div className="font-bold text-2xl">{selectedEvent?.title}</div>
          {selectedEvent?.creator.id === user?.id && (
            <CreateOrUpdateEventDialog
              asUpdate={
                selectedEvent
                  ? {
                      id: selectedEvent.id,
                      title: selectedEvent.title,
                      description: selectedEvent.description,
                      occurrence: selectedEvent.occurrence,
                      visibility: selectedEvent.visibility,
                      locationId: selectedEvent.location.id,
                      selectedPlace: {
                        name: selectedEvent.location.name,
                        place_id: selectedEvent.location.googlePlaceId,
                        geometry: {
                          location: new google.maps.LatLng(
                            selectedEvent.location.latitude,
                            selectedEvent.location.longtitude,
                          ),
                        } as google.maps.places.PlaceGeometry,
                        formatted_address: selectedEvent.location.address,
                      } as google.maps.places.PlaceResult,
                      participants: selectedEvent.participants
                        .filter(
                          (participant) => participant.user.id !== user?.id,
                        )
                        .map((participant) => participant.user),
                      dateTime: selectedEvent.dateTime,
                    }
                  : undefined
              }
            />
          )}
        </div>
        <Separator orientation={'horizontal'} />
        <div className={`text-gray-700`}>
          <div className="inline-flex text-gray-500 font-medium items-baseline gap-1 px-2 border-l-4 border-gray-400 bg-gray-100 mr-2">
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
          <div className="inline-flex text-gray-500 font-medium items-baseline gap-1 px-2 border-l-4 border-gray-400 bg-gray-100 mr-2">
            <UserCog size={16} className="self-center" /> Host:{' '}
          </div>
          {selectedEvent && user?.name
            ? selectedEvent.creator.name === user.name
              ? 'Me'
              : selectedEvent.creator.name
            : 'undefined'}
        </div>
        <div
          className={`text-gray-700 ${eventDetailExpanded ? 'flex flex-col' : 'h-6 text-ellipsis overflow-hidden whitespace-nowrap'}`}
        >
          <div className="inline-flex font-medium text-gray-500 items-baseline gap-1 px-2 border-l-4 border-gray-400 bg-gray-100 w-fit mr-2">
            <Users size={16} className="self-center" /> Participants:{' '}
          </div>
          {selectedEvent?.participants &&
            selectedEvent.participants.length > 0 && (
              <div className="flex flex-wrap flex-1 mt-2">
                {selectedEvent.participants
                  .filter((participant) => participant.user.id !== user?.id)
                  .map((participant, index) => (
                    <ParticipantChip
                      username={participant.user.name}
                      key={index}
                      hideClearButton
                      status={participant.status}
                    />
                  ))}
              </div>
            )}
        </div>
        <div
          className={`text-gray-700 ${eventDetailExpanded ? '' : 'h-6 text-ellipsis overflow-hidden whitespace-nowrap'}`}
        >
          <div className="inline-flex text-gray-500 font-medium items-baseline gap-1 px-2 border-l-4 border-gray-400 bg-gray-100 mr-2">
            <ScanText size={16} className="self-center" /> Description:
          </div>
          {selectedEvent?.description}
        </div>
        {!extended && (
          <div className="flex py-2 w-full flex-wrap items-center gap-2 absolute bottom-0 backdrop-blur-xl">
            <Separator orientation="horizontal" className="flex flex-1" />
            <Button
              variant={'ghost'}
              className="h-6 border-gray-400 border bg-white p-0 px-2"
              onClick={() => handleToggleEventDetail()}
            >
              {eventDetailExpanded ? (
                <ChevronsUp size={8} />
              ) : (
                <ChevronsDown size={8} />
              )}
              {eventDetailExpanded
                ? 'Expand location info'
                : 'Reduce location info'}
            </Button>
            <Separator orientation="horizontal" className="flex flex-1" />
          </div>
        )}
      </div>
      {extended && (
        <div className={`pt-4`}>
          <div>
            <p className={`text-xl font-bold`}>Travel Plan Metrics</p>
            <Separator orientation={'horizontal'} />
          </div>
          {selectedEvent?.participants.find(
            (participant) =>
              participant.user.id === user?.id && !!participant.travelPlan,
          ) ? (
            <div className={`flex flex-col gap-2 pt-2`}>
              <div>
                <p className={`text-lg font-medium`}>
                  Carbon Emission Rates (kg CO₂e)
                </p>
                <p className={`text-sm italic text-gray-500`}>
                  This explains the Emissions of your Travel Plan and compare it
                  with other participants in average.
                </p>
              </div>
              <HorizontalBarChart
                data={calculatePersonalEmissionRateOnEvent(
                  selectedEvent?.participants,
                  user!.id,
                )}
                xKey={'name'}
                yKey={'value'}
              />
              <Separator orientation={'horizontal'} />
              <div>
                <p className={`text-lg font-medium`}>
                  Carbon Emission Contribution Ratio
                </p>
                <p className={`text-sm italic text-gray-500`}>
                  This explains the Emissions of your Travel Plan&#39;s
                  contribution to the Event.
                </p>
              </div>
              <PercentagePieChart
                data={calculatePersonalEmissionPercentageOnEvent(
                  selectedEvent?.participants,
                  user!.id,
                )}
              />
            </div>
          ) : (
            <div className={`pt-2`}>
              Oops, it seems like you didn&#39;t make any Travel Plan for this
              Event. Make one at{' '}
              <Button
                variant={'default'}
                className={`p-2 py-1 h-fit`}
                onClick={() => router.push('/dashboard/user/travelPlans')}
              >
                Travel Plans
              </Button>
            </div>
          )}
        </div>
      )}
      {!extended && (
        <div
          className={`min-h-10 flex flex-col gap-4 transition-all duration-600 ease-in-out overflow-hidden`}
        >
          <div className={`flex justify-between items-center py-1`}>
            <div className="inline-flex items-baseline gap-1 pr-2 text-gray-500 text-2xl">
              <MapPin size={24} className="self-center" /> Location:{' '}
              {selectedEvent?.location.name}
            </div>
            <Button
              onClick={() => toggleRoutesPanel?.()}
              variant={'ghost'}
              className="border-gray-400 border px-2 py-0 mr-1 h-6"
            >
              {isRoutesPanelVisible ? (
                <ChevronsRight size={8} />
              ) : (
                <ChevronsLeft size={8} />
              )}
              {isRoutesPanelVisible
                ? 'Hide Travel Planning'
                : 'Show Travel Planning'}
            </Button>
          </div>
          <div
            className={`w-48 ${eventDetailExpanded ? 'h-0' : 'h-48'} bg-muted`}
          ></div>
        </div>
      )}
    </div>
  );
}

export default EventDetailPanel;
