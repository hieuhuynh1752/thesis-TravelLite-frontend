'use client';
import * as React from 'react';
import GoogleMapsAutocomplete from '@/components/userPage/maps/origin-autocomplete.view';
import { useUserContext } from '@/contexts/user-context';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTravelContext } from '@/contexts/travel-context';
import RouteOptionList from '@/components/userPage/maps/route-option-list.view';
import {
  createTravelPlan,
  getTravelPlanByParticipant,
} from '../../../../services/api/travel-plan.api';
import RouteDetails from '@/components/userPage/maps/route-details.view';
import { Separator } from '@/components/ui/separator';

const NewRoutesPanel = () => {
  const { selectedEvent, events } = useUserContext();
  const {
    setSearchDirection,
    flattenedSelectedRoute,
    setFlattenedSelectedRoute,
    setSavedTravelPlan,
    savedTravelPlan,
    setIsEditingTravelPlan,
    isEditingTravelPlan,
  } = useTravelContext();

  const eventParticipantId = React.useMemo(() => {
    return events?.find((event) => event.event === selectedEvent)?.id;
  }, [events, selectedEvent]);

  const handleSaveTravelRoute = React.useCallback(async () => {
    if (eventParticipantId && flattenedSelectedRoute) {
      const data = await createTravelPlan({
        ...flattenedSelectedRoute,
        eventParticipantId,
      });
      setSavedTravelPlan?.(data);
    }
  }, [eventParticipantId, flattenedSelectedRoute, setSavedTravelPlan]);

  const handleLoadTravelRoute = React.useCallback(async () => {
    if (eventParticipantId) {
      try {
        const data = await getTravelPlanByParticipant(eventParticipantId);
        if (data) {
          console.log(data);
          setSavedTravelPlan?.(data);
        } else {
          setSavedTravelPlan?.(undefined);
        }
      } catch (error) {
        console.log(error);
        setSavedTravelPlan?.(undefined);
      }
    }
  }, [eventParticipantId, setSavedTravelPlan]);

  const handleUpdateEditSavedTravelPlan = React.useCallback(
    (newState: boolean) => {
      setIsEditingTravelPlan(newState);
    },
    [setIsEditingTravelPlan],
  );

  const handleRouteDetailsBackButton = React.useCallback(() => {
    setFlattenedSelectedRoute?.(undefined);
  }, [setFlattenedSelectedRoute]);

  React.useEffect(() => {
    handleLoadTravelRoute();
  }, [handleLoadTravelRoute]);

  console.log(savedTravelPlan, flattenedSelectedRoute);

  return !savedTravelPlan || (savedTravelPlan && isEditingTravelPlan) ? (
    flattenedSelectedRoute ? (
      <RouteDetails
        travelPlan={flattenedSelectedRoute}
        handleBackButton={handleRouteDetailsBackButton}
        handleSaveTravelRoute={handleSaveTravelRoute}
      />
    ) : (
      <div className="flex flex-grow flex-col gap-2">
        {savedTravelPlan && isEditingTravelPlan && (
          <div className={'flex flex-col gap-2'}>
            <div className={`flex gap-2 px-2`}>
              <Button
                onClick={() => handleUpdateEditSavedTravelPlan(false)}
                variant={'ghost'}
                className={'px-2 py-0 border-2 border-gray-500 h-7 w-12'}
              >
                <ArrowLeft />
              </Button>
              <div className={'text-xl font-bold text-gray-600 self-center'}>
                Update your travel plan
              </div>
            </div>
            <Separator orientation={'horizontal'} />
          </div>
        )}
        <div className={`h-20 w-full px-2 flex flex-col gap-2`}>
          <div className={`font-bold`}>Choose your origin:</div>
          <GoogleMapsAutocomplete
            onSelect={(val) =>
              setSearchDirection({
                origin: val!.place_id ?? '',
                destination: selectedEvent?.location.googlePlaceId ?? '',
              })
            }
          />
        </div>
        <RouteOptionList />
        <div
          className={`h-12 bg-gray-200 text-gray-700 p-2 inline-flex items-center text-md gap-1`}
        >
          <MapPin size={16} className="self-center" />
          <span className={`italic`}>Destination:</span>{' '}
          <span className={`font-bold`}>{selectedEvent?.location.name}</span>
        </div>
      </div>
    )
  ) : (
    <RouteDetails
      travelPlan={savedTravelPlan}
      handleUpdateEditSavedTravelPlan={() =>
        handleUpdateEditSavedTravelPlan(true)
      }
      isDetailsSaved={true}
    />
  );
};

export default NewRoutesPanel;
