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
import { useTravelContext } from '@/contexts/travel-context';

type GoogleMapsAutocompleteProps = {
  onSelect: (place: google.maps.places.PlaceResult | null) => void;
};

const GoogleMapsAutocomplete: React.FC<GoogleMapsAutocompleteProps> = ({
  onSelect,
}) => {
  const map = useMap();
  const places = useMapsLibrary('places');
  const [suggestions, setSuggestions] =
    React.useState<Array<google.maps.places.AutocompletePrediction> | null>(
      null,
    );
  const [sessionToken, setSessionToken] =
    React.useState<google.maps.places.AutocompleteSessionToken | null>(null);
  const [autocompleteService, setAutocompleteService] =
    React.useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] =
    React.useState<google.maps.places.PlacesService | null>(null);
  const [fetchingData, setFetchingData] = React.useState<boolean>(false);
  const { originValue, setOriginValue } = useTravelContext();

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
      setSuggestions(response.predictions);
      setFetchingData(false);
    },
    [autocompleteService, sessionToken],
  );

  const onInputChange = React.useCallback(
    (searchValue: string) => {
      setOriginValue(searchValue);
      fetchPlaceDetails(searchValue);
    },
    [fetchPlaceDetails, setOriginValue],
  );

  const handleSuggestionClick = React.useCallback(
    (placeId: string) => {
      if (!places || !sessionToken) return;
      const detailRequestOptions = {
        placeId,
        fields: ['place_id', 'geometry', 'name', 'formatted_address'],
        sessionToken,
      };

      const detailsRequestCallback = (
        placeDetails: google.maps.places.PlaceResult | null,
      ) => {
        onSelect?.(placeDetails);
        setSuggestions(null);
        setOriginValue(placeDetails?.formatted_address ?? '');
        setSessionToken(new places.AutocompleteSessionToken());

        setFetchingData(false);
      };

      placesService?.getDetails(detailRequestOptions, detailsRequestCallback);
    },
    [onSelect, places, placesService, sessionToken, setOriginValue],
  );

  const CommandItemsList = React.useCallback(() => {
    return suggestions?.map((suggestion) => (
      <CommandItem
        key={suggestion.place_id}
        value={suggestion.place_id}
        onSelect={(value) => handleSuggestionClick(value)}
      >
        {suggestion.description}
      </CommandItem>
    ));
  }, [handleSuggestionClick, suggestions]);

  return (
    <div className="w-full max-w-md border-2 rounded-md">
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search for a place"
          value={originValue}
          onValueChange={(event) => onInputChange(event)}
          className="w-full"
        />
        <CommandList className="z-10 bg-muted">
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
