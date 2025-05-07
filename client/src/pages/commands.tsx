import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Commands() {
  const commands = [
    {
      name: "/requestgw",
      description: "Request a mutual giveaway with another server",
      usage: "/requestgw [server-name] [server-invite] [member-count] [our-ping] [their-ping] [prize]",
      example: "/requestgw Gaming Community discord.gg/gaming 15000 @Mutual Giveaways @everyone Discord Nitro",
      parameters: [
        { name: "server-name", description: "Name of the partner server" },
        { name: "server-invite", description: "Permanent invite link to the server" },
        { name: "member-count", description: "Number of members in the partner server" },
        { name: "our-ping", description: "Ping to use in our server (@everyone, @here, @Mutual Giveaways, No Ping)" },
        { name: "their-ping", description: "Ping they will use in their server (@everyone, @here, Other, No Ping)" },
        { name: "prize", description: "Prize they are offering for the giveaway" }
      ]
    },
    {
      name: "/checkinvites",
      description: "Check your invite counts for mutual giveaways",
      usage: "/checkinvites",
      example: "/checkinvites",
      parameters: []
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Bot Commands</h1>
      </div>

      <div className="grid gap-6">
        {commands.map((command) => (
          <Card key={command.name} className="bg-[#2D3136] border-gray-700 text-[#DCDDDE]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <div className="bg-[#5865F2] text-white p-1 rounded mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-mono">{command.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{command.description}</p>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#8E9297] mb-2">Usage</h3>
                <div className="bg-gray-800 p-3 rounded-md font-mono text-sm">
                  {command.usage}
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#8E9297] mb-2">Example</h3>
                <div className="bg-gray-800 p-3 rounded-md font-mono text-sm">
                  {command.example}
                </div>
              </div>
              
              {command.parameters.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#8E9297] mb-2">Parameters</h3>
                  <div className="bg-gray-800 rounded-md p-3">
                    <div className="grid gap-2">
                      {command.parameters.map((param, index) => (
                        <div key={param.name}>
                          <div className="flex items-start">
                            <code className="text-[#5865F2] font-mono text-sm">{param.name}</code>
                            <div className="mx-2 text-gray-500">-</div>
                            <div className="text-sm">{param.description}</div>
                          </div>
                          {index < command.parameters.length - 1 && (
                            <Separator className="my-2 bg-gray-700" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 bg-[#2D3136] p-4 rounded-lg border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-2">Important Notes</h2>
        <ul className="list-disc list-inside space-y-2 text-[#DCDDDE]">
          <li><span className="text-[#8E9297]">Staff only:</span> These commands can only be used by staff members with appropriate permissions.</li>
          <li><span className="text-[#8E9297]">Server restriction:</span> The /requestgw command must be used in the staff server.</li>
          <li><span className="text-[#8E9297]">Ping limits:</span> @everyone is limited to 1 per day, @here is limited to 1 per day (2 if no @everyone used that day).</li>
          <li><span className="text-[#8E9297]">Approval process:</span> All giveaway requests must be approved by management before posting.</li>
          <li><span className="text-[#8E9297]">Quota tracking:</span> Staff members are expected to bring in 50 invites per week.</li>
        </ul>
      </div>
    </div>
  );
}
