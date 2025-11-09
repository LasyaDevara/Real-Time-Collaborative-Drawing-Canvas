import { MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  onChatToggle: () => void;
  onUserListToggle: () => void;
  unreadMessages?: number;
}

export default function FloatingActionButton({
  onChatToggle,
  onUserListToggle,
  unreadMessages = 0,
}: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-4 left-4 flex gap-3 z-10">
      <div className="relative">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg backdrop-blur-xl"
          style={{
            background: 'rgba(139, 92, 246, 0.9)',
          }}
          onClick={onChatToggle}
          data-testid="button-toggle-chat"
          title="Toggle Chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        {unreadMessages > 0 && (
          <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadMessages > 9 ? '9+' : unreadMessages}
          </div>
        )}
      </div>
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg backdrop-blur-xl"
        style={{
          background: 'rgba(139, 92, 246, 0.9)',
        }}
        onClick={onUserListToggle}
        data-testid="button-toggle-users"
        title="Toggle User List"
      >
        <Users className="h-6 w-6" />
      </Button>
    </div>
  );
}
