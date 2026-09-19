"use-client"

type ToolbarProps = {
    color: string;
    onColorChange: (color: string) => void;
    strokeWidth: number;
    onStrokeWidthChange: (width: number) => void;
    tool: 'pen' | 'eraser';
    onToolChange: (tool: 'pen' | 'eraser') => void;
    onClear: () => void;
    onSave: () => void;
    onExport: () => void;
};

export default function Toolbar({
    color,
    onColorChange,
    strokeWidth,
    onStrokeWidthChange,
    tool,
    onToolChange,
    onClear,
    onSave,
    onExport,
}: ToolbarProps){
    return (
        <div className="flex flex-wrap items-center gap-4 px-6 py-3 bg-white border-b border-gray-200">
            <input 
                type = "color" 
                value={color} 
                onChange={(e) => onColorChange(e.target.value)}
                className="h-8 w-8 rounded border border-gray-200 cursor-pointer"
                />
            <input
                type="range"
                min={1}
                max={20}
                value={strokeWidth}
                onChange={(e)=> onStrokeWidthChange(Number(e.target.value))}
                className="accent-[#4C5FD5]"
            />
            <div className="flex gap-2">
                <button 
                    onClick={() => onToolChange('pen')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tool === "pen" ? "bg-[#4C5FD5] text-white" : "text-[#1C1C1C] hover:bg-gray-100"}`}
                    > Pen </button>
                <button 
                    onClick={() => onToolChange('eraser')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tool === "eraser" ? "bg-[#4C5FD5] text-white" : "text-[#1C1C1C] hover:bg-gray-100"}`}
                    > Eraser </button>
            </div>
            <button
                className="px-3 py-1.5 rounded-md text-sm font-medium text-[#1C1C1C] hover:bg-gray-100"
                onClick={onClear}> Clear </button>
            <button
                className="px-3 py-1.5 rounded-md text-sm font-medium text-[#1C1C1C] hover:bg-gray-100"
                onClick={onExport}> Export </button>
            <button
                className="ml-auto px-4 py-1.5 rounded-md text-sm font-medium bg-[#4C5FD5] text-white hover:opacity-90" 
                onClick={onSave}> Save </button>
        </div>
    );
}