'use client';
import * as React from 'react';
import { useUserContext } from '@/contexts/user-context';
import {
  DirectionType,
  isFlight,
  SavedTravelPlanType,
  useTravelContext,
} from '@/contexts/travel-context';
import { getTravelPlanByParticipant } from '../../../../services/api/travel-plan.api';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import RoutesPanel from '@/components/userPage/maps/routes-panel.view';
import { Separator } from '@/components/ui/separator';
import TravelPlanOverviewCard from '@/components/userPage/travel-plan-overview-card.view';
import login_landing from '@/img/login_landing.svg';
import Image from 'next/image';

export function TravelPlansPanel() {
  const { selectedEvent, eventsAsParticipantList } = useUserContext();
  const {
    setSavedTravelPlan,
    savedTravelPlan,
    setDirectionsCollection,
    resetAllTravelLogs,
  } = useTravelContext();

  const [savedTravelPlans, setSavedTravelPlans] = React.useState<
    SavedTravelPlanType[] | undefined
  >();
  const [showRoutesPanel, setShowRoutesPanel] = React.useState(false);

  const eventParticipantId = React.useMemo(() => {
    return eventsAsParticipantList?.find(
      (event) => event.event.id === selectedEvent?.id,
    )?.id;
  }, [eventsAsParticipantList, selectedEvent]);

  const handleLoadTravelRoutes = React.useCallback(async () => {
    resetAllTravelLogs();
    if (eventParticipantId) {
      try {
        const data = await getTravelPlanByParticipant(eventParticipantId);
        if (data) {
          setSavedTravelPlans?.(data);
          setDirectionsCollection?.(
            data.map((data) => {
              if (isFlight(data)) {
                return {
                  origin: data.routeDetails.origin,
                  destination: data.routeDetails.destination,
                };
              }
              return {
                origin: { id: data.origin },
                destination: { id: data.destination },
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
  }, [eventParticipantId, resetAllTravelLogs, setDirectionsCollection]);

  const handleTravelPlanSelect = React.useCallback(
    (plan: SavedTravelPlanType) => {
      setSavedTravelPlan?.(plan);
    },
    [setSavedTravelPlan],
  );

  const handleSaveTravelRoute = React.useCallback(() => {
    setShowRoutesPanel(false);
    handleLoadTravelRoutes();
  }, [handleLoadTravelRoutes]);

  React.useEffect(() => {
    handleLoadTravelRoutes();
  }, [handleLoadTravelRoutes]);

  return (
    <div className={`w-full flex flex-col gap-2`}>
      <div className=" min-h-full flex overflow-y-auto flex-col bg-gray-100 p-2">
        {savedTravelPlan || showRoutesPanel ? (
          <div className={`flex flex-col gap-2 bg-white w-full`}>
            <div className={`p-2 pb-0 self-end`}>
              <Button
                size={'sm'}
                variant={'secondary'}
                onClick={handleLoadTravelRoutes}
              >
                Close <X size={12} />
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
            {savedTravelPlans && savedTravelPlans.length > 0 ? (
              savedTravelPlans.map((plan, index) => {
                return (
                  <TravelPlanOverviewCard
                    key={index}
                    plan={plan}
                    onCardClick={() => handleTravelPlanSelect(plan)}
                    selectedEvent={selectedEvent}
                    fullWidth
                  />
                );
              })
            ) : (
              <div>
                <Image
                  src={login_landing}
                  alt="Image"
                  className="h-2/3 w-2/3 m-auto dark:brightness-[0.2] dark:grayscale"
                  sizes="(max-width: 768px) 100%, (max-width: 1200px) 50%, 33%"
                  priority={true}
                />
                <p className={`w-fit m-auto p-4 mt-2 rounded-xl bg-white`}>
                  Click the above &#34;Add Plan&#34; button to start planning
                  your trips!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
