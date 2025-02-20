import * as React from 'react';

type MapProps = {
  center: google.maps.LatLngLiteral;
  zoom: number;
  onLoad?: (map: google.maps.Map) => void;
};

const Map: React.FC<MapProps> = ({ center, zoom, onLoad }) => {
  const mapRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
    });

    if (onLoad) onLoad(map);
  }, [center, zoom, onLoad]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};

export default Map;
