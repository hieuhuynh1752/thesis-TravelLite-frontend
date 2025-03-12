'use client';
import * as React from 'react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { TravelHistoryDataType } from '@/utils/charts-util';

export interface TravelHistoryChartProps {
  data?: TravelHistoryDataType[];
}

const TravelHistoryChart = ({ data }: TravelHistoryChartProps) => {
  return (
    <Card className="p-4 pb-0 w-full h-full">
      <CardContent className="p-0">
        <div>
          <p className="text-xl font-semibold mb-4">
            Sustainability Metrics of Travel History{' '}
          </p>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={data}
            margin={{ top: 40, right: 30, left: 0, bottom: 20 }}
          >
            <XAxis dataKey="date" stroke="#8884d8" tickMargin={12} />
            <YAxis
              label={{
                value: 'kg CO₂e',
                angle: 0,
                position: 'insideTop',
                dy: -40,
                dx: 40,
              }}
              tickMargin={12}
            />
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <Tooltip />
            <Line dataKey="totalCo2" stroke="#82ca9d" type={'monotone'} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TravelHistoryChart;
