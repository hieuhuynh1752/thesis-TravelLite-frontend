import React from 'react';
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
} from '@vis.gl/react-google-maps';

import { Polyline } from './polyline';

const defaultAppearance = {
  walkingPolylineColor: '#D8EAD9',
  bicyclingPolylineColor: '#81C784',
  transitFallbackPolylineColor: '#2E7D32',
  defaultPolylineColor: '#9a1e45',
  stepMarkerFillColor: '#0F3B13',
  stepMarkerBorderColor: '#000000',
};

type Appearance = typeof defaultAppearance;

export type RouteProps = {
  // apiClient: RoutesApi;
  origin?: google.maps.LatLng;
  destination?: google.maps.LatLng;
  route: any;
  routeOptions?: any;
  appearance?: Partial<Appearance>;
};

const Route = (props: RouteProps) => {
  const { route, origin, destination } = props;

  if (!route) return null;

  // With only two waypoints, our route will have a single leg.
  // We now want to create a visualization for the steps in that leg.
  const routeSteps: any[] = route.legs[0].steps;

  console.log(route.legs[0]);

  const appearance = { ...defaultAppearance, ...props.appearance };

  // Every step of the route is visualized using a polyline (see ./polyline.tsx);
  // color and weight depend on the travel mode. For public transit lines
  // with established colors, the official color will be used.
  const polylines = routeSteps.map((step, index) => {
    const isWalking = step.travel_mode === google.maps.TravelMode.WALKING;
    const isBicycling = step.travel_mode === google.maps.TravelMode.BICYCLING;
    const isTransit = step.travel_mode === google.maps.TravelMode.TRANSIT;
    const color = isWalking
      ? appearance.walkingPolylineColor
      : isBicycling
        ? appearance.bicyclingPolylineColor
        : isTransit
          ? (step?.transitDetails?.transitLine?.color ??
            appearance.transitFallbackPolylineColor)
          : appearance.defaultPolylineColor;
    return (
      <Polyline
        key={`${index}-polyline`}
        encodedPath={step.polyline.points}
        strokeWeight={isWalking ? 2 : 6}
        strokeColor={color}
      />
    );
  });

  // At the beginning of every step, an AdvancedMarker with a small circle is placed.
  // The beginning of the first step is omitted for a different marker.
  const stepMarkerStyle = {
    backgroundColor: appearance.stepMarkerFillColor,
    borderColor: appearance.stepMarkerBorderColor,
    width: 8,
    height: 8,
    border: `1px solid`,
    borderRadius: '50%',
  };

  const stepMarkers = routeSteps.slice(1).map((step, index) => {
    const position = {
      lat: step.start_location.lat,
      lng: step.start_location.lng,
    };

    return (
      <AdvancedMarker
        key={`${index}-start`}
        anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
        position={position}
      >
        <div style={stepMarkerStyle} />
      </AdvancedMarker>
    );
  });

  return (
    <>
      <AdvancedMarker position={origin} />
      <AdvancedMarker position={destination} />

      {polylines}
      {stepMarkers}
    </>
  );
};

export default React.memo(Route);
