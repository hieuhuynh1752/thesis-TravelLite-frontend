'use client';
import * as React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import GoogleMapsAutocomplete from '@/components/userPage/maps/places-autocomplete.view';
import { MarkerWithInfoWindow } from '@/components/userPage/maps/custom-marker.view';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { EventOccurrence, UserType } from '../../../services/api/type.api';
import { getAllUsers, getUserById } from '../../../services/api/user.api';
import { useUserContext } from '@/contexts/user-context';
import ParticipantChip from '@/components/ui/chip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, getHours, getMinutes, setHours, setMinutes } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import TimePicker from '@/components/ui/time-picker';
import {
  createEvent,
  CreateEventBodyType,
  updateEvent,
} from '../../../services/api/event.api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export interface CreateOrUpdateEventDialogProps {
  asUpdate?: {
    id: number | undefined;
    title: string;
    description: string;
    occurrence: EventOccurrence;
    selectedPlace: google.maps.places.PlaceResult | null;
    locationId: number | null;
    participants: UserType[];
    dateTime: string;
  };
}

const CreateOrUpdateEventDialog = (props: CreateOrUpdateEventDialogProps) => {
  const { user, setUser, setEvents, setIsEditingEvent } = useUserContext();
  const map = useMap();
  const [title, setTitle] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [occurrence, setOccurrence] = React.useState<EventOccurrence>(
    EventOccurrence.SINGLE,
  );
  const [destination, setDestination] = React.useState<string>('');
  const [selectedPlace, setSelectedPlace] =
    React.useState<google.maps.places.PlaceResult | null>(null);
  const [allUsers, setAllUsers] = React.useState<UserType[] | null>(null);
  const [participants, setParticipants] = React.useState<UserType[]>([]);
  const [participantInputValue, setParticipantInputValue] = React.useState('');
  const [date, setDate] = React.useState<Date>();
  const [timeValue, setTimeValue] = React.useState<string>('00:00');

  const participantsInputRef = React.useRef<HTMLInputElement>(null);

  const flattenEventValues: CreateEventBodyType | undefined =
    React.useMemo(() => {
      if (
        title &&
        description &&
        selectedPlace &&
        date &&
        participants &&
        user
      ) {
        console.log(participants.map((participant) => participant.id));
        const data: CreateEventBodyType = {
          eventData: {
            title,
            description,
            dateTime: date,
            occurrence,
            creatorId: user.id,
            participantIds: participants.map((participant) => participant.id),
          },
          placeData: {
            googlePlaceId: selectedPlace.place_id ?? '',
            name: selectedPlace.name ?? '',
            address: selectedPlace.formatted_address ?? '',
            latitude: selectedPlace.geometry?.location?.lat() ?? 0,
            longtitude: selectedPlace.geometry?.location?.lng() ?? 0,
          },
        };
        return data;
      } else return undefined;
    }, [
      date,
      description,
      occurrence,
      participants,
      selectedPlace,
      title,
      user,
    ]);

  const handleSuggestionItemClick = React.useCallback(
    (candidate: UserType) => {
      let newParticipants = participants;
      if (!newParticipants.find((user) => user.id === candidate.id)) {
        newParticipants = [...participants, candidate];
      }
      setParticipants(newParticipants);

      setAllUsers((prevState) =>
        prevState ? prevState.filter((user) => user.id !== candidate.id) : null,
      );
      setParticipantInputValue('');
      participantsInputRef.current?.focus();
    },
    [participants],
  );

  const handleParticipantItemCancelClick = React.useCallback(
    (candidate: UserType) => {
      let newList = participants;
      newList = newList.filter((user) => candidate.id !== user.id);
      setParticipants(newList);

      setAllUsers((prevState) => {
        if (prevState) {
          const newState = prevState;
          if (!prevState.find((user) => user.id === candidate.id)) {
            newState.push(candidate);
          }
          return newState;
        }
        return null;
      });
    },
    [participants],
  );

  const handleTimeChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (event) => {
        const time = event.target.value;
        if (!date) {
          setTimeValue(time);
          return;
        }
        const [hours, minutes] = time
          .split(':')
          .map((str) => parseInt(str, 10));
        const newSelectedDate = setHours(setMinutes(date, minutes), hours);
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

  const fetchUsers = React.useCallback(() => {
    getAllUsers().then((value: UserType[]) => {
      setAllUsers(value.filter((userToFilter) => user?.id !== userToFilter.id));
    });
  }, [user?.id]);

  const handlePlaceSelect = React.useCallback(
    (place: google.maps.places.PlaceResult | null) => {
      setSelectedPlace(place);
      setDestination(place?.formatted_address ?? '');
    },
    [],
  );

  const handleDialogClose = React.useCallback(() => {
    setDate(undefined);
    setTimeValue('00:00');
    setParticipants([]);
    fetchUsers();
    setDestination('');
    setSelectedPlace(null);
    setTitle('');
    setDescription('');
    setOccurrence(EventOccurrence.SINGLE);
  }, [fetchUsers]);

  const handleSubmit = React.useCallback(() => {
    if (flattenEventValues) {
      if (props.asUpdate) {
        console.log(flattenEventValues.eventData);
        updateEvent(props.asUpdate.id!, {
          eventData: {
            ...flattenEventValues.eventData,
            locationId: props.asUpdate.locationId,
          },
          placeData:
            destination === props.asUpdate.selectedPlace?.formatted_address
              ? undefined
              : flattenEventValues.placeData,
        }).then(() => {
          if (!!user?.id) {
            getUserById(user.id).then((value) => {
              setUser?.({
                id: value.id,
                name: value.name,
                email: value.email,
                role: value.role,
              });
              setEvents?.(value.eventsParticipated);
              toast('Event has been updated successfully!');
            });
          }
        });
      } else {
        createEvent(flattenEventValues).then(() => {
          if (!!user?.id) {
            getUserById(user.id).then((value) => {
              setUser?.({
                id: value.id,
                name: value.name,
                email: value.email,
                role: value.role,
              });
              setEvents?.(value.eventsParticipated);
              toast('Event has been created successfully!');
            });
          }
        });
      }
      handleDialogClose();
    }
  }, [
    flattenEventValues,
    props.asUpdate,
    handleDialogClose,
    destination,
    user,
    setUser,
    setEvents,
  ]);

  const CommandItemsList = React.useCallback(() => {
    if (allUsers === null || participantInputValue === '') {
      return;
    }
    return allUsers
      .filter((user) =>
        user.name
          ?.toLowerCase()
          .startsWith(participantInputValue.toLowerCase()),
      )
      .map((candidate) => (
        <CommandItem
          key={candidate.id}
          onSelect={() => handleSuggestionItemClick(candidate)}
        >
          <p>{candidate.name}</p>
          <p className={'text-sm italic'}>{candidate.email}</p>
        </CommandItem>
      ));
  }, [allUsers, handleSuggestionItemClick, participantInputValue]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  React.useEffect(() => {
    const { asUpdate } = props;
    if (asUpdate) {
      console.log('render');
      setTitle(asUpdate.title);
      setDescription(asUpdate.description);
      setOccurrence(asUpdate.occurrence);
      setDestination(asUpdate.selectedPlace?.formatted_address ?? '');
      setSelectedPlace(asUpdate.selectedPlace);
      setParticipants(asUpdate.participants);
      setAllUsers((prevState) => {
        const availableUsersList = prevState?.filter(
          (user) =>
            !asUpdate.participants.find(
              (selectedParticipantUser) =>
                selectedParticipantUser.id === user.id,
            ),
        );
        return availableUsersList ?? prevState;
      });
      setDate(new Date(asUpdate.dateTime));
      setTimeValue(
        getHours(asUpdate.dateTime) + ':' + getMinutes(asUpdate.dateTime),
      );
      if (map) {
        new google.maps.DirectionsRenderer({ map }).setMap(null);
      }
    }
  }, [map, props]);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          handleDialogClose();
          setIsEditingEvent?.(false);
        } else {
          setIsEditingEvent?.(true);
        }
      }}
    >
      <DialogTrigger asChild>
        {!props.asUpdate ? (
          <Button>
            <Plus size={18} />
            Create Event
          </Button>
        ) : (
          <Button variant={'secondary'} className={'py-0 h-8'}>
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-32px)] h-[calc(100%-32px)] max-w-none p-4 gap-2 overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {!props.asUpdate ? 'New Event' : 'Update Event'}
          </DialogTitle>
          <DialogDescription>
            {!props.asUpdate
              ? 'Create a new event and invite colleagues/ friends!'
              : "Modify your event's description or add more participants!"}
          </DialogDescription>
        </DialogHeader>
        <div className=" flex gap-4 h-[calc(100vh-200px)]">
          <div className="flex flex-col w-fit h-full overflow-y-auto gap-4 px-2">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                placeholder="Title of the Event..."
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="Description"
                placeholder="Description of the Event..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="participants">Participants</Label>
              <Command shouldFilter={false}>
                <div
                  className={
                    'border-2 border-gray-100 focus-within:border-gray-700 rounded-md'
                  }
                >
                  <CommandInput
                    id="participants"
                    placeholder="Type to search..."
                    value={participantInputValue}
                    onValueChange={(value) => setParticipantInputValue(value)}
                    ref={participantsInputRef}
                  />
                </div>
                <CommandList className={'bg-muted'}>
                  {allUsers !== null && participantInputValue !== '' && (
                    <>
                      {allUsers.length === 0 && (
                        <CommandEmpty>
                          No user found with that name.
                        </CommandEmpty>
                      )}
                      <CommandGroup heading={'Suggestions'}>
                        {allUsers.length > 0 && <CommandItemsList />}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </div>
            <div className="flex flex-wrap w-full max-w-sm items-center gap-1.5">
              <ParticipantChip username={'You'} hideClearButton isHost />
              {participants.map((participant, index) => (
                <ParticipantChip
                  key={index}
                  username={participant.name}
                  onClearButtonClick={() =>
                    handleParticipantItemCancelClick(participant)
                  }
                />
              ))}
            </div>
            <div className="grid grid-cols-3 w-full max-w-sm items-center gap-1.5">
              <div className="col-span-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                      )}
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className=" col-span-1 items-center gap-1.5">
                <Label htmlFor="time">Time</Label>
                <TimePicker
                  id={'time'}
                  value={timeValue}
                  onTimeChange={handleTimeChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 w-full max-w-sm items-center gap-1.5">
              <div className="col-span-2">
                <Label htmlFor="occurrence">Occurrence</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Single (default)`}
                      className={'capitalize'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(EventOccurrence).map((value, index) => (
                      <SelectItem
                        value={value}
                        key={index}
                        className={'capitalize'}
                      >
                        {' '}
                        {value.toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1">
            <div className="w-full h-full">
              <Map
                defaultCenter={{
                  lat: selectedPlace?.geometry?.location?.lat() ?? 54.526,
                  lng: selectedPlace?.geometry?.location?.lng() ?? 15.2551,
                }}
                defaultZoom={!!selectedPlace?.geometry?.location ? 12 : 4}
                gestureHandling={'greedy'}
                mapId={'49ae42fed52588c3'}
                reuseMaps={false}
                disableDefaultUI
              >
                <div className="w-1/2 absolute top-2 left-2">
                  <GoogleMapsAutocomplete
                    inputValue={destination}
                    onInputValueChange={(value) => setDestination(value)}
                    onSelect={handlePlaceSelect}
                  />
                </div>
                {!!selectedPlace?.geometry?.location && (
                  <MarkerWithInfoWindow
                    position={selectedPlace.geometry.location}
                    description={selectedPlace.name}
                  />
                )}
              </Map>
            </div>
            <div
              className={`${selectedPlace ? 'min-h-20' : 'min-h-8 border-l-4 border-gray-500'}`}
            >
              {selectedPlace ? (
                <div className="flex flex-col gap-2 p-2">
                  <div className="text-2xl font-semibold w-full border-b-2">
                    {selectedPlace.name}
                  </div>
                  <div>Address: {selectedPlace.formatted_address}</div>
                </div>
              ) : (
                <p className={'text-lg p-2 font-semibold '}>
                  Select your event&#39;s location
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="pt-4 border-t flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              disabled={!flattenEventValues}
              onClick={() => handleSubmit()}
            >
              {!props.asUpdate ? 'Create' : 'Update'}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrUpdateEventDialog;
