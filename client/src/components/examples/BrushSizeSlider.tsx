import { useState } from 'react';
import BrushSizeSlider from '../BrushSizeSlider';

export default function BrushSizeSliderExample() {
  const [size, setSize] = useState(10);

  return (
    <div className="relative w-full h-32 bg-gradient-to-br from-blue-50 to-purple-50">
      <BrushSizeSlider size={size} onChange={setSize} />
    </div>
  );
}
