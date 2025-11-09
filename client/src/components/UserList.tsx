import { Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export interface User {
  id: string;
  username: string;
  color: string;
  isOnline: boolean;
}

interface UserListProps {
  users: User[];
  maxUsers: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserList({ users, maxUsers, isOpen, onClose }: UserListProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute top-4 right-4 w-72 rounded-xl border shadow-lg backdrop-blur-xl z-20"
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        maxHeight: 'calc(100vh - 2rem)',
      }}
      data-testid="user-list-panel"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            Active Users ({users.length}/{maxUsers})
          </h3>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          data-testid="button-close-user-list"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="p-3 space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg hover-elevate"
              data-testid={`user-card-${user.id}`}
            >
              <div className="relative">
                <Avatar className="h-10 w-10" style={{ backgroundColor: user.color }}>
                  <AvatarFallback style={{ backgroundColor: user.color, color: 'white' }}>
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.username}</p>
                <p className="text-xs text-muted-foreground">
                  {user.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
