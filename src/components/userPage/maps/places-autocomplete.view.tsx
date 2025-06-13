'use client';
import * as React from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { CommandLoading } from 'cmdk';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { AirportDetails } from '../../../../services/api/type.api';

type GoogleMapsAutocompleteProps = {
  inputValue: string;
  onInputValueChange: (value: string) => void;
  onSelect: (
    place: google.maps.places.PlaceResult | null,
    airportDetails?: AirportDetails,
  ) => void;
  className?: string;
};

const GoogleMapsAutocomplete: React.FC<GoogleMapsAutocompleteProps> = (
  props,
) => {
  const map = useMap();
  const places = useMapsLibrary('places');
  const [suggestions, setSuggestions] =
    React.useState<Array<google.maps.places.AutocompletePrediction> | null>(
      null,
    );
  const [value, setValue] = React.useState(props.inputValue);
  const [sessionToken, setSessionToken] =
    React.useState<google.maps.places.AutocompleteSessionToken | null>(null);
  const [autocompleteService, setAutocompleteService] =
    React.useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] =
    React.useState<google.maps.places.PlacesService | null>(null);
  const [fetchingData, setFetchingData] = React.useState<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!places || !map) return;
    setAutocompleteService(new places.AutocompleteService());
    setPlacesService(new places.PlacesService(map));
    setSessionToken(new places.AutocompleteSessionToken());
    return () => setAutocompleteService(null);
  }, [map, places]);

  const fetchPlaceDetails = React.useCallback(
    async (inputValue: string) => {
      if (!autocompleteService || !inputValue || !sessionToken) {
        setSuggestions(null);
        return;
      }
      setFetchingData(true);
      const request = { input: inputValue, sessionToken };
      const response = await autocompleteService.getPlacePredictions(request);
      console.log(response.predictions);
      setSuggestions(response.predictions);
      setFetchingData(false);
    },
    [autocompleteService, sessionToken],
  );

  const onInputChange = React.useCallback(
    (searchValue: string) => {
      // props.onInputValueChange?.(searchValue);
      setValue(searchValue);
      fetchPlaceDetails(searchValue);
    },
    [fetchPlaceDetails],
  );

  const handleSuggestionClick = React.useCallback(
    (placeId: string, suggestion: string) => {
      if (!places || !sessionToken) return;
      console.log(suggestion);
      const detailRequestOptions = {
        placeId,
        fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types'],
        sessionToken,
      };

      const detailsRequestCallback = (
        placeDetails: google.maps.places.PlaceResult | null,
      ) => {
        if (placeDetails?.types?.find((type) => type === 'airport')) {
          const matched_iata_code =
            suggestion.match(/\(([A-Z]{3})\)/)?.[1] ?? '';
          props.onSelect?.(placeDetails, {
            iataCode: matched_iata_code,
            lat: placeDetails?.geometry?.location?.lat() ?? 0,
            lng: placeDetails?.geometry?.location?.lng() ?? 0,
          });
        } else {
          props.onSelect?.(placeDetails);
        }
        setSuggestions(null);
        props.onInputValueChange?.(placeDetails?.name ?? '');
        setSessionToken(new places.AutocompleteSessionToken());
        if (placeDetails?.name && placeDetails.name !== '') {
          setValue(placeDetails.name);
        }

        setFetchingData(false);
      };

      placesService?.getDetails(detailRequestOptions, detailsRequestCallback);
    },
    [places, placesService, props, sessionToken],
  );

  const CommandItemsList = React.useCallback(() => {
    return suggestions?.map((suggestion) => (
      <CommandItem
        key={suggestion.place_id}
        value={suggestion.place_id}
        onSelect={(value) =>
          handleSuggestionClick(value, suggestion.description)
        }
      >
        {suggestion.description}
      </CommandItem>
    ));
  }, [handleSuggestionClick, suggestions]);

  return (
    <div
      className={
        'w-full border-2 focus-within:border-gray-700 rounded-lg ' +
        props.className
      }
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search for a place"
          value={value}
          onValueChange={(event) => onInputChange(event)}
          className="w-full"
          ref={inputRef}
        >
          {props.inputValue && (
            <Button
              variant="ghost"
              className={'px-1 py-0 ml-2 h-6 rounded-sm'}
              onClick={() => {
                onInputChange('');
                inputRef?.current?.focus();
              }}
            >
              <X />
            </Button>
          )}
        </CommandInput>
        <CommandList className="z-10 bg-gray-50">
          {fetchingData && <CommandLoading />}
          {suggestions !== null && (
            <>
              {suggestions.length === 0 && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
              <CommandGroup heading={'Suggestions'}>
                {suggestions.length > 0 && <CommandItemsList />}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </div>
  );
};

export default GoogleMapsAutocomplete;
