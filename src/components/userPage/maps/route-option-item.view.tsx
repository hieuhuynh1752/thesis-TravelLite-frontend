'use client';
import * as React from 'react';
import { useTravelContext } from '@/contexts/travel-context';
import { generateRandomId } from '@/utils/utils';
import { fetchEmissions } from '../../../../services/api/emission.api';
import {
  isTransitRoutes,
  Step,
  TransitRoute,
} from '../../../../services/api/type.api';

const RouteOptionItem: React.FC<{ travelMode: google.maps.TravelMode }> = ({
  travelMode,
}) => {
  const { responses, setSelectedRoute } = useTravelContext();

  const [routes, setRoutes] = React.useState<TransitRoute[] | Step[]>([]);
  const [expandedRouteIndex, setExpandedRouteIndex] = React.useState<
    number | null
  >(null); // Track which route is expanded

  const rawResult = React.useMemo(() => {
    return responses.find(
      (response) => response.request.travelMode === travelMode,
    );
  }, [responses, travelMode]);

  const rawRoutes = React.useMemo(() => {
    return responses.find(
      (response) => response.request.travelMode === travelMode,
    )?.routes;
  }, [responses, travelMode]);

  const parsedTransitRoutes = React.useMemo(() => {
    if (!rawRoutes) {
      return [];
    }
    return rawRoutes.map((route) => {
      const legs = route.legs[0];
      const steps = legs.steps.map((step) => {
        if (step.travel_mode === 'TRANSIT') {
          return {
            type: 'transit',
            line: step.transit?.line.name,
            vehicle: step.transit?.line.vehicle.name,
            vehicleType: step.transit?.line.vehicle.type.toLowerCase(),
            distance: step.distance?.value,
            departureStop: step.transit?.departure_stop.name,
            arrivalStop: step.transit?.arrival_stop.name,
            departureTime: step.transit?.departure_time.text,
            arrivalTime: step.transit?.arrival_time.text,
            numberOfStops: step.transit?.num_stops,
            //metros
            color: step.transit?.line.color,
            textColor: step.transit?.line.text_color,
            shortName: step.transit?.line.short_name,
          };
        } else {
          return {
            type: 'walking',
            duration: step.duration?.text,
          };
        }
      }) as Step[];

      return {
        duration: legs.duration?.text,
        arrivalTime: legs.arrival_time?.text,
        departureTime: legs.departure_time?.text,
        steps: steps,
      } as TransitRoute;
    });
  }, [rawRoutes]);

  const parsedOtherRoutes = React.useMemo(() => {
    if (!rawResult) {
      return [];
    }
    return rawResult.routes.map((route) => {
      return {
        type: rawResult.request.travelMode.toLowerCase(),
        distance: route.legs[0]?.distance?.value,
        //to be implemented: Feat: Allow user to enter vehicleType
        vehicleType: undefined,
        duration: route.legs[0]?.duration?.text,
        summary: route.summary,
      };
    }) as Step[];
  }, [rawResult]);

  const toggleRouteDetails = React.useCallback(
    (index: number) => {
      setSelectedRoute({ routes: rawResult, index });
      setExpandedRouteIndex(index === expandedRouteIndex ? null : index); // Toggle expansion
    },
    [setSelectedRoute, setExpandedRouteIndex, expandedRouteIndex, rawResult],
  );

  const handleCalculateCO2 = React.useCallback(async (steps: Step[]) => {
    try {
      return await fetchEmissions(steps);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleGetTransitRoutesWithCO2 = React.useCallback(async () => {
    const data = await Promise.all(
      parsedTransitRoutes.map(async (route) => {
        const newSteps = await handleCalculateCO2(route.steps);
        let totalCo2 = 0;
        newSteps?.steps.map((step) => {
          totalCo2 += step?.co2 ?? 0;
        });
        return {
          ...route,
          totalCo2: parseFloat(totalCo2.toFixed(1)),
          steps: newSteps?.steps ?? route.steps,
        };
      }),
    );
    setRoutes(data);
  }, [setRoutes, parsedTransitRoutes, handleCalculateCO2]);

  const handleGetRoutesWithCO2 = React.useCallback(async () => {
    const newSteps = await handleCalculateCO2(parsedOtherRoutes);
    const data = newSteps?.steps ?? parsedOtherRoutes;
    setRoutes(data);
  }, [setRoutes, parsedOtherRoutes, handleCalculateCO2]);

  React.useEffect(() => {
    if (travelMode === 'TRANSIT') {
      handleGetTransitRoutesWithCO2();
    } else {
      handleGetRoutesWithCO2();
    }
  }, [travelMode, handleGetTransitRoutesWithCO2, handleGetRoutesWithCO2]);

  const generateBreadcrumbs = (steps: Step[]) => {
    return steps.map((step, index) => {
      if (step.type === 'walking') {
        return (
          <span key={generateRandomId()} className="flex gap-2">
            <span className="flex items-center space-x-1">
              <span>
                <i className="fas fa-walking"></i>
              </span>
            </span>
            {index < steps.length - 1 ? (
              <span className="flex items-center space-x-1 text-gray-400">
                <i className="fas fa-caret-right"></i>
              </span>
            ) : null}
          </span>
        );
      } else {
        return (
          <span key={generateRandomId()} className="flex gap-2">
            <span className="flex items-center space-x-1 text-gray-800 font-medium">
              {step.color ? (
                <span
                  style={{
                    background: step.color,
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 'small',
                    lineHeight: 'normal',
                  }}
                  className="p-1 rounded"
                >
                  {step.vehicle === 'Bus' ? 'B' : 'M'}
                </span>
              ) : (
                <span className="border-2 border-gray-400 text-gray-500 rounded p-0.5 leading-none">
                  <i className="fas fa-train"></i>
                </span>
              )}
              <span className="font-medium">{step.shortName ?? step.line}</span>
            </span>
            {index < steps.length - 1 ? (
              <span className="flex items-center text-gray-400 space-x-1">
                <i className="fas fa-caret-right"></i>
              </span>
            ) : null}
          </span>
        );
      }
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-full h-fit">
      {travelMode === google.maps.TravelMode.TRANSIT && isTransitRoutes(routes)
        ? routes.map((route, index) => (
            <div
              key={generateRandomId()}
              className="mb-6 border border-gray-300 rounded-lg bg-white p-4 shadow"
            >
              {/* Basic Information */}
              <div
                className="cursor-pointer"
                onClick={() => toggleRouteDetails(index)}
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-800">
                    {route.departureTime} — {route.arrivalTime}
                  </p>
                  <div>
                    <p className="text-gray-600 text-sm text-right">
                      Total: {route.duration ? route.duration : 'NaN'}
                    </p>

                    <p className="text-right text-sm bg-green-100 px-2 rounded">
                      <i className="fa-solid fa-leaf text-green-500 pr-2"></i>
                      {route.totalCo2} kg CO₂e
                    </p>
                  </div>
                </div>

                {/* Breadcrumbs */}
                <div className="flex flex-wrap items-center mt-2 text-gray-700 space-x-2 gap-y-2">
                  {generateBreadcrumbs(route.steps)}
                </div>
              </div>

              {/* Expandable Detailed Information */}
              {expandedRouteIndex === index && (
                <div className="mt-4 space-y-2">
                  {route.steps.map((step) => (
                    <div
                      key={generateRandomId()}
                      className="p-2 bg-gray-50 rounded flex items-center"
                    >
                      {step.type === 'walking' ? (
                        <p className="flex gap-2 text-gray-700 font-semibold">
                          <span className="flex items-center w-4 space-x-1 justify-center">
                            <span>
                              <i className="fas fa-walking"></i>
                            </span>
                          </span>{' '}
                          Walk for {step.duration}
                        </p>
                      ) : (
                        <div className="flex gap-2 text-gray-700 grow">
                          <div className="flex text-gray-500 leading-none w-4 justify-center p-1">
                            <i
                              className={
                                step.vehicle === 'Bus'
                                  ? 'fas fa-bus'
                                  : 'fas fa-train'
                              }
                            ></i>
                          </div>{' '}
                          <div className="flex flex-col grow pr-2 gap-y-1">
                            <div className="flex justify-between">
                              <div className="flex font-semibold">
                                Take {step.vehicle}{' '}
                                {step.shortName ?? step.line}{' '}
                              </div>
                              <div className="flex font-semibold flex-col">
                                <p>
                                  {step.departureTime} — {step.arrivalTime}
                                </p>
                                <p className=" self-end font-medium text-sm bg-green-100 px-2 rounded">
                                  <i className="fa-solid fa-leaf text-green-500 pr-2"></i>
                                  {step.co2} kg CO₂e
                                </p>
                              </div>
                            </div>
                            <div className="text-sm">{step.line}</div>
                            <div>
                              From{' '}
                              <span className="font-medium">
                                {step.departureStop}
                              </span>{' '}
                              to{' '}
                              <span className="font-medium">
                                {step.arrivalStop}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        : (routes as Step[]).map((route, index) => {
            return (
              <div
                key={generateRandomId()}
                className="mb-6 border border-gray-300 rounded-lg bg-white p-4 shadow"
              >
                {/* Basic Information */}
                <div
                  className="cursor-pointer"
                  onClick={() => toggleRouteDetails(index)}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800">
                      via {route.summary}
                    </p>
                    <div>
                      <p className="text-gray-600 text-sm text-right">
                        Total: {route.duration ? route.duration : 'NaN'}
                      </p>

                      <p className="text-right text-sm bg-green-100 px-2 rounded">
                        <i className="fa-solid fa-leaf text-green-500 pr-2"></i>
                        {route.co2} kg CO₂e
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
    </div>
  );
};

export default RouteOptionItem;
