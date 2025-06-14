'use client';
import * as React from 'react';
import { useUserContext } from '@/contexts/user-context';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Leaf,
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
  calculateParticipantsEmissionRateOnEvent,
  calculateParticipantsTravelModePreferencesOnEvent,
  calculatePersonalEmissionPercentageOnEvent,
  calculatePersonalEmissionRateOnEvent,
} from '@/utils/charts-util';
import { PercentagePieChart } from '@/components/ui/charts/percentage-pie-chart';
import { DataTable } from '@/components/ui/table/data-table.view';
import { EventOccurrence } from '../../../services/api/type.api';
import { getTravelPlanByParticipant } from '../../../services/api/travel-plan.api';
import { SavedTravelPlanType } from '@/contexts/travel-context';
import TravelPlanOverviewCard from '@/components/userPage/travel-plan-overview-card.view';

interface EventDetailsPanelProps {
  isTravelPlansPanelVisible?: boolean;
  toggleTravelPlansPanel?(): void;
  extended?: boolean;
  adminMode?: boolean;
}

function EventDetailsPanel({
  isTravelPlansPanelVisible,
  toggleTravelPlansPanel,
  extended,
  adminMode,
}: EventDetailsPanelProps) {
  const { user, selectedEvent } = useUserContext();
  const router = useRouter();
  const [participantTravelDetails, setParticipantTravelDetails] =
    React.useState<SavedTravelPlanType[] | undefined>();

  const getParticipantTravelDetails = React.useCallback(async () => {
    const participantInfo = selectedEvent?.participants.find(
      (participant) =>
        participant.user.id === user?.id && !!participant.travelPlan,
    );
    if (participantInfo && participantInfo.travelPlan) {
      const data = await getTravelPlanByParticipant(participantInfo.id);
      setParticipantTravelDetails(data);
    }
  }, [selectedEvent?.participants, user?.id]);

  const getOverviewContent = React.useCallback(() => {
    if (!participantTravelDetails) {
      return null;
    } else
      return participantTravelDetails.map((plan, index) => {
        return (
          <TravelPlanOverviewCard
            key={index}
            plan={plan}
            selectedEvent={selectedEvent}
          />
        );
      });
  }, [participantTravelDetails, selectedEvent]);

  React.useEffect(() => {
    getParticipantTravelDetails();
  }, [getParticipantTravelDetails]);

  return (
    <div className="w-full bg-white flex flex-col px-4 pt-2">
      <div
        className={`h-full relative flex flex-col gap-2 pb-2 transition-all duration-500 ease-in-out overflow-y-auto`}
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
          <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
            <Clock size={16} className="self-center" />
            {'Date & Time: '}
          </div>
          {selectedEvent?.occurrence !== EventOccurrence.SINGLE && (
            <span>
              Repeats{' '}
              <span className="text-primary font-semibold">
                {selectedEvent?.occurrence.toLowerCase()}
              </span>{' '}
              from
            </span>
          )}{' '}
          {selectedEvent
            ? format(
                parseISO(selectedEvent.dateTime!),
                'MMMM do, yyyy, hh:mm a',
              )
            : ''}
        </div>
        <div className={`text-gray-700`}>
          <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
            <MapPin size={16} className="self-center" />
            {'At: '}
          </div>
          {selectedEvent ? selectedEvent.location.address : ''}
        </div>
        <div className={`text-gray-700`}>
          <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
            <UserCog size={16} className="self-center" /> Host:{' '}
          </div>
          {selectedEvent && user?.name
            ? selectedEvent.creator.name === user.name
              ? 'Me'
              : selectedEvent.creator.name
            : 'undefined'}
        </div>
        <div className={`text-gray-700 flex flex-col`}>
          <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 w-fit rounded-r-md">
            <Users size={16} className="self-center" /> Participants:{' '}
          </div>
          {selectedEvent?.participants &&
            selectedEvent.participants.length > 0 && (
              <div className="flex flex-wrap flex-1 mt-2 gap-2">
                {selectedEvent.participants.map((participant, index) => (
                  <ParticipantChip
                    username={participant.user.name}
                    key={index}
                    hideClearButton
                    status={participant.status}
                    hasPlan={
                      !!participant.travelPlan &&
                      participant.travelPlan.length > 0
                    }
                  />
                ))}
              </div>
            )}
        </div>
        <div className={`text-gray-700`}>
          <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
            <ScanText size={16} className="self-center" /> Description:
          </div>
          {selectedEvent?.description}
        </div>
      </div>
      {extended && (
        <div className={`pt-4`}>
          <div>
            <p className={`text-xl font-bold`}>
              {adminMode ? 'Travel Plans Metrics' : 'Travel Plan Metrics'}
            </p>
            <Separator orientation={'horizontal'} />
          </div>
          {adminMode && selectedEvent?.participants ? (
            <div className={`flex flex-col gap-2 pt-2`}>
              <div className={`flex gap-4 w-full`}>
                <div className={`w-1/2`}>
                  <div>
                    <p
                      className={`text-lg font-medium text-primary items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md w-fit`}
                    >
                      Carbon Emission Rates (kg CO₂e)
                    </p>
                    <p className={`text-sm italic text-gray-500 mt-1`}>
                      This explains the Emissions of each participant&#39;s
                      Travel Plan for this Event.
                    </p>
                  </div>
                  <div className={`pl-4`}>
                    <PercentagePieChart
                      data={calculateParticipantsEmissionRateOnEvent(
                        selectedEvent!.participants,
                      )}
                    />
                  </div>
                </div>
                <div>
                  <div>
                    <p
                      className={`text-lg font-medium text-primary items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md w-fit`}
                    >
                      Travel Modes Ratio
                    </p>
                    <p className={`text-sm italic text-gray-500 mt-1`}>
                      This explains the Travel Modes of Paticipant&#39;s
                      declared to this Event.
                    </p>
                  </div>
                  <PercentagePieChart
                    data={calculateParticipantsTravelModePreferencesOnEvent(
                      selectedEvent?.participants,
                    )}
                  />
                </div>
              </div>
              <Separator orientation={'horizontal'} className={``} />
              <div className={`flex flex-col gap-4`}>
                <div>
                  <p
                    className={`text-lg font-medium text-primary items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md w-fit`}
                  >
                    Participants List
                  </p>
                  <p className={`text-sm italic text-gray-500 mt-1`}>
                    This describes the Participants and their Travel Plans
                    information declared to this Event.
                  </p>
                </div>
                <div className="h-[80vh] overflow-y-auto">
                  {selectedEvent.participants && (
                    <DataTable
                      columns={[
                        {
                          id: 'name',
                          header: 'Name',
                          cell: ({ row }) => {
                            return row.original.user.name;
                          },
                        },
                        {
                          id: 'email',
                          header: 'Email',
                          cell: ({ row }) => {
                            return row.original.user.email;
                          },
                        },
                        {
                          id: 'totalCo2',
                          header: 'Total CO₂e (kg)',
                          cell: ({ row }) => {
                            return (
                              row.original.travelPlan?.reduce(
                                (co2PerPlanAcc, plan) => {
                                  const subCo2 = plan.totalCo2;
                                  return co2PerPlanAcc + subCo2;
                                },
                                0,
                              ) ?? (
                                <span className={`italic text-gray-500`}>
                                  Undeclared
                                </span>
                              )
                            );
                          },
                        },
                      ]}
                      data={selectedEvent.participants}
                      footer={
                        <div className="flex justify-end items-center gap-2">
                          Total:{' '}
                          <span
                            className={`px-4 text-primary rounded border border-primary bg-muted/30`}
                          >
                            {selectedEvent.participants.reduce(
                              (acc, participant) => {
                                const co2 = participant.travelPlan?.reduce(
                                  (co2PerPlanAcc, plan) => {
                                    const subCo2 = plan.totalCo2;
                                    return co2PerPlanAcc + subCo2;
                                  },
                                  0,
                                );
                                return typeof co2 === 'number'
                                  ? acc + co2
                                  : acc;
                              },
                              0,
                            )}{' '}
                            kg CO₂e
                            <Leaf className={`inline ml-2`} size={16} />
                          </span>
                        </div>
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          ) : selectedEvent?.participants.find(
              (participant) =>
                participant.user.id === user?.id &&
                !!participant.travelPlan &&
                participant.travelPlan.length,
            ) ? (
            <div className={`flex flex-col gap-2 pt-2`}>
              <div className={`pt-2 flex flex-col gap-2`}>
                <p
                  className={`text-lg font-medium text-primary items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md w-fit`}
                >
                  Overview
                </p>
                <div className={`flex flex-wrap gap-4`}>
                  {getOverviewContent()}
                </div>
              </div>
              <Separator orientation={'horizontal'} className={`my-4`} />
              <div>
                <p
                  className={`text-lg font-medium text-primary items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md w-fit`}
                >
                  Carbon Emission Rates (kg CO₂e)
                </p>
                <p className={`text-sm italic text-gray-500 mt-1`}>
                  This explains the rough emissions estimation of your Travel
                  Plan and compare it with other participants.
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
              <Separator orientation={'horizontal'} className={`my-4`} />
              <div className={`flex gap-4 w-full`}>
                <div className={`flex flex-col gap-4 w-1/2`}>
                  <div>
                    <p
                      className={`text-lg font-medium text-primary items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md w-fit`}
                    >
                      Carbon Emission Contribution Ratio
                    </p>
                    <p className={`text-sm italic text-gray-500 mt-2`}>
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
                <div className={`flex flex-col gap-4 w-1/2`}>
                  <div>
                    <p
                      className={`text-lg font-medium text-primary items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md w-fit`}
                    >
                      Travel Modes Ratio
                    </p>
                    <p className={`text-sm italic text-gray-500 mt-1`}>
                      This explains the Travel Modes of Paticipant&#39;s
                      declared to this Event.
                    </p>
                  </div>
                  <PercentagePieChart
                    data={calculateParticipantsTravelModePreferencesOnEvent(
                      selectedEvent?.participants,
                    )}
                  />
                </div>
              </div>
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
          className={`min-h-fit flex flex-col gap-4 border-t-2 border-gray-200 transition-all duration-600 ease-in-out overflow-hidden`}
        >
          <div className={`flex justify-between items-center py-1`}>
            <div className="inline-flex items-baseline gap-1 pr-2 text-gray-500 text-2xl">
              <MapPin size={24} className="self-center" /> Location:{' '}
              {selectedEvent?.location.name}
            </div>
            <Button
              onClick={() => toggleTravelPlansPanel?.()}
              variant={'ghost'}
              className="border-gray-400 border px-2 py-0 mr-1 h-6"
            >
              {isTravelPlansPanelVisible ? (
                <ChevronsRight size={8} />
              ) : (
                <ChevronsLeft size={8} />
              )}
              {isTravelPlansPanelVisible
                ? 'Hide Travel Planning'
                : 'Show Travel Planning'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetailsPanel;
