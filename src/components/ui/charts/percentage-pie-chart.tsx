'use client';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import * as React from 'react';
import { ChartContainer } from '@/components/ui/charts/chart';
import { greens } from '@/components/ui/charts/horizontal-bar-chart';

export type PercentagePieChartProps<T> = {
  data: T[];
};

/* eslint-disable  @typescript-eslint/no-explicit-any */
export function PercentagePieChart<T extends Record<string, any>>({
  data,
}: PercentagePieChartProps<T>) {
  return (
    <ChartContainer config={{}} className={'min-h-[250px] w-full px-4'}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          // cx="50%"
          // cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label
          width={'60%'}
        >
          {greens[4]?.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={greens[4][index % greens[4].length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend align={'right'} layout={'vertical'} verticalAlign={'middle'} />
      </PieChart>
    </ChartContainer>
  );
}
