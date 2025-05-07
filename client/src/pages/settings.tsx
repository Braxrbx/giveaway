import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Define interface for settings
interface BotSettings {
  botToken: string;
  guildId: string;
  managementChannelId: string;
  giveawayChannelId: string;
  weeklyQuota: string;
  notifyApprovals: boolean;
  notifyDenials: boolean;
  notifyPostings: boolean;
}

export default function Settings() {
  const queryClient = useQueryClient();
  const [botToken, setBotToken] = useState<string>("");
  const [guildId, setGuildId] = useState<string>("");
  const [managementChannelId, setManagementChannelId] = useState<string>("");
  const [giveawayChannelId, setGiveawayChannelId] = useState<string>("");
  const [weeklyQuota, setWeeklyQuota] = useState<string>("2");
  
  const [notifyApprovals, setNotifyApprovals] = useState<boolean>(true);
  const [notifyDenials, setNotifyDenials] = useState<boolean>(true);
  const [notifyPostings, setNotifyPostings] = useState<boolean>(true);
  
  // Fetch current settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      return await response.json() as BotSettings;
    }
  });
  
  // Update state when settings are loaded
  useEffect(() => {
    if (settings) {
      setBotToken(settings.botToken);
      setGuildId(settings.guildId);
      setManagementChannelId(settings.managementChannelId);
      setGiveawayChannelId(settings.giveawayChannelId);
      setWeeklyQuota(settings.weeklyQuota);
      setNotifyApprovals(settings.notifyApprovals);
      setNotifyDenials(settings.notifyDenials);
      setNotifyPostings(settings.notifyPostings);
    }
  }, [settings]);
  
  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: BotSettings) => {
      const response = await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify(newSettings),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings saved",
        description: "Your bot settings have been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error saving settings:', error);
      toast({
        title: "Failed to save settings",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Restart bot mutation
  const restartBotMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/bot/restart', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to restart bot');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bot reset",
        description: "The bot has been reset and is now reconnecting.",
      });
    },
    onError: (error) => {
      console.error('Error restarting bot:', error);
      toast({
        title: "Failed to restart bot",
        description: "There was an error restarting the bot. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const saveSettings = () => {
    // Create settings object to save
    const settingsToSave: BotSettings = {
      botToken,
      guildId,
      managementChannelId,
      giveawayChannelId,
      weeklyQuota,
      notifyApprovals,
      notifyDenials,
      notifyPostings
    };
    
    // Call the mutation to save settings
    saveSettingsMutation.mutate(settingsToSave);
  };

  const resetBot = () => {
    // Call the mutation to restart the bot
    restartBotMutation.mutate();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Bot Settings</h1>
        <div className="flex gap-2">
          <Button 
            onClick={resetBot}
            variant="outline" 
            className="border-gray-700 text-[#DCDDDE] hover:bg-gray-700 hover:text-white"
            disabled={restartBotMutation.isPending}
          >
            {restartBotMutation.isPending ? "Restarting..." : "Reset Bot"}
          </Button>
          <Button 
            onClick={saveSettings}
            className="bg-[#5865F2] hover:bg-[#5865F2]/80 text-white"
            disabled={saveSettingsMutation.isPending || isLoading}
          >
            {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-md text-red-200">
          <p className="text-sm">Failed to load settings. Please try again.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Discord Configuration */}
        <Card className="bg-[#2D3136] border-gray-700 text-[#DCDDDE]">
          <CardHeader>
            <CardTitle className="text-white">Discord Configuration</CardTitle>
            <CardDescription>Configure your Discord bot and server settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="botToken">Bot Token</Label>
                <Input
                  id="botToken"
                  type="password"
                  placeholder="••••••••••••••••••••••••••"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-[#8E9297]">The token is stored securely in the .env file</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guildId">Guild ID (Staff Server)</Label>
                <Input
                  id="guildId"
                  placeholder="Enter guild ID"
                  value={guildId}
                  onChange={(e) => setGuildId(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="managementChannelId">Management Channel ID</Label>
                  <Input
                    id="managementChannelId"
                    placeholder="Enter channel ID"
                    value={managementChannelId}
                    onChange={(e) => setManagementChannelId(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <p className="text-xs text-[#8E9297]">Where approval requests are sent</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="giveawayChannelId">Giveaway Channel ID</Label>
                  <Input
                    id="giveawayChannelId"
                    placeholder="Enter channel ID"
                    value={giveawayChannelId}
                    onChange={(e) => setGiveawayChannelId(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <p className="text-xs text-[#8E9297]">Where giveaways are posted</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Giveaway Settings */}
        <Card className="bg-[#2D3136] border-gray-700 text-[#DCDDDE]">
          <CardHeader>
            <CardTitle className="text-white">Giveaway Settings</CardTitle>
            <CardDescription>Configure how giveaways and invites are managed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="weeklyQuota">Weekly Giveaway Request Quota</Label>
              <Input
                id="weeklyQuota"
                type="number"
                placeholder="2"
                value={weeklyQuota}
                onChange={(e) => setWeeklyQuota(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white w-full md:w-1/4"
              />
              <p className="text-xs text-[#8E9297]">Number of mutual giveaway requests staff members must make each week</p>
            </div>
            
            <Separator className="bg-gray-700" />
            
            <div className="space-y-4">
              <h3 className="font-medium text-white">Notification Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifyApprovals" className="text-[#DCDDDE]">Approval Notifications</Label>
                  <p className="text-xs text-[#8E9297]">DM staff when their giveaway is approved</p>
                </div>
                <Switch
                  id="notifyApprovals"
                  checked={notifyApprovals}
                  onCheckedChange={setNotifyApprovals}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifyDenials" className="text-[#DCDDDE]">Denial Notifications</Label>
                  <p className="text-xs text-[#8E9297]">DM staff when their giveaway is denied</p>
                </div>
                <Switch
                  id="notifyDenials"
                  checked={notifyDenials}
                  onCheckedChange={setNotifyDenials}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifyPostings" className="text-[#DCDDDE]">Posting Notifications</Label>
                  <p className="text-xs text-[#8E9297]">DM staff when their giveaway is posted</p>
                </div>
                <Switch
                  id="notifyPostings"
                  checked={notifyPostings}
                  onCheckedChange={setNotifyPostings}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
