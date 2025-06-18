'use client';

import { useEffect, useRef } from 'react';
import { Canvas as FabricCanvas, PencilBrush, Rect, Circle, TEvent } from 'fabric';

export type DrawToolType = 'pencil' | 'eraser';
export type ShapeToolType = 'rectangle' | 'circle';

export type Tool = 
  | { type: 'draw'; tool: DrawToolType }
  | { type: 'shape'; shape: ShapeToolType };

interface CanvasProps {
  activeTool: Tool;
  clearCounter: number;
  undoCounter: number;
  redoCounter: number;
  onHistoryUpdate: (canUndo: boolean, canRedo: boolean) => void;
  color: string;
  brushSize: number;
}

const Canvas = ({ 
  activeTool, 
  clearCounter, 
  undoCounter, 
  redoCounter, 
  onHistoryUpdate,
  color,
  brushSize
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const history = useRef<string[]>([]);
  const historyIndex = useRef(-1);

  const saveState = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const state = JSON.stringify(canvas.toDatalessJSON());
    // If we are in the middle of history, new action clears the 'redo' history
    if (historyIndex.current < history.current.length - 1) {
      history.current = history.current.slice(0, historyIndex.current + 1);
    }
    history.current.push(state);
    historyIndex.current = history.current.length - 1;
    onHistoryUpdate(historyIndex.current > 0, false);
  };

  const loadState = (index: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !history.current[index]) return;
    const state = history.current[index];
    canvas.loadFromJSON(state, () => {
      canvas.renderAll();
      onHistoryUpdate(historyIndex.current > 0, historyIndex.current < history.current.length - 1);
    });
  };

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new FabricCanvas(canvasRef.current, {
        isDrawingMode: true,
        backgroundColor: '#f0f0f0',
      });
      fabricCanvasRef.current = canvas;

            canvas.on('object:added', saveState);
      canvas.on('object:modified', saveState);
      saveState(); // Save initial empty state

      const handleResize = () => {
        canvas.setWidth(window.innerWidth - 256);
        canvas.setHeight(window.innerHeight);
        canvas.renderAll();
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
                canvas.off('object:added', saveState);
        canvas.off('object:modified', saveState);
        canvas.dispose();
      };
    }
  }, []);

  // Handle tool change
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool.type === 'draw';

    if (activeTool.type === 'draw') {
      if (activeTool.tool === 'pencil') {
        const brush = new PencilBrush(canvas);
        brush.color = color;
        brush.width = brushSize;
        canvas.freeDrawingBrush = brush;
      } else if (activeTool.tool === 'eraser') {
        const eraser = new PencilBrush(canvas);
        eraser.color = (canvas.backgroundColor?.toString()) || '#f0f0f0';
        eraser.width = brushSize;
        canvas.freeDrawingBrush = eraser;
      }
    }
  }, [activeTool, color, brushSize]);

  // Handle shape drawing
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || activeTool.type !== 'shape') return;

    let shapeBeingDrawn: Rect | Circle | null = null;
    let originXY = { x: 0, y: 0 };

        const onMouseDown = (o: TEvent) => {
      const pointer = canvas.getPointer(o.e);
      originXY = { x: pointer.x, y: pointer.y };

      if (activeTool.shape === 'rectangle') {
        shapeBeingDrawn = new Rect({
          left: originXY.x,
          top: originXY.y,
          width: 0,
          height: 0,
          fill: color,
        });
      } else if (activeTool.shape === 'circle') {
        shapeBeingDrawn = new Circle({
          left: originXY.x,
          top: originXY.y,
          radius: 0,
          fill: color,
        });
      }

      if (shapeBeingDrawn) {
        canvas.add(shapeBeingDrawn);
      }
    };

        const onMouseMove = (o: TEvent) => {
      if (!shapeBeingDrawn) return;
      const pointer = canvas.getPointer(o.e);

      if (activeTool.shape === 'rectangle') {
        const rect = shapeBeingDrawn as Rect;
        rect.set({
          width: Math.abs(originXY.x - pointer.x),
          height: Math.abs(originXY.y - pointer.y),
          left: originXY.x > pointer.x ? pointer.x : originXY.x,
          top: originXY.y > pointer.y ? pointer.y : originXY.y,
        });
      } else if (activeTool.shape === 'circle') {
        const circle = shapeBeingDrawn as Circle;
        const radius = Math.sqrt(Math.pow(originXY.x - pointer.x, 2) + Math.pow(originXY.y - pointer.y, 2)) / 2;
        circle.set({ 
          radius,
          left: (originXY.x + pointer.x) / 2 - radius,
          top: (originXY.y + pointer.y) / 2 - radius,
        });
      }
      canvas.renderAll();
    };

    const onMouseUp = () => {
      if (shapeBeingDrawn) {
        shapeBeingDrawn.setCoords();
        saveState(); // This will trigger the object:added event, so we might not need it here.
      }
      shapeBeingDrawn = null;
    };

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);

    return () => {
      canvas.off('mouse:down', onMouseDown);
      canvas.off('mouse:move', onMouseMove);
      canvas.off('mouse:up', onMouseUp);
    };
  }, [activeTool, color]);

  // Handle actions
  useEffect(() => {
        if (clearCounter > 0 && fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      // saveState() is called by clear() implicitly via events if setup correctly
    }
  }, [clearCounter]);

  useEffect(() => {
    if (undoCounter > 0 && historyIndex.current > 0) {
      historyIndex.current--;
      loadState(historyIndex.current);
    }
  }, [undoCounter]);

  useEffect(() => {
    if (redoCounter > 0 && historyIndex.current < history.current.length - 1) {
      historyIndex.current++;
      loadState(historyIndex.current);
    }
  }, [redoCounter]);

  return <canvas ref={canvasRef} />;
};

export default Canvas;
