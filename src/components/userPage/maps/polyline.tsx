import * as React from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

type PolylineCustomProps = {
  encodedPath?: string;
  pathCoordinates?: google.maps.LatLngLiteral[];
};

export type PolylineProps = google.maps.PolylineOptions & PolylineCustomProps;

export const Polyline = (props: PolylineProps) => {
  const { pathCoordinates, encodedPath, ...polylineOptions } = props;

  const map = useMap();
  const geometryLibrary = useMapsLibrary('geometry');
  const mapsLibrary = useMapsLibrary('maps');

  const [polyline, setPolyline] = React.useState<google.maps.Polyline | null>(
    null,
  );

  // 1) Create a new google.maps.Polyline instance once the Maps API is ready
  React.useEffect(() => {
    if (!mapsLibrary) return;
    const pl = new mapsLibrary.Polyline();
    setPolyline(pl);
  }, [mapsLibrary]);

  // 2) Whenever google.maps.PolylineOptions change, update them
  React.useEffect(() => {
    if (!polyline) return;
    polyline.setOptions(polylineOptions);
  }, [polyline, polylineOptions]);

  // 3) If pathCoordinates is provided, use it; otherwise decode encodedPath
  React.useEffect(() => {
    if (!polyline) return;

    if (Array.isArray(pathCoordinates) && pathCoordinates.length > 0) {
      // Directly set the array of {lat, lng}
      polyline.setPath(pathCoordinates);
    } else if (encodedPath && geometryLibrary) {
      // Fallback: decode the encoded polyline string
      const decoded = geometryLibrary.encoding.decodePath(encodedPath);
      polyline.setPath(decoded);
    }
    // If neither prop is provided, do nothing (leave previous path or empty).
  }, [polyline, pathCoordinates, encodedPath, geometryLibrary]);

  // 4) Add the polyline to the map (and clean up on unmount)
  React.useEffect(() => {
    if (!map || !polyline) return;
    polyline.setMap(map);
    return () => {
      polyline.setMap(null);
    };
  }, [map, polyline]);

  return null;
};
