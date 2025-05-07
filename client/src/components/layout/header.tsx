import { useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();
  
  const getPageTitle = () => {
    switch (location) {
      case '/':
        return 'Mutual Giveaways Dashboard';
      case '/pending-giveaways':
        return 'Pending Giveaways';
      case '/schedule':
        return 'Giveaway Schedule';
      case '/invite-tracking':
        return 'Invite Tracking';
      case '/commands':
        return 'Bot Commands';
      case '/settings':
        return 'Bot Settings';
      default:
        return 'Mutual Giveaways Bot';
    }
  };

  return (
    <header className="bg-[#2D3136] p-4 border-b border-gray-700">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">{getPageTitle()}</h2>
        <div className="flex items-center space-x-3">
          <span className="py-1 px-2 bg-green-500/20 text-[#57F287] text-xs rounded-full flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Bot Online
          </span>
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#8E9297]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {location === '/' && (
        <div className="mt-4 bg-[#2D3136] border-b border-gray-700 p-4">
          <div className="flex items-center bg-gray-800 rounded-md p-2">
            <span className="text-[#5865F2] mr-2">/</span>
            <input 
              type="text" 
              placeholder="requestgw [server-name] [perm-server-invite] [server-member-count] [our-ping] [their ping] [their prize]" 
              className="bg-transparent border-none w-full focus:outline-none text-white" 
            />
            <button className="ml-2 bg-[#5865F2] hover:bg-[#5865F2]/80 text-white py-1 px-3 rounded-md text-sm">
              Submit
            </button>
          </div>
          
          <div className="mt-2 text-xs text-[#8E9297]">
            <p>Use <span className="px-1 bg-gray-700 rounded font-mono">/requestgw</span> to submit a new mutual giveaway request for approval</p>
          </div>
        </div>
      )}
    </header>
  );
}
