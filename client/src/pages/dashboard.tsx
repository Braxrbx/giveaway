import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import GiveawayCard from "@/components/giveaways/giveaway-card";
import ScheduleItem from "@/components/giveaways/schedule-item";
import { format, formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  // Fetch pending giveaways
  const { data: pendingGiveaways, isLoading: pendingLoading } = useQuery({
    queryKey: ['/api/giveaways/pending'],
  });

  // Fetch scheduled giveaways
  const { data: scheduledGiveaways, isLoading: scheduleLoading } = useQuery({
    queryKey: ['/api/giveaways/scheduled'],
  });

  // Fetch invite statistics
  const { data: inviteStats, isLoading: inviteStatsLoading } = useQuery({
    queryKey: ['/api/invites/stats'],
  });

  // Fetch ping status
  const { data: pingStatus, isLoading: pingStatusLoading } = useQuery({
    queryKey: ['/api/pings/status'],
  });

  // Calculate time until ping reset
  const calculateTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diffMs = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#2D3136] rounded-lg p-4 shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[#8E9297] text-sm">Pending Approvals</h3>
              <p className="text-2xl font-bold text-white mt-1">
                {pendingLoading ? "..." : pendingGiveaways?.length || 0}
              </p>
            </div>
            <div className="p-2 bg-yellow-500/20 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FEE75C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-xs text-[#8E9297]">
            {pendingLoading ? "Loading..." : (
              <span className="text-[#57F287]">
                {pendingGiveaways?.length > 0 ? `+${pendingGiveaways.length}` : "None"} since yesterday
              </span>
            )}
          </div>
        </div>

        <div className="bg-[#2D3136] rounded-lg p-4 shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[#8E9297] text-sm">Scheduled Giveaways</h3>
              <p className="text-2xl font-bold text-white mt-1">
                {scheduleLoading ? "..." : scheduledGiveaways?.length || 0}
              </p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#5865F2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-xs text-[#8E9297]">
            {scheduleLoading || !scheduledGiveaways?.length ? "No scheduled giveaways" : (
              <>Next: <span className="text-white">
                {scheduledGiveaways[0]?.scheduledFor ? 
                  format(new Date(scheduledGiveaways[0].scheduledFor), "h:mm a 'Today'") : 
                  'Time not set'}
              </span></>
            )}
          </div>
        </div>

        <div className="bg-[#2D3136] rounded-lg p-4 shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[#8E9297] text-sm">Total Invites (Week)</h3>
              <p className="text-2xl font-bold text-white mt-1">
                {inviteStatsLoading ? "..." : inviteStats?.totalInvites || 0}
              </p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#57F287]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-xs text-[#8E9297]">
            <span className="text-[#57F287]">
              {inviteStatsLoading ? "Loading..." : "+23% from last week"}
            </span>
          </div>
        </div>

        <div className="bg-[#2D3136] rounded-lg p-4 shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[#8E9297] text-sm">Today's Ping Status</h3>
              <p className="text-md font-bold text-white mt-1">
                {pingStatusLoading ? "..." : (
                  <>
                    {pingStatus?.everyone && (
                      <span className="bg-red-500/20 text-[#ED4245] px-2 py-0.5 rounded-md mr-1 text-xs">@everyone</span>
                    )}
                    {pingStatus?.here && (
                      <span className="bg-yellow-500/20 text-[#FEE75C] px-2 py-0.5 rounded-md mr-1 text-xs">@here</span>
                    )}
                    {!pingStatus?.everyone && !pingStatus?.here && (
                      <span className="bg-green-500/20 text-[#57F287] px-2 py-0.5 rounded-md mr-1 text-xs">All Available</span>
                    )}
                  </>
                )}
              </p>
            </div>
            <div className="p-2 bg-red-500/20 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ED4245]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-xs text-[#8E9297]">
            {pingStatusLoading ? "Loading..." : (
              pingStatus?.everyone && pingStatus?.here 
                ? `Both pings used today (resets in ${calculateTimeUntilReset()})`
                : pingStatus?.everyone 
                  ? `@everyone used (resets in ${calculateTimeUntilReset()})`
                  : pingStatus?.here 
                    ? `@here used (resets in ${calculateTimeUntilReset()})`
                    : "No pings used today"
            )}
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Pending Approvals</h2>
          <Link href="/pending-giveaways" className="text-[#5865F2] text-sm hover:underline">View All</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pendingLoading ? (
            <div className="bg-[#2D3136] rounded-lg p-4 text-center">Loading pending giveaways...</div>
          ) : !pendingGiveaways?.length ? (
            <div className="bg-[#2D3136] rounded-lg p-4 text-center">No pending giveaways</div>
          ) : (
            pendingGiveaways.slice(0, 2).map((giveaway: any) => (
              <GiveawayCard key={giveaway.id} giveaway={giveaway} />
            ))
          )}
        </div>
      </div>

      {/* Schedule Preview */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Upcoming Schedule</h2>
          <Link href="/schedule" className="text-[#5865F2] text-sm hover:underline">Manage Schedule</Link>
        </div>
        
        <div className="bg-[#2D3136] rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Today</h3>
              <div className="text-xs font-mono text-[#8E9297]">Current time: {format(new Date(), 'h:mm a')}</div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-700">
            {scheduleLoading ? (
              <div className="p-4 text-center">Loading scheduled giveaways...</div>
            ) : !scheduledGiveaways?.length ? (
              <div className="p-4 text-center">No scheduled giveaways</div>
            ) : (
              scheduledGiveaways.slice(0, 3).map((giveaway: any) => (
                <ScheduleItem key={giveaway.id} giveaway={giveaway} />
              ))
            )}
          </div>
          
          {!scheduleLoading && scheduledGiveaways?.length > 3 && (
            <div className="p-4 bg-gray-800 text-center">
              <Link href="/schedule" className="text-[#5865F2] hover:underline text-sm">
                Show more ({scheduledGiveaways.length - 3}+)
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Invite Tracking */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Invite Tracking</h2>
          <div>
            <button className="py-1.5 px-3 bg-[#5865F2] hover:bg-[#5865F2]/80 text-white rounded-md text-sm">
              Run /checkinvites
            </button>
          </div>
        </div>
        
        <div className="bg-[#2D3136] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#8E9297] uppercase bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3">Staff Member</th>
                  <th scope="col" className="px-6 py-3">Server</th>
                  <th scope="col" className="px-6 py-3">Invite Code</th>
                  <th scope="col" className="px-6 py-3 text-right">Total Joins</th>
                  <th scope="col" className="px-6 py-3 text-right">Weekly Quota</th>
                  <th scope="col" className="px-6 py-3 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {inviteStatsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">Loading invite statistics...</td>
                  </tr>
                ) : !inviteStats?.userStats?.length ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">No invite data available</td>
                  </tr>
                ) : (
                  inviteStats.userStats.slice(0, 3).map((userStat: any) => (
                    userStat.servers.slice(0, 1).map((server: any) => (
                      <tr key={`${userStat.userId}-${server.name}`} className="hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white mr-2">
                              {userStat.username.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-white">{userStat.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#DCDDDE]">
                          {server.name}
                        </td>
                        <td className="px-6 py-4 font-mono text-[#8E9297]">
                          {server.inviteCodes[0]?.code || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right text-[#DCDDDE]">
                          {server.uses}
                        </td>
                        <td className="px-6 py-4 text-right text-[#DCDDDE]">
                          50
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className={`h-2.5 rounded-full ${
                                server.uses >= 50 ? 'bg-[#57F287]' : 'bg-[#5865F2]'
                              }`} 
                              style={{ width: `${Math.min(server.uses / 50 * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className={`text-xs mt-1 ${
                            server.uses >= 50 ? 'text-[#57F287]' : 'text-[#8E9297]'
                          }`}>
                            {server.uses >= 50 
                              ? `Completed! (${server.uses}/50)` 
                              : `${Math.round(server.uses / 50 * 100)}% (${server.uses}/50)`
                            }
                          </div>
                        </td>
                      </tr>
                    ))
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {!inviteStatsLoading && inviteStats?.userStats?.length > 3 && (
            <div className="p-4 bg-gray-800 text-center">
              <Link href="/invite-tracking" className="text-[#5865F2] hover:underline text-sm">
                View all invite statistics
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
