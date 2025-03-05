'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { EventParticipantStatus } from '../../../services/api/type.api';

interface ParticipantChipProps {
  username?: string;
  onClearButtonClick?: () => void;
  hideClearButton?: boolean;
  isHost?: boolean;
  status?: EventParticipantStatus;
}

const ParticipantChip = (props: ParticipantChipProps) => {
  return (
    <div
      className={`flex gap-2 ${props.isHost ? 'border-gray-500 pl-1 pr-2' : props.hideClearButton ? 'border-gray-400 pl-1 pr-2' : 'border-gray-400 px-1'} rounded-full border-2 py-1 items-center`}
    >
      <div
        className={`rounded-full text-white w-6 h-6 flex justify-center ${props.isHost ? 'bg-gray-500 border-gray-500 italic w-full px-2' : 'bg-green-500'}`}
      >
        {props.isHost ? (
          <span>{'Host'}</span>
        ) : (
          <span>{props.username?.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <p>
        {props.username}{' '}
        {props.status && (
          <span className="italic capitalize text-gray-500">
            ({props.status.toLowerCase()})
          </span>
        )}
      </p>

      {!props.hideClearButton && (
        <Button
          variant="ghost"
          className="h-6 w-6 p-2 rounded-full bg-gray-100 hover:bg-gray-300"
          onClick={props.onClearButtonClick}
        >
          <X size={16} />
        </Button>
      )}
    </div>
  );
};

export default ParticipantChip;
