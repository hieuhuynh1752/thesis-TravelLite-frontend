import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Text,
} from 'recharts';

export type HorizontalBarChartProps<T> = {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
};

export const greens = [
  ['#2E7D32'], // 1 color
  ['#2E7D32', '#D8EAD9'], // 2 colors
  ['#1B5E20', '#2E7D32', '#D8EAD9'], // 3 colors
  ['#1B5E20', '#2E7D32', '#81C784', '#D8EAD9'], // 4 colors
  ['#0F3B13', '#1B5E20', '#2E7D32', '#81C784', '#D8EAD9'], // 5 colors
];

const getColor = (length: number, index: number): string => {
  if (length <= greens.length) {
    return greens[length - 1][index];
  }
  return greens[greens.length - 1][index % greens[0].length];
};

let ctx: CanvasRenderingContext2D | null = null;
const measureText = (text: string): number => {
  if (!ctx) {
    ctx = document.createElement('canvas').getContext('2d');
    if (ctx) {
      ctx.font =
        "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    }
  }
  console.log(ctx?.measureText(text).width);
  return ctx?.measureText(text).width ?? 0;
};

const BAR_AXIS_SPACE = 10;

const YAxisLeftTick = ({
  y,
  payload,
}: {
  y?: number;
  payload: { value: string };
}) => {
  return (
    <Text x={0} y={y} textAnchor="start" verticalAnchor="middle" fill={'#333'}>
      {payload.value}
    </Text>
  );
};

export function HorizontalBarChart<T extends Record<string, any>>({
  data,
  xKey,
  yKey,
}: HorizontalBarChartProps<T>) {
  const maxTextWidth = useMemo(() => {
    return data.reduce((acc, cur) => {
      const value = cur[yKey];
      const width = measureText(
        typeof value === 'number' ? value.toLocaleString() : String(value),
      );
      return Math.max(acc, width);
    }, 0);
  }, [data, yKey]);

  return (
    <ResponsiveContainer width="100%" height={50 * data.length} debounce={50}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 60, right: maxTextWidth + (BAR_AXIS_SPACE - 8) }}
      >
        <XAxis hide type="number" />
        <YAxis
          yAxisId={0}
          dataKey={xKey as string}
          type="category"
          axisLine={false}
          tickLine={false}
          tick={YAxisLeftTick}
        />
        <YAxis
          orientation="right"
          yAxisId={1}
          dataKey={yKey as string}
          type="category"
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: number) => value.toLocaleString()}
          mirror
          tick={{
            transform: `translate(${maxTextWidth + BAR_AXIS_SPACE}, 0)`,
          }}
        />
        <Bar dataKey={yKey as string} minPointSize={2} barSize={32}>
          {data.map((d, idx) => (
            <Cell key={String(d[xKey])} fill={getColor(data.length, idx)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
