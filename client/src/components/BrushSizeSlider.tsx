import { Slider } from '@/components/ui/slider';

interface BrushSizeSliderProps {
  size: number;
  onChange: (size: number) => void;
}

export default function BrushSizeSlider({ size, onChange }: BrushSizeSliderProps) {
  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl border shadow-lg backdrop-blur-xl z-10"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
      }}
      data-testid="brush-size-slider-container"
    >
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground whitespace-nowrap">Brush Size</span>
        <Slider
          value={[size]}
          onValueChange={(values) => onChange(values[0])}
          min={1}
          max={50}
          step={1}
          className="w-40"
          data-testid="slider-brush-size"
        />
        <span className="text-sm font-medium text-muted-foreground w-8 text-right">
          {size}px
        </span>
      </div>
    </div>
  );
}
