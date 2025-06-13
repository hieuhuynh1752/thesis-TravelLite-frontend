'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  FlattenedSelectedRoute,
  SelectedFlight,
} from '@/contexts/travel-context';
import {
  Armchair,
  ArrowLeft,
  BusFront,
  Circle,
  Footprints,
  Info,
  Leaf,
  Plane,
  Save,
  ScanBarcode,
  TrainFront,
  TramFront,
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

interface RouteDetailsProps {
  travelPlan?: FlattenedSelectedRoute & {
    eventParticipantId?: number;
    travelPlanId?: number;
  };
  flightPlan?: SelectedFlight;
  isDetailsSaved?: boolean;
  handleUpdateEditSavedTravelPlan?: () => void;
  transitRoute?: boolean;
  handleBackButton?: () => void;
  handleSaveTravelRoute?: () => void;
}

const RouteDetails = ({
  travelPlan,
  flightPlan,
  handleUpdateEditSavedTravelPlan,
  isDetailsSaved,
  handleBackButton,
  handleSaveTravelRoute,
}: RouteDetailsProps) => {
  console.log(flightPlan);
  return (
    <div className="flex flex-grow flex-col gap-2 px-2">
      {isDetailsSaved ? (
        <div className={`flex justify-between`}>
          <div className={'text-xl font-bold self-center'}>Travel Plan</div>
          <Button
            onClick={() => handleUpdateEditSavedTravelPlan?.()}
            variant={'secondary'}
            className={'py-0 h-8'}
          >
            Edit
          </Button>
        </div>
      ) : (
        <div className={`flex gap-2`}>
          <Button
            onClick={() => handleBackButton?.()}
            variant={'ghost'}
            className={'px-2 py-0 border-2 border-gray-500 h-7 w-12'}
          >
            <ArrowLeft />
          </Button>
          <div className={'text-xl font-bold text-gray-600 self-center'}>
            {flightPlan ? 'Flight details' : 'Route details'}
          </div>
        </div>
      )}
      <Separator orientation={'horizontal'} />
      <div className={'flex gap-2 pr-2'}>
        <span
          className={
            'font-medium text-primary items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/30 w-14 mr-2 h-fit shrink-0'
          }
        >
          From{' '}
        </span>{' '}
        <span className={'font-semibold'}>
          {flightPlan
            ? `${flightPlan.origin.name} (${flightPlan.origin.airport?.iataCode})`
            : travelPlan?.origin}
        </span>
      </div>
      <div className={`flex gap-2 pr-2`}>
        <span
          className={
            'font-medium text-primary items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/30 w-14 mr-2 h-fit shrink-0'
          }
        >
          To{' '}
        </span>{' '}
        <span className={'font-semibold'}>
          {flightPlan
            ? `${flightPlan.destination.name} (${flightPlan.destination.airport?.iataCode})`
            : travelPlan?.destination}
        </span>
      </div>
      <Separator orientation={'horizontal'} />
      {flightPlan ? (
        <>
          <div className={`flex gap-4`}>
            <div
              className={
                'flex flex-col bg-muted/50 rounded-md px-4 text-right min-w-fit h-full self-center justify-center'
              }
            >
              <p className={'text-lg text-primary font-semibold'}>
                {flightPlan.details.carbon_emissions.this_flight / 1000} kg{' '}
                <Leaf size={16} className={'inline'} />
              </p>
              <p className={'font-semibold'}>est. CO₂e</p>
            </div>
            <div className={`flex flex-col gap-1`}>
              <span
                className={`font-semibold text-gray-500 flex w-fit gap-1 items-center px-1 border border-gray-500 rounded`}
              >
                <Info size={16} /> Information:
              </span>
              <div>
                Typically, taking flights for this route would make{' '}
                <span className={`font-semibold`}>
                  {flightPlan.details.carbon_emissions.typical_for_this_route /
                    1000}
                </span>{' '}
                kg CO₂e Emissions.
              </div>

              <div>
                Your flight is{' '}
                {flightPlan.details.carbon_emissions.typical_for_this_route <
                flightPlan.details.carbon_emissions.this_flight ? (
                  <span className={`font-semibold text-red-500`}>
                    {flightPlan.details.carbon_emissions.difference_percent}%
                    higher than average!
                  </span>
                ) : (
                  <span className={`font-semibold text-primary`}>
                    {flightPlan.details.carbon_emissions.difference_percent}%
                    lower than average!
                  </span>
                )}
              </div>
            </div>
          </div>
          <Separator orientation={'horizontal'} />
          <div className={`flex flex-col gap-2`}>
            <div className={`inline-flex gap-2 font-semibold`}>
              <span>Departing Flight</span>
              <span>-</span>
              <span>
                {format(flightPlan.departureTime, 'EEEE, MMMM do, y')}
              </span>
            </div>
            <div className={`flex gap-2 px-8 pb-2`}>
              <div className={`flex flex-col gap-1 self-end`}>
                <span className={`font-bold text-primary text-xl self-center`}>
                  {flightPlan.origin.airport?.iataCode}
                </span>
                <span className={`font-medium text-sm`}>
                  {format(flightPlan.departureTime, 'hh:mm a')}
                </span>
                <span className={`flex self-center`}>
                  <Circle className={`text-gray-500`} />
                </span>
              </div>
              <div className={`flex flex-col grow`}>
                <span className={`self-center`}>
                  <Image
                    src={flightPlan.details.airline_logo}
                    alt={'Airline logo'}
                    width={42}
                    height={42}
                  />
                </span>
                <span className={`self-center`}>
                  {Math.floor(flightPlan.details.flights[0].duration / 60)}{' '}
                  hours {flightPlan.details.flights[0].duration % 60} minutes
                </span>
                <span className={`flex gap-1 items-center`}>
                  <Separator
                    orientation={'horizontal'}
                    className={`h-1 bg-gray-300 w-auto grow rounded`}
                  />
                  <Plane className={`text-gray-500`} />
                  <Separator
                    orientation={'horizontal'}
                    className={`h-1 bg-gray-300 w-auto grow rounded`}
                  />
                </span>
              </div>
              <div className={`flex flex-col gap-1 self-end`}>
                <span className={`font-bold text-primary text-xl self-center`}>
                  {flightPlan.destination.airport?.iataCode}
                </span>
                <span className={`font-medium text-sm`}>
                  {format(flightPlan.arrivalTime, 'hh:mm a')}
                </span>
                <span className={`flex self-center`}>
                  <Circle className={`text-gray-500`} />
                </span>
              </div>
            </div>
            <Separator orientation={'horizontal'} />
            <div className={`flex flex-col gap-2`}>
              <div>
                <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
                  <Plane size={16} className="self-center" />
                  {'Plane Type'}
                </div>
                {flightPlan.details.flights[0].airplane}
              </div>
              <div>
                <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
                  <ScanBarcode size={16} className="self-center" />
                  {'Flight Number'}
                </div>
                {flightPlan.details.flights[0].flight_number}
              </div>
              <div>
                <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
                  <Armchair size={16} className="self-center" />
                  {'Legroom'}
                </div>
                {flightPlan.details.flights[0].extensions?.[0]}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={`flex gap-2 pl-2 justify-between`}>
            <div className={''}>
              <p className={'text-lg'}>
                <span className={'text-xl font-semibold'}>
                  {travelPlan?.routeDetails?.routes[0].legs[0].duration?.text}
                </span>{' '}
                ({travelPlan?.routeDetails?.routes[0].legs[0].distance?.text})
              </p>
              <p>
                by {travelPlan?.travelMode.toLowerCase()} via{' '}
                {travelPlan?.routeDetails?.routes[0].summary}
              </p>
            </div>
            <div
              className={
                'flex flex-col bg-muted/50 rounded-md px-4 text-right min-w-fit h-fit'
              }
            >
              <p className={'text-lg text-primary font-semibold'}>
                {travelPlan?.totalCo2} kg{' '}
                <Leaf size={16} className={'inline'} />
              </p>
              <p className={'font-semibold'}>est. CO₂e</p>
            </div>
          </div>
          <Separator orientation={'horizontal'} />
          <ol className="flex flex-col space-y-4 pb-4 overflow-y-auto">
            {travelPlan?.travelSteps?.map((step, index, allSteps) => (
              <li
                key={index}
                className={`isolate relative flex-1 
            ${index === 0 ? 'before:w-0' : 'before:w-0.5'} before:content-[''] before:h-[100%] before:bg-primary before:inline-block before:absolute before:-top-0 before:left-4 lg:before:left-5
            ${allSteps.length - 1 === index ? 'after:w-0 before:h-[50%]' : 'after:w-0.5'} after:content-[''] after:h-[50%]  after:bg-primary after:inline-block after:absolute after:-bottom-4 after:left-4 lg:after:left-5 `}
              >
                <a className="flex items-start">
                  <span className="my-auto z-10 w-8 h-8 aspect-square border-primary border-2 bg-white text-primary font-semibold rounded-full flex justify-center items-center mr-3 text-sm lg:w-10 lg:h-10">
                    {travelPlan.travelMode ===
                    google.maps.TravelMode.TRANSIT ? (
                      step.transit ? (
                        step.transit.vehicle === 'BUS' ? (
                          <BusFront />
                        ) : step.transit.vehicle === 'TRAM' ? (
                          <TramFront />
                        ) : (
                          <TrainFront />
                        )
                      ) : (
                        <Footprints />
                      )
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </span>
                  <div className="block shadow-none transition-shadow duration-300 hover:shadow-md cursor-default hover:shadow-gray-400 p-4 rounded-xl min-w-[50%] max-w-[80%] w-full border-primary font-medium border-2">
                    <div className="text-sm">{step.instructions}</div>
                    {step.transit && (
                      <div className="text-sm pt-2 flex flex-col gap-2 ">
                        <Separator orientation={'horizontal'} />
                        <div className={'pt-2 items-center'}>
                          <p
                            style={
                              step.transit.lineColor
                                ? {
                                    background: step.transit.lineColor,
                                    color: '#fff',
                                    fontWeight: 800,
                                  }
                                : { border: '2px solid #2E7D32' }
                            }
                            className="px-1 rounded rounded-r-none h-full inline-block"
                          >
                            {step.transit.vehicle === 'BUS'
                              ? 'B'
                              : step.transit.vehicle === 'TRAM'
                                ? 'T'
                                : 'M'}
                          </p>
                          <span
                            style={
                              step.transit.lineColor
                                ? {
                                    borderColor: step.transit.lineColor,
                                  }
                                : { borderColor: '#2E7D32' }
                            }
                            className="px-1 rounded rounded-l-none border-2 h-full inline-block"
                          >
                            {step.transit.lineShortName ?? step.transit.line}
                          </span>
                        </div>
                        <p>Departure at: {step.transit.departureTime}</p>
                        <p>Arrival at: {step.transit.arrivalTime}</p>
                        <span>{step.transit.numberOfStops} Stops</span>
                      </div>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ol>
        </>
      )}
      {!isDetailsSaved && (
        <div className={`flex gap-4 px-2 pb-4 justify-end mt-auto`}>
          <Button onClick={() => handleBackButton?.()} variant={'secondary'}>
            Cancel
          </Button>
          <Button onClick={() => handleSaveTravelRoute?.()}>
            <Save />
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default RouteDetails;
