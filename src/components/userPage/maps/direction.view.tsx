'use client';
import * as React from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useTravelContext } from '@/contexts/travel-context';

type DirectionsProps = {
  origin: string;
  destination: string;
  travelMode?: google.maps.TravelMode;
};

const Directions: React.FC<DirectionsProps> = ({ origin, destination }) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] =
    React.useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    React.useState<google.maps.DirectionsRenderer>();

  const { responses, setResponses, selectedRoute, setSelectedRoute } =
    useTravelContext();
  // const [routes, setRoutes] = React.useState<google.maps.DirectionsRoute[]>([]);
  // const [responses, setResponses] = React.useState<
  //   google.maps.DirectionsResult[]
  // >([]);
  // const [routeIndex, setRouteIndex] = useState(0);
  // const selected = routes[routeIndex];
  // const leg = selectedRoute.routes[selectedRoute.index]?.route.legs[0];

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
    if (!directionsService || !directionsRenderer || !origin || !destination)
      return;

    const fetchRoutesForAllModes = async () => {
      try {
        const responses: google.maps.DirectionsResult[] = [];

        await Promise.all(
          travelModes.map(async (mode) => {
            const response = await directionsService.route({
              origin: origin,
              destination: destination,
              travelMode: mode,
              provideRouteAlternatives: true,
            });
            // Ensure the response is valid
            if (response && response.routes && response.routes.length > 0) {
              responses.push(response);
            } else {
              console.warn(`No routes found for travel mode: ${mode}`);
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
