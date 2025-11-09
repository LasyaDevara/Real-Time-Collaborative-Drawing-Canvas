import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

// Comprehensive Figma color palette organized by color families
const FIGMA_COLORS = {
  // Grays
  gray: [
    '#FFFFFF', '#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB',
    '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937',
    '#111827', '#030712', '#000000'
  ],
  // Reds
  red: [
    '#FEF2F2', '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171',
    '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'
  ],
  // Oranges
  orange: [
    '#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74', '#FB923C',
    '#F97316', '#EA580C', '#C2410C', '#9A3412', '#7C2D12'
  ],
  // Yellows
  yellow: [
    '#FEFCE8', '#FEF9C3', '#FEF08A', '#FDE047', '#FACC15',
    '#EAB308', '#CA8A04', '#A16207', '#854D0E', '#713F12'
  ],
  // Greens
  green: [
    '#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80',
    '#22C55E', '#16A34A', '#15803D', '#166534', '#14532D'
  ],
  // Teals
  teal: [
    '#F0FDFA', '#CCFBF1', '#99F6E4', '#5EEAD4', '#2DD4BF',
    '#14B8A6', '#0D9488', '#0F766E', '#115E59', '#134E4A'
  ],
  // Cyans
  cyan: [
    '#ECFEFF', '#CFFAFE', '#A5F3FC', '#67E8F9', '#22D3EE',
    '#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63'
  ],
  // Blues
  blue: [
    '#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA',
    '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'
  ],
  // Indigos
  indigo: [
    '#EEF2FF', '#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8',
    '#6366F1', '#4F46E5', '#4338CA', '#3730A3', '#312E81'
  ],
  // Purples
  purple: [
    '#FAF5FF', '#F3E8FF', '#E9D5FF', '#D8B4FE', '#C084FC',
    '#A855F7', '#9333EA', '#7E22CE', '#6B21A8', '#581C87'
  ],
  // Pinks
  pink: [
    '#FDF2F8', '#FCE7F3', '#FBCFE8', '#F9A8D4', '#F472B6',
    '#EC4899', '#DB2777', '#BE185D', '#9F1239', '#831843'
  ],
  // Roses
  rose: [
    '#FFF1F2', '#FFE4E6', '#FECDD3', '#FDA4AF', '#FB7185',
    '#F43F5E', '#E11D48', '#BE123C', '#9F1239', '#881337'
  ],
};

const COLOR_NAMES = {
  gray: 'Gray',
  red: 'Red',
  orange: 'Orange',
  yellow: 'Yellow',
  green: 'Green',
  teal: 'Teal',
  cyan: 'Cyan',
  blue: 'Blue',
  indigo: 'Indigo',
  purple: 'Purple',
  pink: 'Pink',
  rose: 'Rose',
};

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 rounded-xl border shadow-lg backdrop-blur-xl z-10 max-w-4xl"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
      }}
      data-testid="color-picker-container"
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-sm font-medium text-foreground">Color Palette</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {/* Quick access to most common colors */}
              {['#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map((presetColor) => (
                <button
                  key={presetColor}
                  className={`w-6 h-6 rounded border transition-transform ${
                    color === presetColor ? 'border-primary scale-110 ring-2 ring-primary' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => onChange(presetColor)}
                  data-testid={`color-quick-${presetColor}`}
                  title={presetColor}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2 text-xs"
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-6 h-6 rounded border-2"
                  style={{ backgroundColor: color }}
                  data-testid="button-custom-color"
                  title="Custom color"
                >
                  <span className="sr-only">Custom color</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-32 h-32 cursor-pointer"
                  data-testid="input-color-picker"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4 max-h-96 overflow-y-auto pr-2">
            {Object.entries(FIGMA_COLORS).map(([colorFamily, colors]) => (
              <div key={colorFamily} className="space-y-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {COLOR_NAMES[colorFamily as keyof typeof COLOR_NAMES]}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {colors.map((colorValue) => (
                    <button
                      key={colorValue}
                      className={`w-7 h-7 rounded border transition-all hover:scale-110 ${
                        color === colorValue
                          ? 'border-primary ring-2 ring-primary scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: colorValue }}
                      onClick={() => onChange(colorValue)}
                      data-testid={`color-${colorFamily}-${colorValue}`}
                      title={colorValue}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
