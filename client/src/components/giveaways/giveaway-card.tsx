import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { queryClient } from "@/lib/queryClient";
import { ApprovalModal } from "./approval-modal";
import { DenialModal } from "./denial-modal";

interface GiveawayCardProps {
  giveaway: {
    id: number;
    requesterUserId: string;
    requesterUsername: string;
    serverName: string;
    serverInvite: string;
    memberCount: number;
    ourPing: string;
    theirPing: string;
    prize: string;
    requestedAt: string;
    status: string;
  };
}

export default function GiveawayCard({ giveaway }: GiveawayCardProps) {
  // Modal states for approval and denial
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isDenialModalOpen, setIsDenialModalOpen] = useState(false);
  
  // Handle approve button
  const handleApprove = () => {
    setIsApprovalModalOpen(true);
  };

  // Handle deny button
  const handleDeny = () => {
    setIsDenialModalOpen(true);
  };

  // Removed details button/handler per user request

  return (
    <>
      <div className="bg-[#2D3136] rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-white font-semibold">{giveaway.serverName}</h3>
              <p className="text-[#8E9297] text-sm">
                Requested by <span className="text-[#5865F2]">@{giveaway.requesterUsername}</span>
              </p>
            </div>
            <span className="py-1 px-2 bg-yellow-500/20 text-[#FEE75C] text-xs rounded-full">
              {giveaway.status.charAt(0).toUpperCase() + giveaway.status.slice(1)}
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <div className="w-28 text-[#8E9297]">Server:</div>
              <div className="text-white">{giveaway.serverName}</div>
            </div>
            <div className="flex items-center">
              <div className="w-28 text-[#8E9297]">Members:</div>
              <div className="text-white">{giveaway.memberCount.toLocaleString()}</div>
            </div>
            <div className="flex items-start">
              <div className="w-28 text-[#8E9297]">Our Ping:</div>
              <div className="text-white">{giveaway.ourPing}</div>
            </div>
            <div className="flex items-start">
              <div className="w-28 text-[#8E9297]">Their Ping:</div>
              <div className="text-white">{giveaway.theirPing}</div>
            </div>
            <div className="flex items-start">
              <div className="w-28 text-[#8E9297]">Prize:</div>
              <div className="text-white">{giveaway.prize}</div>
            </div>
          </div>
          
          <div className="flex items-center mt-4 text-xs text-[#8E9297]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Requested {formatDistanceToNow(new Date(giveaway.requestedAt), { addSuffix: false })} ago
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 flex items-center justify-between">
          <button 
            className="py-1.5 px-3 bg-[#57F287] hover:bg-[#57F287]/80 text-white rounded-md text-sm flex items-center"
            onClick={handleApprove}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </button>
          <button 
            className="py-1.5 px-3 bg-[#ED4245] hover:bg-[#ED4245]/80 text-white rounded-md text-sm flex items-center"
            onClick={handleDeny}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Deny
          </button>

        </div>
      </div>

      {/* Approval Modal */}
      <ApprovalModal 
        isOpen={isApprovalModalOpen} 
        setIsOpen={setIsApprovalModalOpen} 
        giveaway={giveaway}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/giveaways/pending'] });
          queryClient.invalidateQueries({ queryKey: ['/api/giveaways/scheduled'] });
        }}
      />

      {/* Denial Modal */}
      <DenialModal 
        isOpen={isDenialModalOpen} 
        setIsOpen={setIsDenialModalOpen} 
        giveaway={giveaway}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/giveaways/pending'] });
        }}
      />
    </>
  );
}
