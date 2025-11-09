import { useState } from 'react';
import ColorPicker from '../ColorPicker';

export default function ColorPickerExample() {
  const [color, setColor] = useState('#3B82F6');

  return (
    <div className="relative w-full h-32 bg-gradient-to-br from-blue-50 to-purple-50">
      <ColorPicker color={color} onChange={setColor} />
    </div>
  );
}
