import { useState } from 'react';
import DrawingCanvas from '../DrawingCanvas';

export default function DrawingCanvasExample() {
  const [tool] = useState<'brush' | 'eraser'>('brush');
  const [color] = useState('#3B82F6');
  const [brushSize] = useState(5);

  return (
    <div className="w-full h-screen">
      <DrawingCanvas
        tool={tool}
        color={color}
        brushSize={brushSize}
        remoteCursors={[
          { id: '1', x: 100, y: 100, color: '#EF4444', username: 'Alice' },
          { id: '2', x: 200, y: 150, color: '#10B981', username: 'Bob' },
        ]}
      />
    </div>
  );
}
