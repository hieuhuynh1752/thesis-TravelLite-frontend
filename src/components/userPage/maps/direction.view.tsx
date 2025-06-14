'use client';
import * as React from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import {
  LocationType,
  SelectedRouteType,
  useTravelContext,
} from '@/contexts/travel-context';
import { format } from 'date-fns';
import { FlightDetails } from '../../../../services/api/type.api';

type DirectionsProps = {
  origin?: LocationType;
  destination?: LocationType;
  travelMode?: google.maps.TravelMode;
  arrivalTime?: Date;
  departureTime?: Date;
  plainRoute?: SelectedRouteType;
};

const Directions: React.FC<DirectionsProps> = ({
  origin,
  destination,
  arrivalTime,
  departureTime,
  plainRoute,
}) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] =
    React.useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    React.useState<google.maps.DirectionsRenderer>();

  const {
    responses,
    setResponses,
    setFlightsResponses,
    selectedRoute,
    setSelectedRoute,
    setUnavailableTravelModes,
    directionsCollection,
    setSelectedFlightMode,
    setSelectedTravelMode,
  } = useTravelContext();

  const travelModes = React.useMemo<google.maps.TravelMode[]>(
    () => Object.values(google.maps.TravelMode),
    [],
  );

  React.useEffect(() => {
    if (!routesLibrary || !map || !origin || !destination) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer());
  }, [routesLibrary, map, origin, destination]);

  React.useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin || !destination) {
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
      setResponses([]);
      return;
    }

    const fetchRoutesForAllModes = async () => {
      try {
        const responses: google.maps.DirectionsResult[] = [];
        if (origin.airport && destination.airport) {
          let flights = [];
          fetch(
            `/api/searchFlights?departure=${origin.airport.iataCode}&arrival=${destination.airport.iataCode}&outbound_date=${format(departureTime ?? new Date(), 'yyyy-MM-dd')}`,
          )
            .then(async (res) => {
              if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `Error ${res.status}`);
              }
              return res.json();
            })
            .then((data) => {
              // data.airports[0].departure[0].latitude / longitude, etc.
              flights = data.best_flights
                ? data.best_flights.concat(data.other_flights)
                : data.other_flights;
              console.log(flights);
              setFlightsResponses?.(flights as FlightDetails[]);
              setSelectedFlightMode?.(false);
            })
            .catch((e) => {
              console.error('Flight fetch failed:', e.message);
            });
          setSelectedFlightMode?.(false);
        }

        await Promise.all(
          travelModes.map(async (mode) => {
            try {
              const response = await directionsService.route({
                origin: { placeId: origin.id } as google.maps.Place,
                destination: {
                  placeId: destination.id,
                } as google.maps.Place,
                travelMode: mode,
                provideRouteAlternatives: true,
                transitOptions: {
                  arrivalTime: arrivalTime,
                  departureTime: departureTime,
                },
                drivingOptions: departureTime
                  ? {
                      departureTime: departureTime,
                    }
                  : undefined,
              });
              // Ensure the response is valid
              if (response && response.routes && response.routes.length > 0) {
                responses.push(response);
              } else {
                console.warn(`No routes found for travel mode: ${mode}`);
              }
            } catch (error) {
              setUnavailableTravelModes((prevState) => {
                const newState = prevState;
                newState.add(mode);
                return newState;
              });
              console.warn(
                `Failed to fetch directions for mode: ${mode}`,
                error,
              );
            }
          }),
        );
        setResponses(responses);
        setSelectedRoute({ routes: responses[0], index: 0 });
        directionsRenderer.setDirections(responses[0]);
        setSelectedTravelMode(google.maps.TravelMode.DRIVING);
      } catch (error) {
        console.error('Error fetching directions:', error);
      }
    };
    if (!plainRoute) {
      fetchRoutesForAllModes();
    }
  }, [
    setSelectedRoute,
    directionsService,
    directionsRenderer,
    origin,
    destination,
    travelModes,
    setResponses,
    setUnavailableTravelModes,
    arrivalTime,
    departureTime,
    plainRoute,
    setFlightsResponses,
    setSelectedFlightMode,
    setSelectedTravelMode,
  ]);

  React.useEffect(() => {
    console.log(origin, destination);
  }, [origin, destination]);

  // Update direction route
  React.useEffect(() => {
    if (
      !directionsRenderer ||
      !map ||
      (responses.length === 0 && directionsCollection?.length === 0)
    )
      return;
    if (selectedRoute.routes) {
      directionsRenderer.setMap(map);
      directionsRenderer.setDirections(selectedRoute.routes ?? null);
      directionsRenderer.setRouteIndex(selectedRoute.index);
    } else if (plainRoute) {
      directionsRenderer.setMap(map);
      directionsRenderer.setDirections(plainRoute.routes ?? null);
      directionsRenderer.setRouteIndex(plainRoute.index);
    } else {
      console.warn('Invalid directions result; skipping render.');
    }

    return () => {
      directionsRenderer.setMap(null);
    };
  }, [
    selectedRoute,
    directionsRenderer,
    responses,
    map,
    directionsCollection?.length,
    plainRoute,
  ]);

  // if (!leg) return null;

  return <div className=""></div>;
};

export default Directions;
