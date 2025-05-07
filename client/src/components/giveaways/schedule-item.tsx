import { format, formatDistanceToNow } from "date-fns";

interface ScheduleItemProps {
  giveaway: {
    id: number;
    serverName: string;
    ourPing: string;
    prize: string;
    scheduledFor: string;
  };
}

export default function ScheduleItem({ giveaway }: ScheduleItemProps) {
  // Validate date before creating the Date object
  const isValidDate = giveaway.scheduledFor && !isNaN(new Date(giveaway.scheduledFor).getTime());
  const scheduledTime = isValidDate ? new Date(giveaway.scheduledFor) : new Date();
  const now = new Date();
  const isPast = scheduledTime < now;
  const isReady = scheduledTime.getTime() - now.getTime() < 30 * 60 * 1000; // Less than 30 minutes away
  
  // Removed edit button/handler per user request
  
  // Format ping for display
  const formatPing = (ping: string) => {
    if (ping === '@everyone') {
      return <span className="ml-2 text-xs py-0.5 px-1.5 bg-red-500/20 text-[#ED4245] rounded">@everyone</span>;
    } else if (ping === '@here') {
      return <span className="ml-2 text-xs py-0.5 px-1.5 bg-yellow-500/20 text-[#FEE75C] rounded">@here</span>;
    } else {
      return <span className="ml-2 text-xs py-0.5 px-1.5 bg-[#5865F2]/20 text-[#5865F2] rounded">{ping}</span>;
    }
  };

  return (
    <div className="p-4 hover:bg-gray-800 transition-colors flex items-center gap-4">
      <div className="w-24 text-center">
        <div className="text-white font-mono">{format(scheduledTime, 'h:mm a')}</div>
        <div className="text-xs text-[#8E9297]">
          {isPast ? 'past' : `in ${formatDistanceToNow(scheduledTime, { addSuffix: false })}`}
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center">
          <h4 className="text-white">{giveaway.serverName}</h4>
          {formatPing(giveaway.ourPing)}
        </div>
        <div className="text-[#8E9297] text-sm">Prize: {giveaway.prize}</div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`py-1 px-2 text-xs rounded-full flex items-center ${
          isPast 
            ? 'bg-gray-500/20 text-[#8E9297]' 
            : isReady 
              ? 'bg-green-500/20 text-[#57F287]'
              : 'bg-blue-500/20 text-[#5865F2]'
        }`}>
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
          </svg>
          {isPast ? 'Posted' : isReady ? 'Ready' : 'Waiting'}
        </span>

      </div>
    </div>
  );
}
