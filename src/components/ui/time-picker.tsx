'use client';
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onTimeChange: React.ChangeEventHandler<HTMLInputElement>;
  id?: string;
  disabled?: boolean;
}

const TimePicker = (props: TimePickerProps) => {
  return (
    <Input
      id={props.id}
      value={props.disabled ? '' : props.value}
      onChange={props.onTimeChange}
      type="time"
      className={'w-fit py-2 [&::-webkit-calendar-picker-indicator]:hidden'}
      startIcon={Clock}
      disabled={props.disabled}
    />
  );
};

export default TimePicker;
