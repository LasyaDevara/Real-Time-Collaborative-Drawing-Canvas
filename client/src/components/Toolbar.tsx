import { Paintbrush, Eraser, Droplet, Undo, Redo, Trash2, Download, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { DrawingTool } from './DrawingCanvas';

interface ToolbarProps {
  tool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  onInvite: () => void;
  onSync?: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function Toolbar({
  tool,
  onToolChange,
  onUndo,
  onRedo,
  onClear,
  onExport,
  onInvite,
  onSync,
  canUndo,
  canRedo,
}: ToolbarProps) {
  return (
    <div
      className="absolute top-4 left-4 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-xl z-10"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
      }}
      data-testid="toolbar"
    >
      <Button
        size="icon"
        variant={tool === 'brush' ? 'default' : 'ghost'}
        onClick={() => onToolChange('brush')}
        data-testid="button-brush-tool"
        title="Brush (B)"
      >
        <Paintbrush className="h-5 w-5" />
      </Button>
      <Button
        size="icon"
        variant={tool === 'eraser' ? 'default' : 'ghost'}
        onClick={() => onToolChange('eraser')}
        data-testid="button-eraser-tool"
        title="Eraser (E)"
      >
        <Eraser className="h-5 w-5" />
      </Button>
      <Button
        size="icon"
        variant={tool === 'fill' ? 'default' : 'ghost'}
        onClick={() => onToolChange('fill')}
        data-testid="button-fill-tool"
        title="Fill (F)"
      >
        <Droplet className="h-5 w-5" />
      </Button>

      <Separator orientation="vertical" className="h-8" />

      <Button
        size="icon"
        variant="ghost"
        onClick={onUndo}
        disabled={!canUndo}
        data-testid="button-undo"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-5 w-5" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={onRedo}
        disabled={!canRedo}
        data-testid="button-redo"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="h-5 w-5" />
      </Button>

      <Separator orientation="vertical" className="h-8" />

      <Button
        size="icon"
        variant="ghost"
        onClick={onClear}
        data-testid="button-clear"
        title="Clear Canvas"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={onExport}
        data-testid="button-export"
        title="Export as PNG"
      >
        <Download className="h-5 w-5" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={onInvite}
        data-testid="button-invite"
        title="Invite Friends"
      >
        <LinkIcon className="h-5 w-5" />
      </Button>
      {onSync && (
        <>
          <Separator orientation="vertical" className="h-8" />
          <Button
            size="icon"
            variant="ghost"
            onClick={onSync}
            data-testid="button-sync"
            title="Sync Canvas (Reload from server)"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </>
      )}
    </div>
  );
}
