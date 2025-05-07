import { useLocation, Link } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="w-16 md:w-56 bg-[#2F3136] flex-shrink-0 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold">
            GW
          </div>
          <h1 className="text-white font-bold hidden md:block">Giveaway Bot</h1>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto discord-scrollbar">
        <nav className="p-2">
          <div className="mb-2 text-[#8E9297] text-xs uppercase font-semibold px-2 hidden md:block">Bot Management</div>
          
          <Link href="/" className={`flex items-center px-2 py-2 rounded mb-1 hover:bg-gray-700/60 ${isActive('/') ? 'text-white bg-gray-700' : 'text-[#8E9297] hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span className="hidden md:block">Dashboard</span>
          </Link>
          
          <Link href="/pending-giveaways" className={`flex items-center px-2 py-2 rounded mb-1 hover:bg-gray-700/60 ${isActive('/pending-giveaways') ? 'text-white bg-gray-700' : 'text-[#8E9297] hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span className="hidden md:block">Pending Giveaways</span>
          </Link>
          
          <Link href="/schedule" className={`flex items-center px-2 py-2 rounded mb-1 hover:bg-gray-700/60 ${isActive('/schedule') ? 'text-white bg-gray-700' : 'text-[#8E9297] hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden md:block">Schedule</span>
          </Link>
          
          <Link href="/invite-tracking" className={`flex items-center px-2 py-2 rounded mb-1 hover:bg-gray-700/60 ${isActive('/invite-tracking') ? 'text-white bg-gray-700' : 'text-[#8E9297] hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden md:block">Invite Tracking</span>
          </Link>
          
          <Link href="/statistics" className={`flex items-center px-2 py-2 rounded mb-1 hover:bg-gray-700/60 ${isActive('/statistics') ? 'text-white bg-gray-700' : 'text-[#8E9297] hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden md:block">Statistics</span>
          </Link>
        </nav>
        
        <div className="mt-2 px-2">
          <div className="mb-2 text-[#8E9297] text-xs uppercase font-semibold px-2 hidden md:block">Help</div>
          
          <Link href="/commands" className={`flex items-center px-2 py-2 rounded mb-1 hover:bg-gray-700/60 ${isActive('/commands') ? 'text-white bg-gray-700' : 'text-[#8E9297] hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="hidden md:block">Commands</span>
          </Link>
          
          <Link href="/settings" className={`flex items-center px-2 py-2 rounded mb-1 hover:bg-gray-700/60 ${isActive('/settings') ? 'text-white bg-gray-700' : 'text-[#8E9297] hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden md:block">Settings</span>
          </Link>
        </div>
      </div>
      
      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="hidden md:block ml-2">
            <div className="text-sm font-medium text-white">Staff Member</div>
            <div className="text-xs text-[#8E9297]">#marketing</div>
          </div>
        </div>
      </div>
    </div>
  );
}
