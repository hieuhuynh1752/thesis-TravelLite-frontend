'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Ellipsis, X } from 'lucide-react';
import { EventParticipantStatus } from '../../../services/api/type.api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ParticipantChipProps {
  username?: string;
  onClearButtonClick?: () => void;
  hideClearButton?: boolean;
  isHost?: boolean;
  status?: EventParticipantStatus;
  hasPlan?: boolean;
}

const ParticipantChip = (props: ParticipantChipProps) => {
  const getStatusIcon = React.useCallback(() => {
    if (props.status === EventParticipantStatus.ACCEPTED) {
      return (
        <span
          className={`p-1 ${props.hasPlan ? 'bg-primary text-white' : 'bg-muted text-primary'}  font-semibold rounded-full`}
        >
          <Check size={12} />{' '}
        </span>
      );
    } else if (props.status === EventParticipantStatus.PENDING) {
      return (
        <span className={`p-1 bg-gray-400 text-white rounded-full`}>
          <Ellipsis size={12} />{' '}
        </span>
      );
    } else if (props.status === EventParticipantStatus.DECLINED) {
      return (
        <span>
          <X size={12} />{' '}
        </span>
      );
    }
  }, [props.status, props.hasPlan]);

  const getTooltipContents = React.useCallback(() => {
    if (props.status === EventParticipantStatus.ACCEPTED) {
      return props.hasPlan
        ? 'Accepted, Travel Plan declared!'
        : 'Accepted, no Travel Plans declared yet.';
    } else if (props.status === EventParticipantStatus.PENDING) {
      return 'Pending';
    } else if (props.status === EventParticipantStatus.DECLINED) {
      return 'Declined';
    }
  }, [props.status, props.hasPlan]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={`flex gap-2 ${props.isHost ? 'border-primary pl-1 pr-2' : props.hideClearButton ? 'border-primary pl-1 pr-2' : 'border-gray-400 px-1'} rounded-full border py-1 items-center text-sm ${props.hasPlan ? 'bg-muted/30 font-semibold text-primary' : ''}`}
          >
            <div
              className={`rounded-full text-white w-5 flex justify-center ${props.isHost ? 'bg-gray-500 border-gray-500 italic w-full px-2' : 'bg-green-500'}`}
            >
              {getStatusIcon()}
            </div>
            <p>{props.username}</p>
            {!props.hideClearButton && (
              <Button
                variant="ghost"
                className="h-4 w-4 p-1 rounded-full bg-gray-100 hover:bg-gray-300"
                onClick={props.onClearButtonClick}
              >
                <X size={12} />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>{getTooltipContents()}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ParticipantChip;
