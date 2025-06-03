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
import { ArrowLeft, Plus } from 'lucide-react';
import RoutesPanel from '@/components/userPage/maps/routes-panel.view';
import { Separator } from '@/components/ui/separator';
import TravelPlanOverviewCard from '@/components/userPage/travel-plan-overview-card.view';

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
                  <TravelPlanOverviewCard
                    key={index}
                    plan={plan}
                    onCardClick={() => handleTravelPlanSelect(plan)}
                    selectedEvent={selectedEvent}
                    fullWidth
                  />
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
