'use client';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import * as React from 'react';
import { ChartContainer } from '@/components/ui/charts/chart';
import iwanthue from 'iwanthue';
export type PercentagePieChartProps<T> = {
  data: T[];
};

export function PercentagePieChart<T extends Record<string, any>>({
  data,
}: PercentagePieChartProps<T>) {
  const palette = React.useMemo(() => {
    console.log(data);
    if (data.length) {
      return iwanthue(data.length);
    }
  }, [data]);

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
          width={'20%'}
        >
          {data?.map((_, index) => (
            <Cell key={`cell-${index}`} fill={palette?.[index]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend
          align={'right'}
          layout={'vertical'}
          verticalAlign={'middle'}
          wrapperStyle={{ height: '80%', overflow: 'auto', top: 10 }}
        />
      </PieChart>
    </ChartContainer>
  );
}
