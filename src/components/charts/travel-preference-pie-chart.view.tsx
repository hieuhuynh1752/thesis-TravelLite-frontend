'use client';
import * as React from 'react';

import { Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { ReducedTravelPreferencesDataType } from '@/utils/charts-util';
import { ChartContainer } from '@/components/ui/charts/chart';
import { Leaf } from 'lucide-react';

export interface TravelPreferencesChartProps {
  chartData?: ReducedTravelPreferencesDataType[];
  totalTravels?: number;
  totalCo2?: string;
  adminMode?: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff6b6b', '#6b5b95'];

const TravelPreferencesHistoryChart = ({
  chartData,
  totalTravels,
  totalCo2,
  adminMode,
}: TravelPreferencesChartProps) => {
  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardContent className="p-0">
        <div>
          <p className="text-xl font-semibold px-2 border-l-4 border-primary text-primary bg-muted/30 rounded-r mb-4">
            Travel Preferences
          </p>
        </div>
        <div className={'flex'}>
          <ChartContainer config={{}} className={'pb-2 min-h-[250px] w-1/2'}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {chartData?.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ChartContainer>
          <div className="w-3/4">
            <div
              className={'flex flex-col gap-2 border-2 border-primary rounded'}
            >
              <p className="text-md font-semibold bg-muted/30 p-2">So far:</p>
              <ul className={'list-disc ml-6 p-2 pt-0'}>
                {adminMode ? (
                  <>
                    <li>
                      You have made:{' '}
                      <span className="bg-amber-100 px-2">
                        <span className={'font-semibold'}>{totalTravels}</span>{' '}
                        travels
                      </span>
                    </li>
                    <li>
                      With a total of:{' '}
                      <span
                        className={
                          'font-semibold text-primary bg-muted/30 px-2'
                        }
                      >
                        {totalCo2} kg CO₂e <Leaf className="inline" size={16} />
                      </span>{' '}
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <span className="bg-amber-100 px-2">
                        <span className={'font-semibold'}>{totalTravels}</span>{' '}
                        travels
                      </span>{' '}
                      has been made!
                    </li>
                    <li>
                      With a total of:{' '}
                      <span
                        className={
                          'font-semibold text-primary bg-muted/30 px-2'
                        }
                      >
                        {totalCo2} kg CO₂e <Leaf className="inline" size={16} />
                      </span>{' '}
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelPreferencesHistoryChart;
