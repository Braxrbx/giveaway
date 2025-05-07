import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";

export default function Schedule() {
  // Fetch scheduled giveaways
  const { 
    data: scheduledGiveaways, 
    isLoading,
    isError,
    error 
  } = useQuery({
    queryKey: ['/api/giveaways/scheduled'],
  });

  // Fetch ping status
  const { data: pingStatus } = useQuery({
    queryKey: ['/api/pings/status'],
  });

  // Group giveaways by day
  const groupedGiveaways = !scheduledGiveaways ? {} : scheduledGiveaways.reduce((acc: any, giveaway: any) => {
    // Validate the date before creating a Date object
    const isValidDate = giveaway.scheduledFor && !isNaN(new Date(giveaway.scheduledFor).getTime());
    const date = isValidDate ? new Date(giveaway.scheduledFor) : new Date();
    const dateString = format(date, 'yyyy-MM-dd');
    const displayDate = format(date, 'EEEE, MMMM d');
    
    if (!acc[dateString]) {
      acc[dateString] = {
        displayDate,
        giveaways: []
      };
    }
    
    acc[dateString].giveaways.push(giveaway);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Giveaway Schedule</h1>
      </div>

      {/* Ping limits info */}
      <div className="bg-[#2D3136] rounded-lg p-4 mb-6">
        <h2 className="text-white font-semibold mb-2">Ping Limits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/50 rounded p-3">
            <div className="flex items-center mb-1">
              <span className="bg-red-500/20 text-[#ED4245] px-2 py-0.5 rounded-md text-xs mr-2">@everyone</span>
              <span className="text-[#DCDDDE] text-sm">1 per day</span>
            </div>
            <div className="text-xs text-[#8E9297]">
              Status: {pingStatus?.everyone ? 'Used today' : 'Available'}
            </div>
          </div>

          <div className="bg-gray-700/50 rounded p-3">
            <div className="flex items-center mb-1">
              <span className="bg-yellow-500/20 text-[#FEE75C] px-2 py-0.5 rounded-md text-xs mr-2">@here</span>
              <span className="text-[#DCDDDE] text-sm">1-2 per day</span>
            </div>
            <div className="text-xs text-[#8E9297]">
              Status: {pingStatus?.here ? 'Used today' : 'Available'}
              {!pingStatus?.everyone && !pingStatus?.here && ' (2 available)'}
              {pingStatus?.everyone && !pingStatus?.here && ' (1 available)'}
            </div>
          </div>

          <div className="bg-gray-700/50 rounded p-3">
            <div className="flex items-center mb-1">
              <span className="bg-blue-500/20 text-[#5865F2] px-2 py-0.5 rounded-md text-xs mr-2">@Mutual Giveaways</span>
              <span className="text-[#DCDDDE] text-sm">No limit</span>
            </div>
            <div className="text-xs text-[#8E9297]">
              Status: Always available
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5865F2] mx-auto"></div>
          <p className="mt-4 text-[#DCDDDE]">Loading scheduled giveaways...</p>
        </div>
      ) : isError ? (
        <div className="bg-[#2D3136] p-6 rounded-lg text-center">
          <p className="text-[#ED4245] mb-2">Error loading schedule</p>
          <p className="text-[#8E9297] text-sm">{(error as Error)?.message || "Unknown error occurred"}</p>
        </div>
      ) : !Object.keys(groupedGiveaways).length ? (
        <div className="bg-[#2D3136] p-8 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#8E9297] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-white text-lg font-medium mb-2">No scheduled giveaways</h3>
          <p className="text-[#8E9297]">There are no giveaways scheduled at this time.</p>
        </div>
      ) : (
        Object.keys(groupedGiveaways).map(dateKey => (
          <div key={dateKey} className="mb-6">
            <div className="flex items-center mb-2">
              <h2 className="text-white text-lg font-semibold">{groupedGiveaways[dateKey].displayDate}</h2>
              {dateKey === format(new Date(), 'yyyy-MM-dd') && (
                <span className="ml-2 text-xs bg-green-500/20 text-[#57F287] px-2 py-0.5 rounded">Today</span>
              )}
            </div>
            
            <div className="bg-[#2D3136] rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-700">
                {groupedGiveaways[dateKey].giveaways.map((giveaway: any) => {
                  // Validate date before creating the Date object
                  const isValidDate = giveaway.scheduledFor && !isNaN(new Date(giveaway.scheduledFor).getTime());
                  const scheduledTime = isValidDate ? new Date(giveaway.scheduledFor) : new Date();
                  const isPast = scheduledTime < new Date();
                  
                  return (
                    <div key={giveaway.id} className="p-4 hover:bg-gray-800 transition-colors flex items-center gap-4">
                      <div className="w-24 text-center">
                        <div className="text-white font-mono">{format(scheduledTime, 'h:mm a')}</div>
                        <div className="text-xs text-[#8E9297]">
                          {isPast ? 'past' : `in ${formatDistanceToNow(scheduledTime, { addSuffix: false })}`}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="text-white">{giveaway.serverName}</h4>
                          <span className="ml-2 text-xs py-0.5 px-1.5 bg-[#5865F2]/20 text-[#5865F2] rounded">
                            {giveaway.ourPing}
                          </span>
                        </div>
                        <div className="text-[#8E9297] text-sm">Prize: {giveaway.prize}</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`py-1 px-2 text-xs rounded-full flex items-center ${
                          isPast 
                            ? 'bg-gray-500/20 text-[#8E9297]' 
                            : scheduledTime.getTime() - new Date().getTime() < 30 * 60 * 1000 
                              ? 'bg-green-500/20 text-[#57F287]'
                              : 'bg-blue-500/20 text-[#5865F2]'
                        }`}>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          {isPast ? 'Posted' : scheduledTime.getTime() - new Date().getTime() < 30 * 60 * 1000 ? 'Ready' : 'Waiting'}
                        </span>
                        <button className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8E9297]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
