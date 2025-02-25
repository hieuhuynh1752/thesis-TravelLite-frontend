'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FlattenedSelectedRoute } from '@/contexts/travel-context';
import {
  ArrowLeft,
  BusFront,
  Footprints,
  Save,
  TrainFront,
} from 'lucide-react';

interface RouteDetailsProps {
  travelPlan: FlattenedSelectedRoute & { eventParticipantId?: number };
  isDetailsSaved?: boolean;
  handleUpdateEditSavedTravelPlan?: () => void;
  transitRoute?: boolean;
  handleBackButton?: () => void;
  handleSaveTravelRoute?: () => void;
}

const RouteDetails = ({
  travelPlan,
  handleUpdateEditSavedTravelPlan,
  isDetailsSaved,
  handleBackButton,
  handleSaveTravelRoute,
}: RouteDetailsProps) => {
  return (
    <div className="flex flex-grow flex-col gap-2 px-2">
      {isDetailsSaved ? (
        <div className={`flex justify-between`}>
          <div className={'text-xl font-bold self-center'}>Travel Plan</div>
          <Button
            onClick={() => handleUpdateEditSavedTravelPlan?.()}
            variant={'secondary'}
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
            Route details
          </div>
        </div>
      )}
      <Separator orientation={'horizontal'} />
      <div className={'flex gap-2 px-2'}>
        <span className={'text-gray-600 italic w-10 shrink-0'}>from </span>{' '}
        <span className={'font-semibold'}>{travelPlan.origin}</span>
      </div>
      <div className={`flex gap-2 px-2`}>
        <span className={'text-gray-600 italic w-10 shrink-0'}>to </span>{' '}
        <span className={'font-semibold'}>{travelPlan.destination}</span>
      </div>
      <Separator orientation={'horizontal'} />
      <div className={`flex gap-2 pl-2 justify-between`}>
        <div className={''}>
          <p className={'text-lg'}>
            <span className={'text-xl font-semibold'}>
              {travelPlan.routeDetails.routes[0].legs[0].duration?.text}
            </span>{' '}
            ({travelPlan.routeDetails.routes[0].legs[0].distance?.text})
          </p>
          <p>
            by {travelPlan.travelMode.toLowerCase()} via{' '}
            {travelPlan.routeDetails.routes[0].summary}
          </p>
        </div>
        <div
          className={'flex flex-col bg-green-200 rounded-md px-2 text-right'}
        >
          <p className={'text-lg text-green-800 font-semibold'}>
            {travelPlan.totalCo2} kg
          </p>
          <p className={''}>est. CO2e</p>
        </div>
      </div>
      <Separator orientation={'horizontal'} />
      {/*<div className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto bg-muted">*/}
      {/*  {travelPlan.travelSteps.map((step, key) => (*/}
      {/*    <div key={key} className="p-2 bg-white rounded-md flex gap-4">*/}
      {/*      <div className="text-sm">{step.instructions}</div>*/}
      {/*    </div>*/}
      {/*  ))}*/}
      {/*</div>*/}
      <ol className="flex flex-col space-y-4 overflow-y-auto">
        {travelPlan.travelSteps.map((step, index, allSteps) => (
          <li
            key={index}
            className={`isolate relative flex-1 
            ${index === 0 ? 'before:w-0' : 'before:w-0.5'} before:content-[''] before:h-[100%] before:bg-gray-400 before:inline-block before:absolute before:-top-0 before:left-4 lg:before:left-5
            ${allSteps.length - 1 === index ? 'after:w-0 before:h-[50%]' : 'after:w-0.5'} after:content-[''] after:h-[50%]  after:bg-gray-400 after:inline-block after:absolute after:-bottom-4 after:left-4 lg:after:left-5 `}
          >
            <a className="flex items-start">
              <span className="my-auto z-10 w-8 h-8 aspect-square border-gray-400 border-2 bg-white text-gray-600 rounded-full flex justify-center items-center mr-3 text-sm lg:w-10 lg:h-10">
                {travelPlan.travelMode === google.maps.TravelMode.TRANSIT ? (
                  step.transit ? (
                    step.transit.vehicle === 'BUS' ? (
                      <BusFront />
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
              <div className="block shadow-none transition-shadow duration-300 hover:shadow-md cursor-default hover:shadow-gray-400 p-4 rounded-xl min-w-[50%] max-w-[80%] w-full border-gray-300 border-2">
                <div className="text-sm">{step.instructions}</div>
                {step.transit && (
                  <div className="text-sm pt-2 flex flex-col gap-2 ">
                    <Separator orientation={'horizontal'} />
                    <p className={'pt-2 flex gap-2 items-center'}>
                      <span
                        style={
                          step.transit.lineColor
                            ? {
                                background: step.transit.lineColor,
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: 'small',
                                lineHeight: 'normal',
                              }
                            : { border: '2px solid black' }
                        }
                        className="px-1 rounded"
                      >
                        {step.transit.vehicle === 'Bus' ? 'B' : 'M'}
                      </span>
                      <span>
                        {step.transit.lineShortName ?? step.transit.line}
                      </span>
                    </p>
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
      {!isDetailsSaved && (
        <div className={`flex gap-4 px-2 justify-end`}>
          <Button variant={'secondary'}>Cancel</Button>
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
