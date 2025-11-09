import FloatingActionButton from '../FloatingActionButton';

export default function FloatingActionButtonExample() {
  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50">
      <FloatingActionButton
        onChatToggle={() => console.log('Toggle chat')}
        onUserListToggle={() => console.log('Toggle user list')}
        unreadMessages={3}
      />
    </div>
  );
}
