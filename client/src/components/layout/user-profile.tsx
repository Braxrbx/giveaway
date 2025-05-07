import { useUser } from '@/contexts/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

export default function UserProfile() {
  const { user, logout } = useUser();

  if (!user) return null;

  const initials = user.username
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="flex flex-col items-end">
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-white">{user.username}</p>
              <p className="text-xs text-gray-400">{user.isAdmin ? 'Admin' : 'Staff'}</p>
            </div>
            <Avatar className="h-8 w-8 border border-gray-700">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
              <AvatarFallback className="bg-[#5865F2] text-white">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#2D3136] border-gray-700 text-white">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{user.username}</span>
              <span className="text-xs text-gray-400">ID: {user.discordId}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
            <FaUserCircle className="mr-2" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-gray-800 focus:bg-gray-800"
            onClick={logout}
          >
            <FaSignOutAlt className="mr-2" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}