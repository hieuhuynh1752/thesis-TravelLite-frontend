'use client';
import * as React from 'react';
import {
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';

export const MarkerWithInfoWindow = ({
  position,
}: {
  position: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined;
}) => {
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
          This supposed to be the description of the meeting location
        </InfoWindow>
      )}
    </>
  );
};
