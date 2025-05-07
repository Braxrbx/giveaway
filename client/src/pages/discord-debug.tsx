import { useEffect, useState } from "react";

export default function DiscordDebug() {
  const [debugInfo, setDebugInfo] = useState({
    repl_slug: "",
    repl_owner: "",
    full_url: ""
  });

  useEffect(() => {
    // Use fetch to get environment variables from the server
    fetch('/api/auth/debug')
      .then(response => response.json())
      .then(data => {
        setDebugInfo(data);
      })
      .catch(error => {
        console.error("Error fetching debug info:", error);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-[#2D3136] p-8 rounded-lg shadow-xl text-white">
        <h1 className="text-2xl font-bold mb-6 text-center">Discord OAuth Debug Information</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium text-gray-300">Environment Variables:</h2>
            <div className="bg-[#36393F] p-4 rounded-lg mt-2">
              <p><span className="text-blue-400">REPL_SLUG:</span> {debugInfo.repl_slug}</p>
              <p><span className="text-blue-400">REPL_OWNER:</span> {debugInfo.repl_owner}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-gray-300">Redirect URL to configure in Discord Developer Portal:</h2>
            <div className="bg-[#36393F] p-4 rounded-lg mt-2 overflow-x-auto">
              <code className="text-green-400 break-all">{debugInfo.full_url}</code>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-4 mt-6">
            <h2 className="text-lg font-medium text-gray-300">Instructions:</h2>
            <ol className="list-decimal list-inside mt-2 space-y-2 text-gray-300">
              <li>Copy the URL above</li>
              <li>Go to the <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Discord Developer Portal</a></li>
              <li>Select your application</li>
              <li>Go to OAuth2 &gt; General</li>
              <li>Add the URL above as a Redirect URL and Save Changes</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}