import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ApprovalModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  giveaway: {
    id: number;
    serverName: string;
    ourPing: string;
  };
  onSuccess: () => void;
}

export function ApprovalModal({ isOpen, setIsOpen, giveaway, onSuccess }: ApprovalModalProps) {
  const [message, setMessage] = useState("");
  const [notifyStaff, setNotifyStaff] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch ping status
  const { data: pingStatus } = useQuery({
    queryKey: ['/api/pings/status'],
  });

  // Determine if this giveaway will be scheduled based on the ping limits
  const determineScheduleStatus = () => {
    if (giveaway.ourPing === '@everyone' && pingStatus?.everyone) {
      return { scheduled: true, reason: '@everyone ping already used today' };
    } else if (giveaway.ourPing === '@here') {
      if (pingStatus?.here && pingStatus?.everyone) {
        return { scheduled: true, reason: 'both @here and @everyone already used today' };
      } else if (pingStatus?.here) {
        return { scheduled: true, reason: '@here ping already used today' };
      }
    }
    
    return { scheduled: false };
  };

  const scheduleStatus = determineScheduleStatus();

  const handleApprove = async () => {
    setIsSubmitting(true);
    
    try {
      await apiRequest('POST', `/api/giveaways/${giveaway.id}/approve`, {
        message,
        notifyStaff
      });
      
      toast({
        title: "Giveaway approved",
        description: scheduleStatus.scheduled 
          ? `The giveaway for ${giveaway.serverName} has been scheduled.` 
          : `The giveaway for ${giveaway.serverName} will be posted immediately.`,
      });
      
      onSuccess();
      setIsOpen(false);
    } catch (error) {
      console.error('Error approving giveaway:', error);
      toast({
        title: "Error",
        description: "Failed to approve the giveaway. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-[#2D3136] border-gray-700 text-[#DCDDDE] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Approve Giveaway</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <h4 className="text-[#8E9297] mb-2">{giveaway.serverName}</h4>
          
          {scheduleStatus.scheduled && (
            <div className="p-3 bg-gray-800 rounded-md">
              <div className="flex items-start gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#5865F2] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-[#DCDDDE]">
                  This giveaway will use <span className="text-white font-semibold">{giveaway.ourPing}</span> ping which has already been used today.
                </p>
              </div>
              
              <div className="py-1 px-2 bg-yellow-500/20 text-[#FEE75C] text-xs rounded-md inline-block">
                Will be scheduled for tomorrow at 12:00 AM
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <Label className="block text-[#8E9297] mb-2">Custom Message (Optional)</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
            rows={3}
            placeholder="Add any special instructions or notes"
          />
        </div>
        
        <div className="flex items-center mb-4">
          <Checkbox 
            id="notifyStaff" 
            checked={notifyStaff} 
            onCheckedChange={(checked) => setNotifyStaff(checked as boolean)}
            className="h-4 w-4 rounded bg-gray-800 border-gray-700 text-[#5865F2] focus:ring-[#5865F2] focus:ring-opacity-25"
          />
          <Label htmlFor="notifyStaff" className="ml-2 text-[#DCDDDE] text-sm">
            Notify staff member via DM
          </Label>
        </div>
        
        <DialogFooter className="border-t border-gray-700 pt-4 sm:flex-row-reverse gap-2">
          <Button
            variant="default"
            className="bg-[#57F287] hover:bg-[#57F287]/80 text-white flex items-center"
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            Approve
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-gray-700 text-[#DCDDDE] hover:bg-gray-700 hover:text-white"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
