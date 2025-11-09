import ChatPanel from '../ChatPanel';

const mockMessages = [
  {
    id: '1',
    userId: 'user1',
    username: 'Alice',
    userColor: '#EF4444',
    message: 'Hey everyone!',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    userId: 'user2',
    username: 'Bob',
    userColor: '#10B981',
    message: 'Nice drawing!',
    timestamp: new Date(Date.now() - 200000),
  },
  {
    id: '3',
    userId: 'currentUser',
    username: 'You',
    userColor: '#3B82F6',
    message: 'Thanks! Let me add more details.',
    timestamp: new Date(Date.now() - 100000),
  },
];

export default function ChatPanelExample() {
  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <ChatPanel
        messages={mockMessages}
        currentUserId="currentUser"
        isOpen={true}
        onClose={() => console.log('Close chat')}
        onSendMessage={(msg) => console.log('Send message:', msg)}
      />
    </div>
  );
}
