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
import { EventParticipantType } from '../../../services/api/type.api';
import {
  calculateTotalCo2,
  flattenTravelHistoryChartData,
  flattenTravelPreferencesHistoryChartData,
  getTravelHistoryData,
} from '@/utils/charts-util';
import TravelHistoryChart from '@/components/charts/travel-history-chart.view';
import TravelPreferencesHistoryChart from '@/components/charts/travel-preference-pie-chart.view';
import { DataTable } from '@/components/ui/table/data-table.view';
import { format } from 'date-fns';

export interface OverviewTravelHistoryReportProps {
  events?: EventParticipantType[];
}

export default function OverviewTravelHistoryReport({
  events,
}: OverviewTravelHistoryReportProps) {
  const [reportType, setReportType] = React.useState('lifetime');
  const [selectedMonth, setSelectedMonth] = React.useState<
    string | undefined
  >();
  const [selectedYear, setSelectedYear] = React.useState<string | undefined>();
  const [key, setKey] = React.useState(+new Date());

  const travelHistoryData = React.useMemo(() => {
    if (events) {
      return getTravelHistoryData(events, {
        month: selectedMonth,
        year: selectedYear,
      });
    }
    return undefined;
  }, [events, selectedMonth, selectedYear]);

  const travelHistoryChartData = React.useMemo(() => {
    if (travelHistoryData) {
      return flattenTravelHistoryChartData(travelHistoryData);
    }
  }, [travelHistoryData]);

  const travelPreferencesChartData = React.useMemo(() => {
    if (travelHistoryData) {
      return flattenTravelPreferencesHistoryChartData(travelHistoryData);
    }
  }, [travelHistoryData]);

  const handleReportTypeChange = React.useCallback((type: string) => {
    setReportType(type);
    if (type === 'lifetime') {
      setSelectedMonth(undefined);
      setSelectedYear(undefined);
      setKey(+new Date());
    }
    if (type === 'yearly') {
      setSelectedMonth(undefined);
      setKey(+new Date());
    }
  }, []);

  return (
    <div className="flex flex-col p-4">
      <div className="text-3xl pb-2">Travel History Report</div>
      <Separator orientation={'horizontal'} />
      <div className="flex gap-4 items-center border-r">
        <div className={`text-md font-semibold p-4 bg-gray-200`}>Filters</div>
        <div className="flex gap-2 items-center">
          <Label>Type: </Label>
          <div className="flex p-1 bg-gray-100 w-fit rounded gap-1">
            <div
              className={`px-4 rounded cursor-pointer font-semibold text-gray-500 hover:bg-muted/30 hover:text-primary ${reportType === 'lifetime' && 'bg-muted/50 font-semibold text-primary'}`}
              onClick={() => handleReportTypeChange('lifetime')}
            >
              Lifetime
            </div>
            <Separator
              orientation={'vertical'}
              className={'bg-primary h-auto'}
            />
            <div
              className={`px-4 rounded cursor-pointer font-semibold text-gray-500 hover:bg-muted/30 hover:text-primary ${reportType === 'monthly' && 'bg-muted/50 font-semibold text-primary'}`}
              onClick={() => handleReportTypeChange('monthly')}
            >
              Monthly
            </div>
            <Separator
              orientation={'vertical'}
              className={'bg-primary h-auto'}
            />
            <div
              className={`px-4 rounded cursor-pointer font-semibold text-gray-500 hover:bg-muted/30 hover:text-primary  ${reportType === 'yearly' && 'bg-muted/50 font-semibold text-primary'}`}
              onClick={() => handleReportTypeChange('yearly')}
            >
              Yearly
            </div>
          </div>
        </div>
        <div
          className={`flex gap-2 items-center ${reportType !== 'monthly' && 'text-gray-400'}`}
        >
          <Label>Month:</Label>
          <Select
            onValueChange={setSelectedMonth}
            disabled={reportType !== 'monthly'}
            value={selectedMonth}
            key={key}
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
        <div
          className={`flex gap-2 items-center ${reportType === 'lifetime' && 'text-gray-400'}`}
        >
          <Label>Year:</Label>
          <Select
            onValueChange={setSelectedYear}
            disabled={reportType === 'lifetime'}
            value={selectedYear}
            key={key}
          >
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
      <Separator orientation={'horizontal'} />
      <div className={`flex gap-8 py-4`}>
        <div className={`flex flex-col w-1/2 gap-4`}>
          <p
            className={`text-xl font-semibold px-2 border-l-4 border-primary text-primary bg-muted/30 rounded-r`}
          >
            Events Participated
          </p>
          {travelHistoryData ? (
            <div className="h-[80vh] overflow-y-auto">
              <DataTable
                columns={[
                  {
                    id: 'title',
                    header: 'Title',
                    cell: ({ row }) => {
                      return row.original.title;
                    },
                  },
                  {
                    id: 'date',
                    header: 'Date',
                    cell: ({ row }) => {
                      return row.original.date
                        ? format(row.original.date, 'dd MMMM, yyyy')
                        : 'Unavailable';
                    },
                  },
                  {
                    id: 'location',
                    header: 'Location',
                    cell: ({ row }) => {
                      return row.original.location;
                    },
                  },
                  {
                    id: 'occurrence',
                    header: 'Occurrence',
                    cell: ({ row }) => {
                      return row.original.occurrence?.toLowerCase();
                    },
                  },
                  {
                    id: 'kg CO₂e',
                    header: 'kg CO₂e',
                    cell: ({ row }) => {
                      return row.original.co2;
                    },
                  },
                ]}
                data={travelHistoryData}
              />
            </div>
          ) : (
            <p>
              Oops, seems like you didn&#39;t participate any Event during this
              period!
            </p>
          )}
        </div>
        <div className={`w-1/2 flex flex-col gap-4`}>
          <div className="flex h-fit w-full max-w-3xl rounded-xl bg-muted/50">
            <TravelHistoryChart data={travelHistoryChartData} />
          </div>
          <div className="flex h-fit w-full max-w-3xl rounded-xl bg-muted/50">
            <TravelPreferencesHistoryChart
              chartData={travelPreferencesChartData}
              totalTravels={travelHistoryData?.length}
              totalCo2={
                travelHistoryChartData
                  ? calculateTotalCo2(travelHistoryChartData)
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
