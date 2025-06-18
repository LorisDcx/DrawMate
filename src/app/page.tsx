'use client'; // This page is now interactive

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Toolbar, { ShapeTool } from '@/components/Toolbar';
import { Tool } from '@/components/Canvas';

// Dynamically import the Canvas component to ensure it's client-side only
const Canvas = dynamic(() => import('@/components/Canvas'), { ssr: false });

export default function Home() {
  const [activeTool, setActiveTool] = useState<Tool>({ type: 'draw', tool: 'pencil' });
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);

  const [clearCounter, setClearCounter] = useState(0);
  const [undoCounter, setUndoCounter] = useState(0);
  const [redoCounter, setRedoCounter] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

    const handleClear = () => setClearCounter((prev) => prev + 1);
  const handleUndo = () => setUndoCounter((prev) => prev + 1);
  const handleRedo = () => setRedoCounter((prev) => prev + 1);

  const handleShapeSelect = (shape: ShapeTool) => {
    setActiveTool({ type: 'shape', shape });
  };

  const handleHistoryUpdate = (canUndo: boolean, canRedo: boolean) => {
    setCanUndo(canUndo);
    setCanRedo(canRedo);
  };

  return (
    <main className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-gray-100 p-4 shadow-md z-10">
        <h1 className="text-2xl font-bold mb-6">DrawMate</h1>
                <Toolbar
          onPencilSelect={() => setActiveTool({ type: 'draw', tool: 'pencil' })}
          onEraserSelect={() => setActiveTool({ type: 'draw', tool: 'eraser' })}
          onShapeSelect={handleShapeSelect}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          canUndo={canUndo}
          canRedo={canRedo}
          color={color}
          onColorChange={setColor}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
        />
      </aside>
      <section className="flex-1 bg-gray-200">
        <Canvas
          activeTool={activeTool}
          clearCounter={clearCounter}
          undoCounter={undoCounter}
          redoCounter={redoCounter}
          onHistoryUpdate={handleHistoryUpdate}
          color={color}
          brushSize={brushSize}
        />
      </section>
    </main>
  );
}
