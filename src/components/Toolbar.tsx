'use client';

import React from 'react';

// Define the props for the Toolbar component
export type ShapeTool = 'rectangle' | 'circle';

interface ToolbarProps {
  onPencilSelect: () => void;
  onEraserSelect: () => void;
  onShapeSelect: (shape: ShapeTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  color: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onPencilSelect, 
  onEraserSelect, 
  onShapeSelect,
  onUndo, 
  onRedo, 
  onClear, 
  canUndo, 
  canRedo,
  color,
  onColorChange,
  brushSize,
  onBrushSizeChange
}) => {
  return (
    <div className="p-4">
      <h2 className="font-semibold mb-4">Outils</h2>
      <div className="space-y-2">
        <button
          onClick={onPencilSelect}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
        >
          Pinceau
        </button>
        <button
          onClick={onEraserSelect}
          className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors"
        >
          Gomme
        </button>
      </div>

      <h2 className="font-semibold mb-4 mt-6">Formes</h2>
      <div className="space-y-2">
        <button
          onClick={() => onShapeSelect('rectangle')}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
        >
          Rectangle
        </button>
        <button
          onClick={() => onShapeSelect('circle')}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
        >
          Cercle
        </button>
      </div>

      <h2 className="font-semibold mb-4 mt-6">Propriétés</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="color-picker" className="block text-sm font-medium text-gray-700">Couleur</label>
          <input 
            id="color-picker" 
            type="color" 
            value={color} 
            onChange={(e) => onColorChange(e.target.value)} 
            className="w-full h-10 p-1 border-gray-300 rounded-md cursor-pointer"
          />
        </div>
        <div>
          <label htmlFor="brush-size" className="block text-sm font-medium text-gray-700">Taille: {brushSize}</label>
          <input 
            id="brush-size" 
            type="range" 
            min="1" 
            max="50" 
            value={brushSize} 
            onChange={(e) => onBrushSizeChange(Number(e.target.value))} 
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <h2 className="font-semibold mb-4 mt-6">Actions</h2>
      <div className="flex space-x-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Annuler
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Rétablir
        </button>
      </div>

      <button
        onClick={onClear}
        className="w-full bg-red-500 text-white p-2 rounded mt-4 hover:bg-red-600 transition-colors"
      >
        Effacer
      </button>
    </div>
  );
};

export default Toolbar;
