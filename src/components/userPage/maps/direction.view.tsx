'use client';
import * as React from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useTravelContext } from '@/contexts/travel-context';

type DirectionsProps = {
  origin?: string;
  destination?: string;
  travelMode?: google.maps.TravelMode;
};

const Directions: React.FC<DirectionsProps> = ({ origin, destination }) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] =
    React.useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    React.useState<google.maps.DirectionsRenderer>();

  const {
    responses,
    setResponses,
    selectedRoute,
    setSelectedRoute,
    setUnavailableTravelModes,
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

        await Promise.all(
          travelModes.map(async (mode) => {
            try {
              const response = await directionsService.route({
                origin: { placeId: origin } as google.maps.Place,
                destination: { placeId: destination } as google.maps.Place,
                travelMode: mode,
                provideRouteAlternatives: true,
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
      } catch (error) {
        console.error('Error fetching directions:', error);
      }
    };
    fetchRoutesForAllModes();
  }, [
    setSelectedRoute,
    directionsService,
    directionsRenderer,
    origin,
    destination,
    travelModes,
    setResponses,
    setUnavailableTravelModes,
  ]);

  // Update direction route
  React.useEffect(() => {
    if (!directionsRenderer || !map || responses.length === 0) return;
    if (selectedRoute.routes) {
      directionsRenderer.setMap(map);
      directionsRenderer.setDirections(selectedRoute.routes ?? null);
      directionsRenderer.setRouteIndex(selectedRoute.index);
    } else {
      console.warn('Invalid directions result; skipping render.');
    }
  }, [selectedRoute, directionsRenderer, responses, map]);

  // if (!leg) return null;

  return <div className=""></div>;
};

export default Directions;
