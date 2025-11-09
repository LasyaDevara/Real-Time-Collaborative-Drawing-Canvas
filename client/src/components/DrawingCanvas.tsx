import { useRef, useEffect, useState, useCallback } from 'react';

export type DrawingTool = 'brush' | 'eraser' | 'fill';

export interface DrawAction {
  tool: DrawingTool;
  color: string;
  size: number;
  points: { x: number; y: number }[];
  fillPoint?: { x: number; y: number }; // For fill tool
}

interface DrawingCanvasProps {
  tool: DrawingTool;
  color: string;
  brushSize: number;
  onDrawAction?: (action: DrawAction) => void;
  onCursorMove?: (x: number, y: number) => void;
  remoteActions?: DrawAction[];
  remoteCursors?: { id: string; x: number; y: number; color: string; username: string }[];
}

export default function DrawingCanvas({
  tool,
  color,
  brushSize,
  onDrawAction,
  onCursorMove,
  remoteActions = [],
  remoteCursors = [],
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAction, setCurrentAction] = useState<DrawAction | null>(null);
  const redrawAnimationFrameRef = useRef<number | null>(null);
  const remoteActionsRef = useRef(remoteActions);

  // Flood fill algorithm - optimized for consistent results across all clients
  const floodFill = useCallback((ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string) => {
    const canvas = ctx.canvas;
    
    // Ensure consistent rendering settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Round coordinates to ensure consistent pixel access
    const x = Math.floor(startX);
    const y = Math.floor(startY);
    
    // Validate coordinates
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
      return;
    }
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Get the color at the start point (using rounded coordinates)
    const startIdx = (y * width + x) * 4;
    const startR = data[startIdx];
    const startG = data[startIdx + 1];
    const startB = data[startIdx + 2];
    const startA = data[startIdx + 3];

    // Parse fill color
    const fillR = parseInt(fillColor.slice(1, 3), 16);
    const fillG = parseInt(fillColor.slice(3, 5), 16);
    const fillB = parseInt(fillColor.slice(5, 7), 16);

    // Check if we're already filling with the same color
    if (startR === fillR && startG === fillG && startB === fillB && startA === 255) {
      return;
    }

    // Stack-based flood fill with consistent coordinate rounding
    const stack: number[] = [y, x]; // Push y, x
    const visited = new Set<string>();

    while (stack.length > 0) {
      const px = stack.pop()!;
      const py = stack.pop()!;
      const key = `${px},${py}`;

      if (px < 0 || px >= width || py < 0 || py >= height || visited.has(key)) {
        continue;
      }

      const idx = (py * width + px) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // Check if pixel matches the target color (with tolerance for anti-aliasing)
      // Increased tolerance slightly for better consistency across different rendering contexts
      const colorMatch = Math.abs(r - startR) < 15 && 
                        Math.abs(g - startG) < 15 && 
                        Math.abs(b - startB) < 15 &&
                        Math.abs(a - startA) < 15;

      if (!colorMatch) {
        continue;
      }

      visited.add(key);

      // Fill the pixel with exact color values
      data[idx] = fillR;
      data[idx + 1] = fillG;
      data[idx + 2] = fillB;
      data[idx + 3] = 255;

      // Add neighbors to stack (push y, x order)
      stack.push(py + 1, px);
      stack.push(py - 1, px);
      stack.push(py, px + 1);
      stack.push(py, px - 1);
    }

    // Put the modified image data back
    ctx.putImageData(imageData, 0, 0);
  }, []);

  const redrawCanvas = useCallback(() => {
    // Cancel any pending animation frame
    if (redrawAnimationFrameRef.current !== null) {
      cancelAnimationFrame(redrawAnimationFrameRef.current);
    }

    // Use requestAnimationFrame for smooth, optimized rendering
    redrawAnimationFrameRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Optimize canvas rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Clear canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // CRITICAL: Use the ref to get the latest actions, ensuring we always have the most up-to-date data
      const actionsToRender = remoteActionsRef.current;
      console.log('Redrawing canvas with', actionsToRender.length, 'actions');

      // CRITICAL: Ensure we always render actions, even if only one user is in the room
      // This ensures single-user drawings and first actions are always visible
      if (actionsToRender.length === 0) {
        console.log('No actions to render - canvas will be blank');
      } else {
        console.log('Rendering actions:', actionsToRender.map(a => ({
          tool: a.tool,
          points: a.points?.length || 0,
          fillPoint: a.fillPoint ? 'yes' : 'no',
          color: a.color
        })));
      }

      // CRITICAL: Apply actions in chronological order to maintain correct canvas state
      // Each action must be applied in the order it occurred, so fills work on the correct state
      // CRITICAL: Ensure first action is always rendered correctly
      actionsToRender.forEach((action, index) => {
        try {
          if (action.tool === 'fill' && action.fillPoint) {
            // Fill actions: apply immediately to current canvas state
            // The canvas state at this point includes all previous actions
            console.log(`Rendering fill action ${index} at (${action.fillPoint.x}, ${action.fillPoint.y})`);
            floodFill(ctx, action.fillPoint.x, action.fillPoint.y, action.color);
          } else if (action.points && action.points.length >= 1) {
            // Brush/eraser actions: draw strokes
            // Handle single point as a dot, multiple points as a stroke
            // CRITICAL: First action might have only 1 point, ensure it's rendered
            console.log(`Rendering ${action.tool} action ${index} with ${action.points.length} points`);
            ctx.beginPath();
            ctx.strokeStyle = action.tool === 'eraser' ? '#ffffff' : action.color;
            ctx.fillStyle = action.tool === 'eraser' ? '#ffffff' : action.color;
            ctx.lineWidth = action.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalCompositeOperation = action.tool === 'eraser' ? 'destination-out' : 'source-over';

            if (action.points.length === 1) {
              // Draw a dot for single point actions (CRITICAL for first action)
              const point = action.points[0];
              ctx.beginPath();
              ctx.arc(point.x, point.y, action.size / 2, 0, Math.PI * 2);
              ctx.fill();
              console.log(`Drew dot at (${point.x}, ${point.y}) with size ${action.size / 2}`);
            } else {
              // Draw stroke for multiple points
              ctx.moveTo(action.points[0].x, action.points[0].y);
              action.points.forEach((point) => {
                ctx.lineTo(point.x, point.y);
              });
              ctx.stroke();
              console.log(`Drew stroke with ${action.points.length} points`);
            }
          } else {
            console.warn(`Action ${index} has no valid points or fillPoint:`, action);
          }
        } catch (error) {
          console.error(`Error rendering action ${index}:`, error, action);
        }
      });

      redrawAnimationFrameRef.current = null;
    });
  }, [floodFill]); // Remove remoteActions dependency since we use the ref

  // CRITICAL: Force a redraw immediately when remoteActions changes
  // This ensures the creator sees their own drawings immediately
  // This must be after redrawCanvas is defined
  useEffect(() => {
    // Update ref immediately
    remoteActionsRef.current = remoteActions;
    console.log('Updated remoteActionsRef with', remoteActions.length, 'actions');
    // Force a redraw immediately when actions change
    // This ensures the creator sees their own drawings immediately
    requestAnimationFrame(() => {
      redrawCanvas();
    });
  }, [remoteActions, redrawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let resizeTimeout: NodeJS.Timeout;
    let animationFrameId: number | null = null;

    const resizeCanvas = () => {
      // Cancel any pending resize
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      // Debounce resize to avoid excessive redraws
      resizeTimeout = setTimeout(() => {
        animationFrameId = requestAnimationFrame(() => {
          const rect = canvas.getBoundingClientRect();
          const newWidth = rect.width;
          const newHeight = rect.height;
          
          // Only resize if dimensions actually changed
          if (canvas.width !== newWidth || canvas.height !== newHeight) {
            canvas.width = newWidth;
            canvas.height = newHeight;
            redrawCanvas();
          }
        });
      }, 100); // 100ms debounce
    };

    // Initial resize
    resizeCanvas();

    // Use ResizeObserver for better performance and accuracy
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === canvas) {
          resizeCanvas();
        }
      }
    });

    resizeObserver.observe(canvas);
    
    // Also listen to window resize as fallback
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [redrawCanvas]);

  useEffect(() => {
    // Redraw canvas whenever remoteActions (which is actually allActions) changes
    // This ensures the canvas updates immediately when localActions or remoteActions change
    // CRITICAL: Always redraw when actions change, even if currently drawing
    // The real-time drawing during mouse move is separate from the persistent rendering
    // Use requestAnimationFrame to ensure we redraw after React has updated the props
    // This is critical for single-user scenarios where localActions must be rendered
    // CRITICAL: Use double requestAnimationFrame to ensure props are fully updated
    // CRITICAL: This must trigger whenever remoteActions changes to ensure user sees their own drawing
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          redrawCanvas();
        });
      });
    }, 0);
    
    // Cleanup: cancel animation frame on unmount
    return () => {
      clearTimeout(timeoutId);
      if (redrawAnimationFrameRef.current !== null) {
        cancelAnimationFrame(redrawAnimationFrameRef.current);
      }
    };
  }, [redrawCanvas, remoteActions, isDrawing]); // Explicitly depend on remoteActions and isDrawing
  
  // Additional effect to ensure canvas redraws when actions are added
  // This is a safety net to ensure single-user drawings and first actions are always visible
  // CRITICAL: This triggers whenever the action count changes
  useEffect(() => {
    // Force a redraw when actions are added, ensuring single-user drawings are visible
    // This triggers even if remoteActions.length is 0 (single user with only localActions)
    // CRITICAL: Use double requestAnimationFrame to ensure the first action is rendered
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          redrawCanvas();
        });
      });
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [remoteActions.length, redrawCanvas]); // Trigger on action count change

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getCoordinates(e);
    
    // Fill tool works on click, not drag
    if (tool === 'fill') {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      // CRITICAL: Perform fill immediately on canvas (local rendering)
      // This ensures the creator sees their fill action immediately
      floodFill(ctx, point.x, point.y, color);

      // Create and send fill action with rounded coordinates for consistency
      const action: DrawAction = {
        tool: 'fill',
        color,
        size: brushSize,
        points: [],
        fillPoint: {
          x: Math.floor(point.x),
          y: Math.floor(point.y),
        },
      };
      // CRITICAL: Send action to parent which will add to localActions and emit to server
      // This ensures the creator sees their fill immediately and it persists
      onDrawAction?.(action);
      return;
    }

    // Brush and eraser tools work on drag
    const action: DrawAction = {
      tool,
      color,
      size: brushSize,
      points: [point],
    };
    setCurrentAction(action);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getCoordinates(e);
    
    onCursorMove?.(point.x, point.y);
    
    // Fill tool doesn't use draw
    if (tool === 'fill') return;
    
    if (!isDrawing || !currentAction) return;

    const updatedAction = {
      ...currentAction,
      points: [...currentAction.points, point],
    };
    setCurrentAction(updatedAction);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';

    const prevPoint = currentAction.points[currentAction.points.length - 1];
    ctx.beginPath();
    ctx.moveTo(prevPoint.x, prevPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (tool === 'fill') return; // Fill doesn't use stopDrawing
    
    if (currentAction && currentAction.points.length > 0) {
      // CRITICAL: Send the action immediately
      // This will add it to localActions in the parent, which will trigger a redraw
      // The action is already visible from real-time drawing, but we need to persist it
      onDrawAction?.(currentAction);
    }
    setIsDrawing(false);
    setCurrentAction(null);
    
    // CRITICAL: Force a redraw after a short delay to ensure localActions are included
    // This ensures the creator's drawing persists immediately after they finish drawing
    setTimeout(() => {
      redrawCanvas();
    }, 50);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full bg-white dark:bg-gray-900 touch-none ${
          tool === 'fill' ? 'cursor-pointer' : 'cursor-crosshair'
        }`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        data-testid="drawing-canvas"
      />
      {remoteCursors.map((cursor) => (
        <div
          key={cursor.id}
          className="absolute pointer-events-none transition-all duration-100 ease-linear"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: 'translate(-2px, -2px)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M0 0L0 12L4 8L6.5 14L8.5 13L6 7L11 7L0 0Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          <div
            className="absolute left-4 top-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
            style={{
              backgroundColor: cursor.color,
              color: 'white',
            }}
          >
            {cursor.username}
          </div>
        </div>
      ))}
    </div>
  );
}

export function clearCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function exportCanvasAsPNG(canvasRef: React.RefObject<HTMLCanvasElement>, filename = 'drawing.png') {
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
