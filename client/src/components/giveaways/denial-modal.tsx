import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DenialModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  giveaway: {
    id: number;
    serverName: string;
  };
  onSuccess: () => void;
}

export function DenialModal({ isOpen, setIsOpen, giveaway, onSuccess }: DenialModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation state
  const [isError, setIsError] = useState(false);

  const handleDeny = async () => {
    // Validate reason
    if (!reason.trim()) {
      setIsError(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiRequest('POST', `/api/giveaways/${giveaway.id}/deny`, {
        reason
      });
      
      toast({
        title: "Giveaway denied",
        description: `The giveaway for ${giveaway.serverName} has been denied.`,
      });
      
      onSuccess();
      setIsOpen(false);
    } catch (error) {
      console.error('Error denying giveaway:', error);
      toast({
        title: "Error",
        description: "Failed to deny the giveaway. Please try again.",
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
          <DialogTitle className="text-white text-lg">Deny Giveaway</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <h4 className="text-[#8E9297] mb-2">{giveaway.serverName}</h4>
        </div>
        
        <div className="mb-4">
          <Label htmlFor="reason" className="block text-[#8E9297] mb-2">
            Reason for Denial <span className="text-[#ED4245]">*</span>
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) {
                setIsError(false);
              }
            }}
            className={`w-full bg-gray-800 border ${isError ? 'border-[#ED4245]' : 'border-gray-700'} rounded-md p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5865F2]`}
            rows={3}
            placeholder="Provide a reason for denying this giveaway request"
          />
          {isError && (
            <p className="text-xs text-[#ED4245] mt-1">Please provide a reason for denial</p>
          )}
          <p className="text-xs text-[#8E9297] mt-1">This message will be sent to the staff member who requested the giveaway.</p>
        </div>
        
        <DialogFooter className="border-t border-gray-700 pt-4 sm:flex-row-reverse gap-2">
          <Button
            variant="destructive"
            className="bg-[#ED4245] hover:bg-[#ED4245]/80 text-white flex items-center"
            onClick={handleDeny}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            Deny
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
