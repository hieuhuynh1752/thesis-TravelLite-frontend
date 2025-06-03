'use client';
import * as React from 'react';
import {
  FlattenedTravelStep,
  useTravelContext,
} from '@/contexts/travel-context';
import { generateRandomId, minutesToHoursAndMinutes } from '@/utils/utils';
import { fetchEmissions } from '../../../../services/api/emission.api';
import {
  isTransitRoutes,
  Step,
  TransitRoute,
} from '../../../../services/api/type.api';
import {
  ArrowRight,
  BusFront,
  Footprints,
  Leaf,
  MessageCircleWarning,
  TrainFront,
  TramFront,
} from 'lucide-react';
import { useGoogleMaps } from '@/contexts/google-maps-context';
import Image from 'next/image';
import { parse } from 'date-fns/parse';
import { format } from 'date-fns';

const RouteOptionItems: React.FC = () => {
  const {
    responses,
    flightsResponses,
    selectedRoute,
    setSelectedRoute,
    setFlattenedSelectedRoute,
    selectedTravelMode,
    selectedFlightMode,
    setSelectedFlight,
    searchDirection,
  } = useTravelContext();
  const { TravelMode } = useGoogleMaps();

  const [routes, setRoutes] = React.useState<TransitRoute[] | Step[]>([]);
  const [expandedRouteIndex, setExpandedRouteIndex] = React.useState<
    number | null
  >(null); // Track which route is expanded

  const rawResult = React.useMemo(() => {
    return responses.find(
      (response) => response.request.travelMode === selectedTravelMode,
    );
  }, [responses, selectedTravelMode]);

  const rawRoutes = React.useMemo(() => {
    return responses.find(
      (response) => response.request.travelMode === selectedTravelMode,
    )?.routes;
  }, [responses, selectedTravelMode]);

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
        steps: route.legs[0]?.steps,
      };
    }) as Step[];
  }, [rawResult]);

  const toggleFlightDetails = React.useCallback(
    (index: number) => {
      if (
        flightsResponses &&
        searchDirection &&
        searchDirection.origin &&
        searchDirection.destination
      ) {
        setSelectedFlight?.({
          origin: searchDirection.origin,
          destination: searchDirection.destination,
          departureTime: parse(
            flightsResponses[index].flights[0].departure_airport.time,
            'yyyy-MM-dd HH:mm',
            new Date(),
          ),
          arrivalTime: parse(
            flightsResponses[index].flights[0].arrival_airport.time,
            'yyyy-MM-dd HH:mm',
            new Date(),
          ),
          details: flightsResponses[index],
        });
      }
    },
    [flightsResponses, searchDirection, setSelectedFlight],
  );

  const toggleRouteDetails = React.useCallback(
    (index: number, id: string) => {
      setSelectedRoute({ routes: rawResult, index, hashedId: id });
      setExpandedRouteIndex(index === expandedRouteIndex ? null : index); // Toggle expansion
      const leg = rawResult?.routes[index].legs[0];
      if (leg) {
        const travelSteps: FlattenedTravelStep[] = leg?.steps.map((step) => {
          const stepInfo: FlattenedTravelStep = {
            distance: step.distance?.text || '',
            duration: step.duration?.text || '',
            instructions: step.instructions.replace(/<[^>]+>/g, ''),
            travelMode: step.travel_mode,
          };
          if (step.transit) {
            stepInfo.transit = {
              line: step.transit.line.name,
              lineShortName: step.transit.line.short_name,
              lineColor: step.transit.line.color,
              vehicle: step.transit.line.vehicle.type,
              departureStop: step.transit.departure_stop.name,
              departureTime: step.transit.departure_time.text,
              arrivalStop: step.transit.arrival_stop.name,
              arrivalTime: step.transit.arrival_time.text,
              numberOfStops: step.transit.num_stops,
              //co2: isTransitRoutes(routes) ? routes[index].
            };
          }

          return stepInfo;
        });
        setFlattenedSelectedRoute?.({
          origin: leg.start_address,
          destination: leg.end_address,
          travelMode: rawResult?.request.travelMode,
          plannedAt:
            rawResult?.routes[index].legs[0].departure_time?.value ??
            new Date(),
          routeDetails: {
            ...rawResult,
            routes: [{ ...rawResult?.routes[index] }],
          },
          travelSteps,
          totalCo2: isTransitRoutes(routes)
            ? routes[index].totalCo2
            : routes[index].co2,
        });
      }
    },
    [
      setSelectedRoute,
      rawResult,
      expandedRouteIndex,
      routes,
      setFlattenedSelectedRoute,
    ],
  );

  const handleCalculateCO2 = React.useCallback(
    async (steps: Pick<Step, 'distance' | 'type' | 'vehicleType'>[]) => {
      try {
        return await fetchEmissions(steps);
      } catch (error) {
        console.log(error);
      }
    },
    [],
  );

  const handleGetTransitRoutesWithCO2 = React.useCallback(async () => {
    const data = await Promise.all(
      parsedTransitRoutes.map(async (route) => {
        const newSteps = await handleCalculateCO2(
          route.steps.map((step) => {
            return {
              type: step.type,
              distance: step.distance,
              vehicleType: step.vehicleType,
            };
          }),
        );
        let totalCo2 = 0;
        newSteps?.steps.map((step) => {
          totalCo2 += step?.co2 ?? 0;
        });
        return {
          ...route,
          totalCo2: parseFloat(totalCo2.toFixed(1)),
          steps: route.steps.map((step, index) => {
            return {
              ...step,
              co2: newSteps ? newSteps.steps[index].co2 : undefined,
            };
          }),
        };
      }),
    );
    setRoutes(data);
  }, [setRoutes, parsedTransitRoutes, handleCalculateCO2]);

  const handleGetRoutesWithCO2 = React.useCallback(async () => {
    const newSteps = await handleCalculateCO2(
      parsedOtherRoutes.map((step) => {
        return {
          type: step.type,
          distance: step.distance,
          vehicleType: step.vehicleType,
        };
      }),
    );
    const data = parsedOtherRoutes.map((step, index) => {
      return { ...step, co2: newSteps ? newSteps.steps[index].co2 : undefined };
    });
    setRoutes(data);
  }, [setRoutes, parsedOtherRoutes, handleCalculateCO2]);

  const generateBreadcrumbs = React.useCallback((steps: Step[]) => {
    return steps.map((step, index) => {
      if (step.type === 'walking') {
        return (
          <span key={generateRandomId()} className="flex gap-2">
            <span className="flex items-center space-x-1">
              <span>
                <Footprints size={18} />
              </span>
            </span>
            {index < steps.length - 1 ? (
              <span className="flex items-center space-x-1 text-gray-400">
                <ArrowRight size={18} />
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
                <span className="leading-none">
                  <TrainFront size={18} />
                </span>
              )}
              <span className="font-medium rounded px-1 border-2 border-gray-400 min-w-6 text-center">
                {step.shortName ?? step.line}
              </span>
            </span>
            {index < steps.length - 1 ? (
              <span className="flex items-center text-gray-400 space-x-1">
                <ArrowRight size={18} />
              </span>
            ) : null}
          </span>
        );
      }
    });
  }, []);

  React.useEffect(() => {
    if (selectedTravelMode !== undefined) {
      if (selectedTravelMode === 'TRANSIT') {
        handleGetTransitRoutesWithCO2();
      } else {
        handleGetRoutesWithCO2();
      }
    }
  }, [
    selectedTravelMode,
    handleGetTransitRoutesWithCO2,
    handleGetRoutesWithCO2,
  ]);

  if (!TravelMode) {
    return null;
  }
  console.log(selectedFlightMode, flightsResponses);
  if (!selectedTravelMode && selectedFlightMode) {
    return (
      <div className="p-2 min-h-full h-fit">
        {flightsResponses && (
          <div
            className={`mb-4 p-2 rounded border border-yellow-400 bg-amber-100 font-medium text-sm text-yellow-700 inline-flex gap-2 w-full`}
          >
            <MessageCircleWarning size={18} />
            <span>Current flights API only look up for Direct flights!</span>
          </div>
        )}
        {flightsResponses ? (
          flightsResponses.map((flightOption, index) => {
            const { hours, minutes } = minutesToHoursAndMinutes(
              flightOption.flights[0].duration,
            );
            const departureTime = format(
              parse(
                flightOption.flights[0].departure_airport.time.split(' ')[1],
                'HH:mm',
                new Date(),
              ),
              'h:mm a',
            );
            const arrivalTime = format(
              parse(
                flightOption.flights[0].arrival_airport.time.split(' ')[1],
                'HH:mm',
                new Date(),
              ),
              'h:mm a',
            );

            return (
              <div
                key={index}
                className={`mb-6 border border-gray-300 rounded-md bg-white p-4 border-l-8 flex justify-between items-center cursor-pointer`}
                onClick={() => toggleFlightDetails(index)}
              >
                <div className={`flex gap-4`}>
                  <Image
                    src={flightOption.airline_logo}
                    alt={'Airline logo'}
                    width={48}
                    height={48}
                  />
                  <div className={`flex flex-col`}>
                    <div className={`font-semibold`}>
                      {departureTime} - {arrivalTime}
                    </div>
                    <div className={`text-gray-500 font-medium`}>
                      {flightOption.flights[0].airline}
                    </div>
                  </div>
                </div>
                <div className={`flex flex-col gap-1`}>
                  <div className={`font-medium`}>
                    {hours} {hours > 1 ? 'hrs' : 'hr'} {minutes} min
                  </div>
                  <div>
                    <p className="text-right text-sm bg-green-100 px-2 rounded flex items-center">
                      <Leaf className="text-green-500 pr-2" size={24} />
                      {flightOption.carbon_emissions.this_flight / 1000} kg CO₂e
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div>
            There is no flights available. Please try to search for other dates!
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="p-2 min-h-full h-fit">
      {selectedTravelMode === google.maps.TravelMode.TRANSIT &&
      isTransitRoutes(routes)
        ? routes.map((route, index) => (
            <div
              key={generateRandomId()}
              className={`mb-6 border border-gray-300 rounded-md bg-white p-2 border-l-8 ${selectedRoute.hashedId === selectedTravelMode! + index ? 'border-primary' : ''}`}
            >
              {/* Basic Information */}
              <div
                className="cursor-pointer"
                onClick={() =>
                  toggleRouteDetails(index, selectedTravelMode + index)
                }
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-800">
                    {route.departureTime} — {route.arrivalTime}
                  </p>
                  <div>
                    <p className="text-gray-800 font-semibold text-sm text-right">
                      Total: {route.duration ? route.duration : 'NaN'}
                    </p>

                    <p className="text-right text-sm bg-green-100 px-2 rounded flex items-center">
                      <Leaf className="text-green-500 pr-2" size={24}></Leaf>
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
                              <Footprints />
                            </span>
                          </span>{' '}
                          Walk for {step.duration}
                        </p>
                      ) : (
                        <div className="flex gap-2 text-gray-700 grow">
                          <div className="flex text-gray-500 leading-none w-4 justify-center p-1">
                            {step.vehicle === 'Bus' ? (
                              <BusFront size={18} />
                            ) : step.vehicle === 'Tram' ? (
                              <TramFront size={18} />
                            ) : (
                              <TrainFront size={18} />
                            )}
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
                                <p className=" self-end font-medium text-sm bg-green-100 px-2 rounded flex items-center">
                                  <Leaf
                                    className="text-green-500 pr-2"
                                    size={18}
                                  ></Leaf>
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
                className={`mb-6 border border-gray-300 rounded-md bg-white p-2 border-l-8 ${selectedRoute.hashedId === selectedTravelMode! + index ? 'border-green-500' : ''}`}
              >
                {/* Basic Information */}
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    toggleRouteDetails(index, selectedTravelMode! + index)
                  }
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800 flex-1">
                      via {route.summary}
                    </p>
                    <div>
                      <p className="text-gray-800 font-semibold text-sm text-right">
                        Total: {route.duration ? route.duration : 'NaN'}
                      </p>

                      <p className="text-right text-sm bg-green-100 px-2 rounded flex items-center">
                        <Leaf className="text-green-500 pr-2" size={18}></Leaf>
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

export default RouteOptionItems;
