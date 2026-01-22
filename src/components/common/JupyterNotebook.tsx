"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Play, 
  Code, 
  FileText, 
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  MoreVertical,
  File,
  FolderOpen,
  Save,
  Download,
  X,
  Maximize,
  Minimize,
  ArrowUp,
  ArrowDown,
  Merge,
  Split,
  FileDown,
  FileText as FileTextIcon,
  Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { cn } from "@/lib/utils";

export type CellType = "code" | "markdown";

export interface NotebookCell {
  id: string;
  type: CellType;
  content: string;
  output?: string;
  isExecuting?: boolean;
  isCollapsed?: boolean;
}

interface JupyterNotebookProps {
  initialCells?: NotebookCell[];
  onCellsChange?: (cells: NotebookCell[]) => void;
  onClose?: () => void;
  className?: string;
}

export default function JupyterNotebook({
  initialCells = [],
  onCellsChange,
  onClose,
  className,
}: JupyterNotebookProps) {
  const [cells, setCells] = useState<NotebookCell[]>(
    initialCells.length > 0 
      ? initialCells 
      : [{ id: generateId(), type: "code", content: "", output: undefined }]
  );
  const [focusedCellId, setFocusedCellId] = useState<string | null>(cells[0]?.id || null);
  const [copiedCellId, setCopiedCellId] = useState<string | null>(null);
  const [editingMarkdownId, setEditingMarkdownId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notebookName, setNotebookName] = useState("Untitled");
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea based on content
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const minHeight = 40; // Minimum height
    const maxHeight = 200; // Maximum height - will scroll after this
    textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
  };

  useEffect(() => {
    // Auto-resize all textareas when content changes
    Object.values(textareaRefs.current).forEach((textarea) => {
      if (textarea) {
        autoResizeTextarea(textarea);
      }
    });
  }, [cells]);

  useEffect(() => {
    onCellsChange?.(cells);
  }, [cells, onCellsChange]);

  function generateId(): string {
    return `cell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  const addCell = (type: CellType, afterIndex?: number) => {
    const newCell: NotebookCell = {
      id: generateId(),
      type,
      content: "",
      output: undefined,
    };

    setCells((prev) => {
      if (afterIndex !== undefined) {
        const newCells = [...prev];
        newCells.splice(afterIndex + 1, 0, newCell);
        return newCells;
      }
      return [...prev, newCell];
    });

    setFocusedCellId(newCell.id);
    setTimeout(() => {
      textareaRefs.current[newCell.id]?.focus();
    }, 0);
  };

  const deleteCell = (id: string) => {
    setCells((prev) => {
      const filtered = prev.filter((cell) => cell.id !== id);
      if (filtered.length === 0) {
        return [{ id: generateId(), type: "code", content: "" }];
      }
      return filtered;
    });
  };

  const updateCellContent = (id: string, content: string) => {
    setCells((prev) =>
      prev.map((cell) =>
        cell.id === id ? { ...cell, content } : cell
      )
    );
  };

  const changeCellType = (id: string, type: CellType) => {
    setCells((prev) =>
      prev.map((cell) =>
        cell.id === id ? { ...cell, type } : cell
      )
    );
  };

  const toggleCellCollapse = (id: string) => {
    setCells((prev) =>
      prev.map((cell) =>
        cell.id === id ? { ...cell, isCollapsed: !cell.isCollapsed } : cell
      )
    );
  };

  const executeCell = async (id: string) => {
    const cell = cells.find((c) => c.id === id);
    if (!cell || cell.type === "markdown") return;

    setCells((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isExecuting: true, output: undefined } : c
      )
    );

    // Simulate code execution
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simple code execution simulation
    let output = "";
    try {
      const code = cell.content.trim();
      
      if (!code) {
        output = ""; // Empty code, no output
      } else if (code.includes("print(")) {
        // Handle print statements
        const match = code.match(/print\(['"](.*?)['"]\)/);
        if (match) {
          output = match[1];
        } else {
          // Try to extract content from print() with variables
          const printMatch = code.match(/print\((.*?)\)/);
          if (printMatch) {
            output = printMatch[1].replace(/['"]/g, ""); // Remove quotes
          } else {
            output = code; // Fallback to showing the code
          }
        }
      } else if (code.includes("import ")) {
        // Import statements - no output
        output = "";
      } else if (code.includes("def ") || code.includes("class ")) {
        // Function or class definition - no output
        output = "";
      } else if (code.includes("=") && (code.includes("return") || code.split("=").length > 1 && !code.includes("=="))) {
        // Variable assignment or function with return - no output unless it's an expression
        const lines = code.split("\n");
        const lastLine = lines[lines.length - 1].trim();
        // If last line is just a variable or expression, evaluate it
        if (lastLine && !lastLine.includes("=") && !lastLine.startsWith("#")) {
          if (lastLine.includes("(") && lastLine.includes(")")) {
            const funcMatch = lastLine.match(/(\w+)\(['"](.*?)['"]\)/);
            if (funcMatch) {
              output = `'Hello, ${funcMatch[2]}!'`;
            } else {
              output = lastLine; // Show the expression
            }
          } else {
            output = lastLine; // Show the expression
          }
        } else {
          output = ""; // Assignment, no output
        }
      } else if (code.includes("time.sleep")) {
        // Sleep statement - no output
        output = "";
      } else {
        // Plain text or simple expressions - display as output
        const lines = code.split("\n");
        const lastLine = lines[lines.length - 1].trim();
        
        // If it's plain text (no code syntax), just display it
        if (!lastLine.includes("(") && !lastLine.includes(")") && 
            !lastLine.includes("=") && !lastLine.includes("import") &&
            !lastLine.includes("def") && !lastLine.includes("class") &&
            !lastLine.startsWith("#")) {
          output = code; // Display the plain text
        } else if (lastLine.includes("(") && lastLine.includes(")")) {
          // Function call
          const funcMatch = lastLine.match(/(\w+)\(['"](.*?)['"]\)/);
          if (funcMatch) {
            output = `'Hello, ${funcMatch[2]}!'`;
          } else {
            output = lastLine; // Show the function call result
          }
        } else {
          // Default: show the content
          output = code;
        }
      }
    } catch (error) {
      output = "Error executing code";
    }

    setCells((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isExecuting: false,
              output: output || undefined,
            }
          : c
      )
    );
  };

  const duplicateCell = (id: string) => {
    const cell = cells.find((c) => c.id === id);
    if (!cell) return;

    const newCell: NotebookCell = {
      id: generateId(),
      type: cell.type,
      content: cell.content,
      output: undefined,
    };

    const index = cells.findIndex((c) => c.id === id);
    setCells((prev) => {
      const newCells = [...prev];
      newCells.splice(index + 1, 0, newCell);
      return newCells;
    });
  };

  const copyCellContent = async (id: string) => {
    const cell = cells.find((c) => c.id === id);
    if (cell) {
      await navigator.clipboard.writeText(cell.content);
      setCopiedCellId(id);
      setTimeout(() => setCopiedCellId(null), 2000);
    }
  };

  // File Operations
  const handleNewNotebook = () => {
    setCells([{ id: generateId(), type: "code", content: "", output: undefined }]);
    setNotebookName("Untitled");
    setFocusedCellId(null);
  };

  const handleOpenNotebook = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const notebook = JSON.parse(content);
        
        if (notebook.cells && Array.isArray(notebook.cells)) {
          const loadedCells: NotebookCell[] = notebook.cells.map((cell: any, idx: number) => ({
            id: generateId(),
            type: cell.cell_type === "markdown" ? "markdown" : "code",
            content: cell.source ? (Array.isArray(cell.source) ? cell.source.join("") : cell.source) : "",
            output: cell.outputs?.[0]?.text ? (Array.isArray(cell.outputs[0].text) ? cell.outputs[0].text.join("") : cell.outputs[0].text) : undefined,
            isExecuting: false,
            isCollapsed: false,
          }));
          setCells(loadedCells);
          setNotebookName(file.name.replace(".ipynb", ""));
        }
      } catch (error) {
        console.error("Error loading notebook:", error);
        alert("Failed to load notebook file");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
  };

  const handleSave = () => {
    const notebook = {
      cells: cells.map((cell) => ({
        cell_type: cell.type,
        source: cell.content.split("\n"),
        outputs: cell.output ? [{ text: cell.output.split("\n") }] : [],
      })),
      metadata: {},
      nbformat: 4,
      nbformat_minor: 4,
    };

    const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${notebookName}.ipynb`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveAs = () => {
    const name = prompt("Enter notebook name:", notebookName);
    if (name) {
      setNotebookName(name);
      handleSave();
    }
  };

  const handleRename = () => {
    const newName = prompt("Enter new notebook name:", notebookName);
    if (newName && newName.trim() !== "") {
      setNotebookName(newName.trim());
    }
  };

  const handleDownload = () => {
    handleSave();
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Export Operations
  const handleExportHTML = () => {
    let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${notebookName}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .cell { margin: 20px 0; padding: 10px; border-left: 4px solid #4285f4; }
    .input { background: #f5f5f5; padding: 10px; margin: 5px 0; }
    .output { background: #000; color: #0f0; padding: 10px; margin: 5px 0; font-family: monospace; }
    pre { margin: 0; }
  </style>
</head>
<body>
  <h1>${notebookName}</h1>
`;

    cells.forEach((cell, index) => {
      htmlContent += `  <div class="cell">
    <div class="input"><strong>In [${index + 1}]:</strong><pre>${cell.content}</pre></div>`;
      if (cell.output) {
        htmlContent += `    <div class="output"><strong>Out[${index + 1}]:</strong><pre>${cell.output}</pre></div>`;
      }
      htmlContent += `  </div>\n`;
    });

    htmlContent += `</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${notebookName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // For PDF, we'll use the browser's print functionality
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${notebookName}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .cell { margin: 20px 0; page-break-inside: avoid; }
    .input { background: #f5f5f5; padding: 10px; margin: 5px 0; }
    .output { background: #000; color: #0f0; padding: 10px; margin: 5px 0; font-family: monospace; }
    pre { margin: 0; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${notebookName}</h1>
`;

    cells.forEach((cell, index) => {
      htmlContent += `  <div class="cell">
    <div class="input"><strong>In [${index + 1}]:</strong><pre>${cell.content}</pre></div>`;
      if (cell.output) {
        htmlContent += `    <div class="output"><strong>Out[${index + 1}]:</strong><pre>${cell.output}</pre></div>`;
      }
      htmlContent += `  </div>\n`;
    });

    htmlContent += `</body>
</html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // View Operations
  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Operations
  const moveCellUp = (id: string) => {
    const index = cells.findIndex((c) => c.id === id);
    if (index > 0) {
      setCells((prev) => {
        const newCells = [...prev];
        [newCells[index - 1], newCells[index]] = [newCells[index], newCells[index - 1]];
        return newCells;
      });
    }
  };

  const moveCellDown = (id: string) => {
    const index = cells.findIndex((c) => c.id === id);
    if (index < cells.length - 1) {
      setCells((prev) => {
        const newCells = [...prev];
        [newCells[index], newCells[index + 1]] = [newCells[index + 1], newCells[index]];
        return newCells;
      });
    }
  };

  const mergeCells = (id: string) => {
    const index = cells.findIndex((c) => c.id === id);
    if (index < cells.length - 1) {
      const currentCell = cells[index];
      const nextCell = cells[index + 1];
      const mergedContent = currentCell.content + "\n" + nextCell.content;
      
      setCells((prev) => {
        const newCells = [...prev];
        newCells[index] = { ...currentCell, content: mergedContent };
        newCells.splice(index + 1, 1);
        return newCells;
      });
    }
  };

  const splitCell = (id: string) => {
    const cell = cells.find((c) => c.id === id);
    if (!cell) return;

    const index = cells.findIndex((c) => c.id === id);
    const lines = cell.content.split("\n");
    const cursorPos = textareaRefs.current[id]?.selectionStart || 0;
    const textBeforeCursor = cell.content.substring(0, cursorPos);
    const textAfterCursor = cell.content.substring(cursorPos);
    const linesBefore = textBeforeCursor.split("\n");
    const splitIndex = linesBefore.length - 1;

    const firstPart = lines.slice(0, splitIndex).join("\n");
    const secondPart = lines.slice(splitIndex).join("\n");

    setCells((prev) => {
      const newCells = [...prev];
      newCells[index] = { ...cell, content: firstPart };
      newCells.splice(index + 1, 0, {
        id: generateId(),
        type: cell.type,
        content: secondPart,
        output: undefined,
      });
      return newCells;
    });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    cellId: string,
    index: number
  ) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      executeCell(cellId);
    } else if (e.key === "Enter" && e.shiftKey) {
      // Allow default behavior for Shift+Enter
      return;
    } else if (e.key === "ArrowUp" && e.currentTarget.selectionStart === 0) {
      if (index > 0) {
        e.preventDefault();
        setFocusedCellId(cells[index - 1].id);
        setTimeout(() => {
          const prevTextarea = textareaRefs.current[cells[index - 1].id];
          if (prevTextarea) {
            prevTextarea.focus();
            prevTextarea.setSelectionRange(prevTextarea.value.length, prevTextarea.value.length);
          }
        }, 0);
      }
    } else if (
      e.key === "ArrowDown" &&
      e.currentTarget.selectionStart === e.currentTarget.value.length
    ) {
      if (index < cells.length - 1) {
        e.preventDefault();
        setFocusedCellId(cells[index + 1].id);
        setTimeout(() => {
          textareaRefs.current[cells[index + 1].id]?.focus();
        }, 0);
      }
    }
  };

  return (
    <div className={cn("w-full bg-white flex flex-col", isFullscreen && "fixed inset-0 z-50", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".ipynb,application/json"
        className="hidden"
        onChange={handleFileInputChange}
      />
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="max-w-full mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <h1 className="text-sm font-medium text-slate-700">{notebookName}</h1>
              
              {/* Menu Bar */}
              <Menubar className="border-0 shadow-none p-0 h-auto">
                <MenubarMenu>
                  <MenubarTrigger className="text-xs px-2 py-1">File</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem onClick={handleNewNotebook}>
                      <File className="size-4 mr-2" />
                      New Notebook
                    </MenubarItem>
                    <MenubarItem onClick={handleOpenNotebook}>
                      <FolderOpen className="size-4 mr-2" />
                      Open
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={handleSave}>
                      <Save className="size-4 mr-2" />
                      Save
                    </MenubarItem>
                    <MenubarItem onClick={handleSaveAs}>
                      <Save className="size-4 mr-2" />
                      Save As
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={handleRename}>
                      <Edit2 className="size-4 mr-2" />
                      Rename
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={handleDownload}>
                      <Download className="size-4 mr-2" />
                      Download (.ipynb)
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={handleClose}>
                      <X className="size-4 mr-2" />
                      Close
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>

                <MenubarMenu>
                  <MenubarTrigger className="text-xs px-2 py-1">Export</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem onClick={handleExportHTML}>
                      <FileTextIcon className="size-4 mr-2" />
                      Export to HTML
                    </MenubarItem>
                    <MenubarItem onClick={handleExportPDF}>
                      <FileDown className="size-4 mr-2" />
                      Export to PDF
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>

                <MenubarMenu>
                  <MenubarTrigger className="text-xs px-2 py-1">View</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem onClick={handleFullscreen}>
                      {isFullscreen ? (
                        <>
                          <Minimize className="size-4 mr-2" />
                          Exit Full Screen
                        </>
                      ) : (
                        <>
                          <Maximize className="size-4 mr-2" />
                          Full Screen
                        </>
                      )}
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>

                <MenubarMenu>
                  <MenubarTrigger className="text-xs px-2 py-1">Operations</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem 
                      onClick={() => focusedCellId && moveCellUp(focusedCellId)}
                      disabled={!focusedCellId || cells.findIndex(c => c.id === focusedCellId) === 0}
                    >
                      <ArrowUp className="size-4 mr-2" />
                      Move Cell Up
                    </MenubarItem>
                    <MenubarItem 
                      onClick={() => focusedCellId && moveCellDown(focusedCellId)}
                      disabled={!focusedCellId || cells.findIndex(c => c.id === focusedCellId) === cells.length - 1}
                    >
                      <ArrowDown className="size-4 mr-2" />
                      Move Cell Down
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem 
                      onClick={() => focusedCellId && mergeCells(focusedCellId)}
                      disabled={!focusedCellId || cells.findIndex(c => c.id === focusedCellId) === cells.length - 1}
                    >
                      <Merge className="size-4 mr-2" />
                      Merge Cells
                    </MenubarItem>
                    <MenubarItem 
                      onClick={() => focusedCellId && splitCell(focusedCellId)}
                      disabled={!focusedCellId || !cells.find(c => c.id === focusedCellId)?.content}
                    >
                      <Split className="size-4 mr-2" />
                      Split Cell
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addCell("markdown")}
                className="border-slate-200 h-7 px-2 text-xs"
              >
                <FileText className="size-3 mr-1.5" />
                Markdown
              </Button>
              <Button
                onClick={() => addCell("code")}
                size="sm"
                className="bg-slate-900 text-white hover:bg-slate-800 h-7 px-2 text-xs"
              >
                <Plus className="size-3 mr-1.5" />
                Code
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notebook Content - Scrollable */}
      <div className="flex-1 overflow-y-auto max-h-[600px] min-h-0 scrollbar-hide">
        <div className="px-4 py-2 space-y-0">
          {cells.map((cell, index) => {
            const cellNumber = index + 1;
            const hasOutput = cell.output && cell.output.trim() !== "";
            
            return (
              <div
                key={cell.id}
                className={cn(
                  "relative bg-white border-l-4 transition-all",
                  focusedCellId === cell.id 
                    ? "border-l-blue-500 bg-blue-50/30" 
                    : "border-l-transparent",
                  "hover:bg-slate-50/50"
                )}
              >
                {/* Cell Content */}
                {!cell.isCollapsed && (
                  <div className="py-2">
                    {cell.type === "markdown" ? (
                      <div className="px-4">
                        {editingMarkdownId === cell.id ? (
                          <Textarea
                            ref={(el) => {
                              if (el) {
                                textareaRefs.current[cell.id] = el;
                                autoResizeTextarea(el);
                              }
                            }}
                            value={cell.content}
                            onChange={(e) => {
                              updateCellContent(cell.id, e.target.value);
                              autoResizeTextarea(e.target);
                            }}
                            onBlur={() => setEditingMarkdownId(null)}
                            onFocus={() => {
                              setFocusedCellId(cell.id);
                              setEditingMarkdownId(cell.id);
                            }}
                            onKeyDown={(e) => {
                              handleKeyDown(e, cell.id, index);
                              if (e.key === "Escape") {
                                setEditingMarkdownId(null);
                              }
                            }}
                            placeholder="Enter markdown content..."
                            className="min-h-[40px] max-h-[300px] font-mono text-sm border-0 focus-visible:ring-0 bg-transparent resize-none w-full scrollbar-hide"
                            style={{ height: "auto", overflowY: "auto" }}
                          />
                        ) : (
                          <div
                            onClick={() => setEditingMarkdownId(cell.id)}
                            className="cursor-text min-h-[40px] px-2 py-1.5 rounded hover:bg-slate-50"
                          >
                            <div className="text-xs text-slate-500 font-mono mb-1">In [{cellNumber}]:</div>
                            {cell.content ? (
                              <div className="text-sm prose prose-sm max-w-none">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: cell.content
                                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                                      .replace(/`(.*?)`/g, "<code class='bg-slate-200 px-1 py-0.5 rounded text-xs'>$1</code>")
                                      .replace(/\n/g, "<br />"),
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="text-sm text-slate-400 italic">Click to edit markdown...</div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-4">
                        {/* Input Section */}
                        <div className="flex items-start gap-2">
                          <div className="text-xs text-slate-500 font-mono pt-1.5 min-w-[60px]">
                            In [{cellNumber}]:
                          </div>
                          <div className="flex-1">
                            <Textarea
                              ref={(el) => {
                                if (el) {
                                  textareaRefs.current[cell.id] = el;
                                  autoResizeTextarea(el);
                                }
                              }}
                              value={cell.content}
                              onChange={(e) => {
                                updateCellContent(cell.id, e.target.value);
                                autoResizeTextarea(e.target);
                              }}
                              onFocus={() => setFocusedCellId(cell.id)}
                              onKeyDown={(e) => handleKeyDown(e, cell.id, index)}
                              placeholder="Enter code here... (Press Ctrl/Cmd + Enter to run)"
                              className="min-h-[40px] max-h-[300px] font-mono text-sm border-0 focus-visible:ring-0 bg-slate-50 resize-none w-full scrollbar-hide"
                              style={{ height: "auto", overflowY: "auto" }}
                            />
                            {cell.isExecuting && (
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <div className="size-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                                <span>Executing...</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-start gap-1 pt-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-slate-900"
                              onClick={() => executeCell(cell.id)}
                              disabled={cell.isExecuting}
                              title="Run cell (Ctrl+Enter)"
                            >
                              <Play className="size-3.5" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-slate-400 hover:text-slate-900"
                                >
                                  <MoreVertical className="size-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 text-xs">
                                <DropdownMenuItem onClick={() => copyCellContent(cell.id)}>
                                  {copiedCellId === cell.id ? (
                                    <>
                                      <Check className="size-4 mr-2" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="size-4 mr-2" />
                                      Copy Cell
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => duplicateCell(cell.id)}>
                                  <Plus className="size-4 mr-2" />
                                  Duplicate Cell
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => addCell("code", index)}
                                  className="text-slate-600"
                                >
                                  <Plus className="size-4 mr-2" />
                                  Insert Cell Below
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteCell(cell.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="size-4 mr-2" />
                                  Delete Cell
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Output Section */}
                        {hasOutput && (
                          <div className="flex items-start gap-2 mt-2">
                            <div className="text-xs text-slate-500 font-mono pt-1.5 min-w-[60px]">
                              Out[{cellNumber}]:
                            </div>
                            <div className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                              <pre className="font-mono text-sm whitespace-pre-wrap text-slate-700">
                                {cell.output}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

