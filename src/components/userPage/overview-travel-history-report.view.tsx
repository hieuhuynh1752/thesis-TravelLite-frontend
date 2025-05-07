'use client';
import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function OverviewTravelHistoryReport() {
  const [reportType, setReportType] = React.useState('monthly');
  const [selectedMonth, setSelectedMonth] = React.useState<
    string | undefined
  >();
  const [selectedYear, setSelectedYear] = React.useState<string | undefined>();

  const handleReportTypeChange = React.useCallback((type: string) => {
    setReportType(type);
  }, []);

  const handleMonthSelect = React.useCallback((value: string) => {
    setSelectedMonth(value);
  }, []);

  const handleYearSelect = React.useCallback((value: string) => {
    setSelectedYear(value);
  }, []);

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="text-3xl">Travel History Report</div>
      <Separator orientation={'horizontal'} />
      <div className="flex gap-4 items-center">
        <div className="flex gap-2 items-center">
          <Label>Type: </Label>
          <div className="flex p-1 bg-gray-100 w-fit rounded gap-1">
            <div
              className={`px-4 rounded cursor-pointer hover:bg-muted/30 hover:text-primary ${reportType === 'monthly' && 'bg-muted/50 font-semibold text-primary'}`}
              onClick={() => handleReportTypeChange('monthly')}
            >
              Monthly
            </div>
            <Separator
              orientation={'vertical'}
              className={'bg-primary h-auto'}
            />
            <div
              className={`px-4 rounded cursor-pointer hover:bg-muted/30 hover:text-primary  ${reportType === 'yearly' && 'bg-muted/50 font-semibold text-primary'}`}
              onClick={() => handleReportTypeChange('yearly')}
            >
              Yearly
            </div>
          </div>
        </div>
        <div
          className={`flex gap-2 items-center ${reportType === 'yearly' && 'text-gray-400'}`}
        >
          <Label>Month:</Label>
          <Select
            onValueChange={setSelectedMonth}
            disabled={reportType === 'yearly'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={'1'}>January</SelectItem>
              <SelectItem value={'2'}>February</SelectItem>
              <SelectItem value={'3'}>March</SelectItem>
              <SelectItem value={'4'}>April</SelectItem>
              <SelectItem value={'5'}>May</SelectItem>
              <SelectItem value={'6'}>June</SelectItem>
              <SelectItem value={'7'}>July</SelectItem>
              <SelectItem value={'8'}>August</SelectItem>
              <SelectItem value={'9'}>September</SelectItem>
              <SelectItem value={'10'}>October</SelectItem>
              <SelectItem value={'11'}>November</SelectItem>
              <SelectItem value={'12'}>December</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className={`flex gap-2 items-center`}>
          <Label>Year:</Label>
          <Select onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Select a year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={'2024'}>2024</SelectItem>
              <SelectItem value={'2025'}>2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
