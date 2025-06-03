'use client';

import { isFlight, SavedTravelPlanType } from '@/contexts/travel-context';
import {
  Bike,
  Bus,
  Car,
  CircleDotDashed,
  Clock,
  Footprints,
  Leaf,
  MapPin,
  Plane,
  Route,
  TicketsPlane,
} from 'lucide-react';
import { format } from 'date-fns';
import { EventOccurrence, EventType } from '../../../services/api/type.api';
import * as React from 'react';

export interface TravelPlanOverviewCardProps {
  plan: SavedTravelPlanType;
  selectedEvent?: EventType;
  onCardClick?(): void;
  fullWidth?: boolean;
}

export default function TravelPlanOverviewCard({
  plan,
  selectedEvent,
  onCardClick,
  fullWidth,
}: TravelPlanOverviewCardProps) {
  const getTravelMethodIcon = React.useCallback(
    (travelMode: google.maps.TravelMode | string) => {
      if (travelMode === google.maps.TravelMode.DRIVING) {
        return <Car size={24} className="self-center" />;
      }
      if (travelMode === google.maps.TravelMode.TRANSIT) {
        return <Bus size={24} className="self-center" />;
      }
      if (travelMode === google.maps.TravelMode.WALKING) {
        return <Footprints size={24} className="self-center" />;
      }
      if (travelMode === google.maps.TravelMode.BICYCLING) {
        return <Bike size={24} className="self-center" />;
      } else return <Plane size={24} className="self-center" />;
    },
    [],
  );

  if (isFlight(plan)) {
    return (
      <div
        className={`flex flex-col  ${fullWidth ? 'w-full' : 'w-fit'} bg-white rounded h-fit border-primary border-2 cursor-pointer shadow-none transition-shadow duration-300 hover:shadow-md hover:shadow-muted`}
        onClick={onCardClick}
      >
        <div
          className={`text-primary bg-muted/20 p-2 pl-4 inline-flex justify-between`}
        >
          <div
            className={`capitalize text-lg font-semibold inline-flex items-baseline gap-2`}
          >
            {getTravelMethodIcon(plan.travelMode)}
            {plan.travelMode.toLowerCase()}
          </div>
          <span
            className={
              'text-md font-semibold text-primary bg-white px-2 rounded border border-primary'
            }
          >
            {plan.routeDetails.details.carbon_emissions.this_flight / 1000} kg
            CO₂e <Leaf className="inline" size={16} />
          </span>
        </div>
        <div className={`p-2 flex flex-col gap-2`}>
          <div>
            <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
              <Clock size={16} className="self-center" />
              {'Date & Time: '}
            </div>
            {format(new Date(plan.plannedAt), 'MMMM do yyyy, hh:mm a')}
          </div>
          <div>
            <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
              <CircleDotDashed size={16} className="self-center" />
              {'From: '}
            </div>
            {plan.origin}
          </div>
          <div>
            <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
              <MapPin size={16} className="self-center" />
              {'To: '}
            </div>{' '}
            {plan.destination}
          </div>
          <div>
            <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
              <Clock size={16} className="self-center" />
              {'Duration: '}
            </div>{' '}
            {Math.floor(plan.routeDetails.details.flights[0].duration / 60)}{' '}
            hours {plan.routeDetails.details.flights[0].duration % 60} minutes
          </div>
          <div>
            <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
              <TicketsPlane size={16} className="self-center" />
              {'Operator: '}
            </div>{' '}
            {plan.routeDetails.details.flights[0].airline}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`flex flex-col  ${fullWidth ? 'w-full' : 'w-fit'} bg-white rounded h-fit border-primary border-2 cursor-pointer shadow-none transition-shadow duration-300 hover:shadow-md hover:shadow-muted`}
      onClick={onCardClick}
    >
      <div
        className={`text-primary bg-muted/20 p-2 pl-4 inline-flex justify-between`}
      >
        <div
          className={`capitalize text-lg font-semibold inline-flex items-baseline gap-2`}
        >
          {getTravelMethodIcon(plan.travelMode)}
          {plan.travelMode.toLowerCase()}
        </div>
        <span
          className={
            'text-md font-semibold text-primary bg-white px-2 rounded border border-primary'
          }
        >
          {plan.totalCo2} kg CO₂e <Leaf className="inline" size={16} />
        </span>
      </div>
      <div className={`p-2 flex flex-col gap-2`}>
        <div>
          <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
            <Clock size={16} className="self-center" />
            {'Date & Time: '}
          </div>
          {selectedEvent?.occurrence === EventOccurrence.DAILY
            ? 'Daily at ' + format(new Date(plan.plannedAt), 'hh:mm a')
            : format(new Date(plan.plannedAt), 'MMMM do yyyy, hh:mm a')}
        </div>
        <div>
          <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
            <CircleDotDashed size={16} className="self-center" />
            {'From: '}
          </div>
          {plan.origin.split(',')[0]}
        </div>
        <div>
          <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
            <MapPin size={16} className="self-center" />
            {'To: '}
          </div>{' '}
          {plan.destination.split(',')[0]}
        </div>
        <div>
          <div className="inline-flex text-primary font-medium items-baseline gap-1 px-2 border-l-4 border-primary bg-muted/20 mr-2 rounded-r-md">
            <Route size={16} className="self-center" />
            {'Distance: '}
          </div>{' '}
          {plan.routeDetails?.routes[0].legs[0].distance?.text}
        </div>
      </div>
    </div>
  );
}
