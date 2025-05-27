'use client';
import * as React from 'react';
import GoogleMapsAutocomplete from '@/components/userPage/maps/places-autocomplete.view';
import { useUserContext } from '@/contexts/user-context';
import { ArrowLeft, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DirectionType, useTravelContext } from '@/contexts/travel-context';
import RouteOptionList from '@/components/userPage/maps/route-option-list.view';
import {
  createTravelPlan,
  getTravelPlanByParticipant,
  updateTravelPlanByParticipant,
} from '../../../../services/api/travel-plan.api';
import RouteDetails from '@/components/userPage/maps/route-details.view';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useMap } from '@vis.gl/react-google-maps';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TimePicker from '@/components/ui/time-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

const RoutesPanel = () => {
  const map = useMap();
  const { selectedEvent, eventsAsParticipantList, isEditingEvent } =
    useUserContext();
  const {
    setSearchDirection,
    flattenedSelectedRoute,
    setFlattenedSelectedRoute,
    setSavedTravelPlan,
    savedTravelPlan,
    setIsEditingTravelPlan,
    isEditingTravelPlan,
    originValue,
    setOriginValue,
  } = useTravelContext();
  const [timingOptions, setTimingOptions] = React.useState<string>('leaveNow');
  const [date, setDate] = React.useState<Date>();
  const [timeValue, setTimeValue] = React.useState<string>(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  });
  const directionRendererRef =
    React.useRef<google.maps.DirectionsRenderer>(null);

  const eventParticipantId = React.useMemo(() => {
    return eventsAsParticipantList?.find(
      (event) => event.event.id === selectedEvent?.id,
    )?.id;
  }, [eventsAsParticipantList, selectedEvent]);

  const handleTimingOptionsChange = React.useCallback(
    (value: string) => {
      if (value === 'leaveNow') {
        setTimingOptions('leaveNow');
        setSearchDirection((prevState) => {
          return {
            ...prevState,
            arrivalTime: undefined,
            departureTime: undefined,
          } as DirectionType;
        });
      } else if (value === 'departAt') {
        setTimingOptions('departAt');
        setDate(new Date());
        setTimeValue(() => {
          const now = new Date();
          const hh = String(now.getHours()).padStart(2, '0');
          const mm = String(now.getMinutes()).padStart(2, '0');
          return `${hh}:${mm}`;
        });
        setSearchDirection((prevState) => {
          return {
            ...prevState,
            arrivalTime: undefined,
            departureTime: new Date(),
          } as DirectionType;
        });
      } else {
        setTimingOptions('arriveBy');
        setDate(new Date());
        setSearchDirection((prevState) => {
          return {
            ...prevState,
            arrivalTime: new Date(),
            departureTime: undefined,
          } as DirectionType;
        });
      }
    },
    [setSearchDirection],
  );

  const handleTimeChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (event) => {
        const time = event.target.value;
        const [hours, minutes] = time
          .split(':')
          .map((str) => parseInt(str, 10));
        const newSelectedDate = setHours(
          setMinutes(date ?? new Date(), minutes),
          hours,
        );
        setDate(newSelectedDate);
        setTimeValue(time);
      },
      [date],
    );

  const handleDaySelect = React.useCallback(
    (selectedDate: Date | undefined) => {
      if (!timeValue || !selectedDate) {
        setDate(selectedDate);
        return;
      }
      const [hours, minutes] = timeValue
        .split(':')
        .map((str) => parseInt(str, 10));
      const newDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hours,
        minutes,
      );
      setDate(newDate);
    },
    [timeValue],
  );

  const handleRouteDetailsBackButton = React.useCallback(() => {
    setFlattenedSelectedRoute?.(undefined);
  }, [setFlattenedSelectedRoute]);

  const handleLoadTravelRoute = React.useCallback(async () => {
    if (eventParticipantId) {
      try {
        const data = await getTravelPlanByParticipant(eventParticipantId);
        if (data) {
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
      if (
        map &&
        directionRendererRef.current &&
        savedTravelPlan?.routeDetails &&
        !newState
      ) {
        setSearchDirection(undefined);
        setOriginValue('');
        directionRendererRef.current = new google.maps.DirectionsRenderer({
          map,
          directions: savedTravelPlan.routeDetails,
        });
      }
      handleRouteDetailsBackButton();
    },
    [
      setIsEditingTravelPlan,
      map,
      savedTravelPlan?.routeDetails,
      handleRouteDetailsBackButton,
      setSearchDirection,
      setOriginValue,
    ],
  );

  const handleSaveTravelRoute = React.useCallback(async () => {
    console.log(flattenedSelectedRoute, eventParticipantId);
    if (eventParticipantId && flattenedSelectedRoute) {
      const data = savedTravelPlan
        ? await updateTravelPlanByParticipant(
            savedTravelPlan.eventParticipantId,
            flattenedSelectedRoute,
          )
        : await createTravelPlan({
            ...flattenedSelectedRoute,
            eventParticipantId,
          });
      setSavedTravelPlan?.(data);
      handleUpdateEditSavedTravelPlan(false);
      toast('Your travel route for this event has been saved!');
    }
  }, [
    eventParticipantId,
    flattenedSelectedRoute,
    savedTravelPlan,
    setSavedTravelPlan,
    handleUpdateEditSavedTravelPlan,
  ]);

  const handleOriginSelect = React.useCallback(
    (place: google.maps.places.PlaceResult | null) => {
      directionRendererRef.current?.setMap(null);
      setSearchDirection((prevState) => {
        return {
          ...prevState,
          origin: place!.place_id ?? '',
          destination: selectedEvent?.location.googlePlaceId ?? '',
        };
      });
      setOriginValue(place?.formatted_address ?? '');
    },
    [selectedEvent?.location.googlePlaceId, setOriginValue, setSearchDirection],
  );

  React.useEffect(() => {
    handleLoadTravelRoute();
  }, [handleLoadTravelRoute]);

  React.useEffect(() => {
    setSearchDirection((prevState) => {
      return {
        ...prevState,
        arrivalTime: timingOptions === 'arriveBy' ? date : undefined,
        departureTime: timingOptions === 'departAt' ? date : undefined,
      } as DirectionType;
    });
  }, [date, setSearchDirection, timingOptions]);

  React.useEffect(() => {
    if (map && savedTravelPlan?.routeDetails && !isEditingEvent) {
      if (directionRendererRef.current) {
        directionRendererRef.current.setMap(null);
      }

      directionRendererRef.current = new google.maps.DirectionsRenderer({
        map,
        directions: savedTravelPlan.routeDetails,
      });
    }
    return () => {
      if (directionRendererRef.current) {
        directionRendererRef.current.setMap(null);
        directionRendererRef.current = null;
      }
    };
  }, [map, savedTravelPlan, isEditingEvent]);

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
        <div className={`w-full px-2 flex flex-col gap-2`}>
          <div className={`font-bold`}>Choose your origin:</div>
          <GoogleMapsAutocomplete
            onSelect={handleOriginSelect}
            inputValue={originValue}
            onInputValueChange={(value) => setOriginValue(value)}
          />
          <Separator orientation={'horizontal'} />
          <div className={`flex gap-2 items-center`}>
            <div className={`font-semibold`}>Options:</div>
            <Select
              value={timingOptions}
              onValueChange={handleTimingOptionsChange}
            >
              <SelectTrigger className={`w-fit`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={'leaveNow'}>Leave now</SelectItem>
                <SelectItem value={'departAt'}>Depart at</SelectItem>
                <SelectItem value={'arriveBy'}>Arrive by</SelectItem>
              </SelectContent>
            </Select>
            {timingOptions !== 'leaveNow' && (
              <>
                <TimePicker
                  id={'time'}
                  value={timeValue}
                  onTimeChange={handleTimeChange}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                      )}
                      size={'sm'}
                    >
                      <CalendarIcon size={14} />{' '}
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDaySelect}
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </>
            )}
          </div>
        </div>
        <Separator orientation={'horizontal'} />
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

export default RoutesPanel;
