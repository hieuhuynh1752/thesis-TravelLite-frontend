'use client';
import * as React from 'react';
import {
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';

interface MarkerWithInfoWindowProps {
  position: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined;
  description?: string;
}

export const MarkerWithInfoWindow = ({
  position,
  description,
}: MarkerWithInfoWindowProps) => {
  const [infoWindowOpen, setInfoWindowOpen] = React.useState(true);
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        onClick={() => setInfoWindowOpen(true)}
        position={position}
      />
      {infoWindowOpen && (
        <InfoWindow
          anchor={marker}
          maxWidth={200}
          onCloseClick={() => setInfoWindowOpen(false)}
        >
          {description}
        </InfoWindow>
      )}
    </>
  );
};
