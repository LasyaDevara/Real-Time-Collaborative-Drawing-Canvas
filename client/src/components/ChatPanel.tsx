import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  userColor: string;
  message: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
}

export default function ChatPanel({
  messages,
  currentUserId,
  isOpen,
  onClose,
  onSendMessage,
}: ChatPanelProps) {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute bottom-4 right-4 w-80 rounded-xl border shadow-lg backdrop-blur-xl z-20 flex flex-col"
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        height: '400px',
      }}
      data-testid="chat-panel"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Chat</h3>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          data-testid="button-close-chat"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg) => {
            const isOwnMessage = msg.userId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${msg.id}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                  style={
                    !isOwnMessage
                      ? {
                          borderLeft: `3px solid ${msg.userColor}`,
                        }
                      : undefined
                  }
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-medium mb-1" style={{ color: msg.userColor }}>
                      {msg.username}
                    </p>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            data-testid="input-chat-message"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
