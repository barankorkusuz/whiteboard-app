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
}: ToolbarProps){
    return (
        <div>
            <input type = "color" value={color} onChange={(e) => onColorChange(e.target.value)}/>
            <input
                type="range"
                min={1}
                max={20}
                value={strokeWidth}
                onChange={(e)=> onStrokeWidthChange(Number(e.target.value))}    
            />
            <button onClick={() => onToolChange('pen')}> Pen </button>
            <button onClick={() => onToolChange('eraser')}> Eraser </button>
            <button onClick={onClear}> Clear </button>
            <button onClick={onSave}> Save </button>
        </div>
    );
}