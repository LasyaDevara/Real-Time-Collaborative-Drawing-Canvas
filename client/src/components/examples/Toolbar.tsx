import { useState } from 'react';
import Toolbar from '../Toolbar';

export default function ToolbarExample() {
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  return (
    <div className="relative w-full h-32 bg-gradient-to-br from-blue-50 to-purple-50">
      <Toolbar
        tool={tool}
        onToolChange={setTool}
        onUndo={() => console.log('Undo triggered')}
        onRedo={() => console.log('Redo triggered')}
        onClear={() => console.log('Clear triggered')}
        onExport={() => console.log('Export triggered')}
        onInvite={() => console.log('Invite triggered')}
        canUndo={true}
        canRedo={true}
      />
    </div>
  );
}
