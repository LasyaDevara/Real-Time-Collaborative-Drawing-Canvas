import UserList from '../UserList';

const mockUsers = [
  { id: '1', username: 'Alice', color: '#EF4444', isOnline: true },
  { id: '2', username: 'Bob', color: '#10B981', isOnline: true },
  { id: '3', username: 'Charlie', color: '#3B82F6', isOnline: false },
  { id: '4', username: 'Diana', color: '#F59E0B', isOnline: true },
];

export default function UserListExample() {
  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <UserList users={mockUsers} isOpen={true} onClose={() => console.log('Close user list')} />
    </div>
  );
}
