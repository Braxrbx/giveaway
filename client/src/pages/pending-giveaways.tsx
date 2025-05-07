import { useQuery } from "@tanstack/react-query";
import GiveawayCard from "@/components/giveaways/giveaway-card";

export default function PendingGiveaways() {
  // Fetch pending giveaways
  const { 
    data: pendingGiveaways, 
    isLoading,
    isError,
    error 
  } = useQuery({
    queryKey: ['/api/giveaways/pending'],
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Pending Giveaway Approvals</h1>
      </div>

      {isLoading ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5865F2] mx-auto"></div>
          <p className="mt-4 text-[#DCDDDE]">Loading pending giveaways...</p>
        </div>
      ) : isError ? (
        <div className="bg-[#2D3136] p-6 rounded-lg text-center">
          <p className="text-[#ED4245] mb-2">Error loading giveaways</p>
          <p className="text-[#8E9297] text-sm">{(error as Error)?.message || "Unknown error occurred"}</p>
        </div>
      ) : !pendingGiveaways?.length ? (
        <div className="bg-[#2D3136] p-8 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#8E9297] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-white text-lg font-medium mb-2">All caught up!</h3>
          <p className="text-[#8E9297]">There are no pending giveaway requests to approve.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingGiveaways.map((giveaway: any) => (
            <GiveawayCard key={giveaway.id} giveaway={giveaway} />
          ))}
        </div>
      )}
    </div>
  );
}
