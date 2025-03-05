'use client';
import * as React from 'react';
import { Input } from '@/components/ui/input';

interface TimePickerProps {
  value: string;
  onTimeChange: React.ChangeEventHandler<HTMLInputElement>;
  id?: string;
}

const TimePicker = (props: TimePickerProps) => {
  return (
    <Input
      id={props.id}
      value={props.value}
      onChange={props.onTimeChange}
      type="time"
      className={'w-fit py-2'}
    />
  );
};

export default TimePicker;
