import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function InviteTracking() {
  // Fetch invite statistics
  const { 
    data: inviteStats, 
    isLoading,
    isError,
    error 
  } = useQuery({
    queryKey: ['/api/invites/stats'],
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Invite Tracking</h1>
        <button className="py-1.5 px-3 bg-[#5865F2] hover:bg-[#5865F2]/80 text-white rounded-md text-sm">
          Run /checkinvites
        </button>
      </div>

      <div className="bg-[#2D3136] rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2">
          <h2 className="text-white font-semibold mb-2 md:mb-0">Weekly Invite Statistics</h2>
          {inviteStats?.weekStartDate && (
            <div className="text-sm text-[#8E9297]">
              Week of {format(new Date(inviteStats.weekStartDate), 'MMMM d, yyyy')} (Resets on Sunday)
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-700/50 rounded p-3">
            <div className="text-[#8E9297] text-sm mb-1">Total Invites</div>
            <div className="text-white text-2xl font-bold">{inviteStats?.totalInvites || 0}</div>
          </div>

          <div className="bg-gray-700/50 rounded p-3">
            <div className="text-[#8E9297] text-sm mb-1">Active Staff Members</div>
            <div className="text-white text-2xl font-bold">{inviteStats?.userStats?.length || 0}</div>
          </div>

          <div className="bg-gray-700/50 rounded p-3">
            <div className="text-[#8E9297] text-sm mb-1">Weekly Invite Quota</div>
            <div className="text-white text-2xl font-bold">2 <span className="text-[#8E9297] text-sm font-normal">per staff</span></div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5865F2] mx-auto"></div>
          <p className="mt-4 text-[#DCDDDE]">Loading invite statistics...</p>
        </div>
      ) : isError ? (
        <div className="bg-[#2D3136] p-6 rounded-lg text-center">
          <p className="text-[#ED4245] mb-2">Error loading invite statistics</p>
          <p className="text-[#8E9297] text-sm">{(error as Error)?.message || "Unknown error occurred"}</p>
        </div>
      ) : !inviteStats?.userStats?.length ? (
        <div className="bg-[#2D3136] p-8 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#8E9297] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-white text-lg font-medium mb-2">No invite data available</h3>
          <p className="text-[#8E9297]">There are no recorded invites for this week.</p>
        </div>
      ) : (
        <div className="bg-[#2D3136] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#8E9297] uppercase bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3">Staff Member</th>
                  <th scope="col" className="px-6 py-3">Server</th>
                  <th scope="col" className="px-6 py-3">Invite Code</th>
                  <th scope="col" className="px-6 py-3 text-right">Total Joins</th>
                  <th scope="col" className="px-6 py-3 text-right">Weekly Invite Quota</th>
                  <th scope="col" className="px-6 py-3 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {inviteStats.userStats.flatMap((userStat: any) => 
                  userStat.servers.map((server: any) => (
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
                        {server.inviteCodes.map((invite: any, index: number) => (
                          <div key={invite.code}>
                            {invite.code} {invite.uses > 0 && `(${invite.uses})`}
                            {index < server.inviteCodes.length - 1 && ", "}
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 text-right text-[#DCDDDE]">
                        {server.uses}
                      </td>
                      <td className="px-6 py-4 text-right text-[#DCDDDE]">
                        2
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-2.5 rounded-full ${
                              server.uses >= 2 ? 'bg-[#57F287]' : 'bg-[#5865F2]'
                            }`} 
                            style={{ width: `${Math.min(server.uses / 2 * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className={`text-xs mt-1 ${
                          server.uses >= 2 ? 'text-[#57F287]' : 'text-[#8E9297]'
                        }`}>
                          {server.uses >= 2 
                            ? `Completed! (${server.uses}/2)` 
                            : `${Math.round(server.uses / 2 * 100)}% (${server.uses}/2)`
                          }
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
