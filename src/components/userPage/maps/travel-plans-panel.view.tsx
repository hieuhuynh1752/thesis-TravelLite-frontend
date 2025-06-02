'use client';
import * as React from 'react';
import { useUserContext } from '@/contexts/user-context';
import {
  DirectionType,
  FlattenedSelectedRoute,
  useTravelContext,
} from '@/contexts/travel-context';
import { getTravelPlanByParticipant } from '../../../../services/api/travel-plan.api';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Bike,
  Bus,
  Car,
  CircleDotDashed,
  Clock,
  Footprints,
  Leaf,
  MapPin,
  Plus,
  Route,
} from 'lucide-react';
import RoutesPanel from '@/components/userPage/maps/routes-panel.view';
import { Separator } from '@/components/ui/separator';
import { EventOccurrence } from '../../../../services/api/type.api';
import { format } from 'date-fns';

export function TravelPlansPanel() {
  const { selectedEvent, eventsAsParticipantList } = useUserContext();
  const { setSavedTravelPlan, savedTravelPlan, setDirectionsCollection } =
    useTravelContext();

  const [savedTravelPlans, setSavedTravelPlans] = React.useState<
    | (FlattenedSelectedRoute & {
        eventParticipantId: number;
      })[]
    | undefined
  >();
  const [showRoutesPanel, setShowRoutesPanel] = React.useState(false);

  const eventParticipantId = React.useMemo(() => {
    return eventsAsParticipantList?.find(
      (event) => event.event.id === selectedEvent?.id,
    )?.id;
  }, [eventsAsParticipantList, selectedEvent]);

  const handleLoadTravelRoutes = React.useCallback(async () => {
    if (eventParticipantId) {
      try {
        const data = await getTravelPlanByParticipant(eventParticipantId);
        if (data) {
          setSavedTravelPlans?.(data);
          console.log(data);
          setDirectionsCollection?.(
            data.map((data) => {
              return {
                origin: data.origin,
                destination: data.destination,
                travelMode: data.travelMode,
                selectedRoute: {
                  routes: data.routeDetails,
                  index: 0,
                },
              } as DirectionType;
            }),
          );
        } else {
          setSavedTravelPlans?.(undefined);
        }
        setShowRoutesPanel(false);
      } catch (error) {
        console.log(error);
        setSavedTravelPlans?.(undefined);
      }
    }
  }, [eventParticipantId, setDirectionsCollection]);

  const handleTravelPlanSelect = React.useCallback(
    (
      plan: FlattenedSelectedRoute & {
        eventParticipantId: number;
      },
    ) => {
      setSavedTravelPlan?.(plan);
    },
    [setSavedTravelPlan],
  );

  const handleSaveTravelRoute = React.useCallback(() => {
    setShowRoutesPanel(false);
    handleLoadTravelRoutes();
  }, [handleLoadTravelRoutes]);

  const getTravelMethodIcon = React.useCallback(
    (travelMode: google.maps.TravelMode) => {
      if (travelMode === google.maps.TravelMode.DRIVING) {
        return <Car size={24} className="self-center" />;
      }
      if (travelMode === google.maps.TravelMode.TRANSIT) {
        return <Bus size={24} className="self-center" />;
      }
      if (travelMode === google.maps.TravelMode.WALKING) {
        return <Footprints size={24} className="self-center" />;
      }
      if (travelMode === google.maps.TravelMode.BICYCLING) {
        return <Bike size={24} className="self-center" />;
      }
    },
    [],
  );

  React.useEffect(() => {
    handleLoadTravelRoutes();
  }, [handleLoadTravelRoutes]);

  return (
    <div className={`w-full flex flex-col gap-2`}>
      <div className=" min-h-full grid w-full overflow-y-auto flex-col bg-gray-100 p-2">
        {savedTravelPlan || showRoutesPanel ? (
          <div className={`flex flex-col gap-2 bg-white`}>
            <div className={`p-2 pb-0`}>
              <Button
                size={'sm'}
                variant={'secondary'}
                onClick={handleLoadTravelRoutes}
              >
                <ArrowLeft size={12} /> Back
              </Button>
            </div>
            <Separator orientation={'horizontal'} />
            <RoutesPanel handleSaveTravelRoute={handleSaveTravelRoute} />
          </div>
        ) : (
          <div className={`flex flex-col gap-2`}>
            <div className={`self-center`}>
              <Button size={'sm'} onClick={() => setShowRoutesPanel(true)}>
                <Plus size={12} /> Add Plan{' '}
              </Button>
            </div>
            {savedTravelPlans &&
              savedTravelPlans.map((plan, index) => {
                return (
                  <div
                    key={index}
                    className={`flex flex-col w-full bg-white rounded h-fit border-primary border-2 cursor-pointer shadow-none transition-shadow duration-300 hover:shadow-md hover:shadow-muted`}
                    onClick={() => handleTravelPlanSelect(plan)}
                  >
                    <div
                      className={`text-primary bg-muted/20 p-2 pl-4 inline-flex justify-between`}
                    >
                      <div
                        className={`capitalize text-lg font-semibold inline-flex items-baseline gap-2`}
                      >
                        {getTravelMethodIcon(plan.travelMode)}
                        {plan.travelMode.toLowerCase()}
                      </div>
                      <span
                        className={
                          'text-md font-semibold text-primary bg-white px-2 rounded border border-primary'
                        }
                      >
                        {plan.totalCo2} kg CO₂e{' '}
                        <Leaf className="inline" size={16} />
                      </span>
                    </div>
                    <div className={`p-2 flex flex-col gap-2`}>
                      <div>
                        <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
                          <Clock size={16} className="self-center" />
                          {'Date & Time: '}
                        </div>
                        {selectedEvent?.occurrence === EventOccurrence.DAILY
                          ? 'Daily at ' +
                            format(new Date(plan.plannedAt), 'hh:mm a')
                          : format(
                              new Date(plan.plannedAt),
                              'MMMM dd yyyy, hh:mm a',
                            )}
                      </div>
                      <div>
                        <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
                          <CircleDotDashed size={16} className="self-center" />
                          {'From: '}
                        </div>
                        {plan.origin.split(',')[0]}
                      </div>
                      <div>
                        <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
                          <MapPin size={16} className="self-center" />
                          {'To: '}
                        </div>{' '}
                        {plan.destination.split(',')[0]}
                      </div>
                      <div>
                        <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
                          <Route size={16} className="self-center" />
                          {'Distance: '}
                        </div>{' '}
                        {plan.routeDetails.routes[0].legs[0].distance?.text}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
