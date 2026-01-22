import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Copy, Download, Eye, EyeOff, BookOpen, Sparkles, Send, Loader2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import JupyterNotebook, { type NotebookCell } from '@/components/common/JupyterNotebook';
import { useAI } from '@/hooks/useAI';

interface CodePreviewProps {
  codeSnippets: {
    [key: string]: string;
  };
  title?: string;
  language?: string;
  maxHeight?: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({
  codeSnippets,
  title = 'Code Preview',
  language = 'python',
  maxHeight = '300px'
}) => {
  const [visibleTabs, setVisibleTabs] = useState<Record<string, boolean>>({});
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [notebookCells, setNotebookCells] = useState<NotebookCell[]>([]);
  const [activeView, setActiveView] = useState<'notebook' | 'complete'>('complete');
  const [aiInputs, setAiInputs] = useState<Record<string, string>>({});
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [completeCodeCopied, setCompleteCodeCopied] = useState(false);
  const { chat, loading: aiGlobalLoading } = useAI();

  const toggleVisibility = (tabId: string) => {
    setVisibleTabs(prev => ({
      ...prev,
      [tabId]: !prev[tabId]
    }));
  };

  const copyToClipboard = async (code: string, tabId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedTab(tabId);
      setTimeout(() => setCopiedTab(null), 2000);
    } catch (err) {
      console.error('Failed to copy code to clipboard:', err);
    }
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const cleanAIResponse = (text: string): string => {
    if (!text) return '';
    
    return text
      // Remove horizontal rules
      .replace(/^---+$/gm, '')
      // Remove markdown code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code backticks
      .replace(/`([^`]+)`/g, '$1')
      // Remove bold markdown
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      // Remove italic markdown
      .replace(/\*([^*]+)\*/g, '$1')
      // Remove list markers
      .replace(/^\s*[-*]\s+/gm, '')
      // Remove numbered list markers
      .replace(/^\s*\d+\.\s+/gm, '')
      // Clean up multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim each line
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .trim();
  };

  const handleAIQuery = async (tab: string) => {
    const query = aiInputs[tab]?.trim();
    if (!query) return;

    const code = tab === 'complete' ? getCompleteCode() : codeSnippets[tab];
    setAiLoading(prev => ({ ...prev, [tab]: true }));
    setAiResponses(prev => ({ ...prev, [tab]: '' }));

    try {
      const response = await chat([
        {
          role: 'system',
          content: 'You are a helpful code assistant. Analyze the provided code and answer questions about it. Provide clear, concise answers without markdown formatting.'
        },
        {
          role: 'user',
          content: `Here is the code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nQuestion: ${query}`
        }
      ]);

      const cleanedResponse = cleanAIResponse(response.content);
      setAiResponses(prev => ({ ...prev, [tab]: cleanedResponse }));
      setAiInputs(prev => ({ ...prev, [tab]: '' }));
    } catch (error: any) {
      setAiResponses(prev => ({ ...prev, [tab]: `Error: ${error.message || 'Failed to get AI response'}` }));
    } finally {
      setAiLoading(prev => ({ ...prev, [tab]: false }));
    }
  };

  const handleAIInputChange = (tab: string, value: string) => {
    setAiInputs(prev => ({ ...prev, [tab]: value }));
  };

  const handleAIKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, tab: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAIQuery(tab);
    }
  };

  const tabs = Object.keys(codeSnippets);

  // Combine all code snippets into complete code
  const getCompleteCode = (): string => {
    const sectionOrder = ['import', 'load', 'preprocessing', 'training'];
    let completeCode = '';
    
    sectionOrder.forEach((section, index) => {
      if (codeSnippets[section]) {
        const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
        completeCode += `# ============================================\n`;
        completeCode += `# ${sectionName} Section\n`;
        completeCode += `# ============================================\n\n`;
        completeCode += codeSnippets[section];
        if (index < sectionOrder.length - 1) {
          completeCode += '\n\n';
        }
      }
    });

    // Add any remaining sections that weren't in the order
    Object.keys(codeSnippets).forEach(section => {
      if (!sectionOrder.includes(section)) {
        const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
        completeCode += `\n\n# ============================================\n`;
        completeCode += `# ${sectionName} Section\n`;
        completeCode += `# ============================================\n\n`;
        completeCode += codeSnippets[section];
      }
    });

    return completeCode.trim();
  };

  const copyCompleteCode = async () => {
    try {
      await navigator.clipboard.writeText(getCompleteCode());
      setCompleteCodeCopied(true);
      setTimeout(() => setCompleteCodeCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code to clipboard:', err);
    }
  };

  const downloadCompleteCode = () => {
    const blob = new Blob([getCompleteCode()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complete_code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Initialize notebook cells from code snippets
  React.useEffect(() => {
    if (activeView === 'notebook' && notebookCells.length === 0) {
      const initialCells: NotebookCell[] = Object.entries(codeSnippets).map(([key, code], index) => ({
        id: `cell-${index}-${Date.now()}`,
        type: 'code' as const,
        content: code,
        output: undefined,
        isExecuting: false,
        isCollapsed: false,
      }));
      setNotebookCells(initialCells);
    }
  }, [activeView, codeSnippets, notebookCells.length]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={activeView === 'complete' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('complete')}
            >
              Complete Code
            </Button>
            <Button
              variant={activeView === 'notebook' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('notebook')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Jupyter Notebook
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeView === 'notebook' ? (
          <div className="w-full -mx-6 -mb-6 h-[600px]">
            <JupyterNotebook
              initialCells={notebookCells}
              onCellsChange={setNotebookCells}
              className="h-full"
            />
          </div>
        ) : activeView === 'complete' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Complete Code</h3>
              <div className="flex items-center space-x-2">
                {/* AI Input for Complete Code */}
                <div className="relative flex items-center">
                  <Sparkles className="absolute left-2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Ask AI about this code..."
                    value={aiInputs['complete'] || ''}
                    onChange={(e) => handleAIInputChange('complete', e.target.value)}
                    onKeyPress={(e) => handleAIKeyPress(e, 'complete')}
                    className="h-7 w-48 pl-7 pr-7 text-xs"
                    disabled={aiLoading['complete']}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 h-7 w-7 hover:bg-transparent"
                    onClick={() => handleAIQuery('complete')}
                    disabled={!aiInputs['complete']?.trim() || aiLoading['complete']}
                  >
                    {aiLoading['complete'] ? (
                      <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                    ) : (
                      <Send className="h-3 w-3 text-slate-400" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCompleteCode}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {completeCodeCopied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadCompleteCode}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="scrollbar-hide [&_pre]:scrollbar-hide [&_code]:scrollbar-hide">
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                  maxHeight: '600px',
                  overflow: 'auto',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  margin: 0
                }}
                showLineNumbers
              >
                {getCompleteCode()}
              </SyntaxHighlighter>
            </div>
            {aiResponses['complete'] && (
              <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-slate-900">AI Response</h4>
                </div>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto scrollbar-hide">
                  {aiResponses['complete'].split('\n').map((line, idx) => (
                    <p key={idx} className={line.trim() ? 'mb-2' : 'mb-1'}>
                      {line.trim() || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2 scrollbar-hide">
            {tabs.map((tab, index) => (
              <div key={tab} className="relative">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">{tab.charAt(0).toUpperCase() + tab.slice(1)} Code</h3>
                  <div className="flex items-center space-x-2">
                    {/* AI Input */}
                    <div className="relative flex items-center">
                      <Sparkles className="absolute left-2 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Ask AI about this code..."
                        value={aiInputs[tab] || ''}
                        onChange={(e) => handleAIInputChange(tab, e.target.value)}
                        onKeyPress={(e) => handleAIKeyPress(e, tab)}
                        className="h-7 w-48 pl-7 pr-7 text-xs"
                        disabled={aiLoading[tab]}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 h-7 w-7 hover:bg-transparent"
                        onClick={() => handleAIQuery(tab)}
                        disabled={!aiInputs[tab]?.trim() || aiLoading[tab]}
                      >
                        {aiLoading[tab] ? (
                          <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                        ) : (
                          <Send className="h-3 w-3 text-slate-400" />
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleVisibility(tab)}
                    >
                      {visibleTabs[tab] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(codeSnippets[tab], tab)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      {copiedTab === tab ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCode(codeSnippets[tab], `${tab}_code.${language}`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {visibleTabs[tab] !== false && (
                  <>
                    <div className="scrollbar-hide [&_pre]:scrollbar-hide [&_code]:scrollbar-hide">
                      <SyntaxHighlighter
                        language={language}
                        style={vscDarkPlus}
                        customStyle={{
                          maxHeight: maxHeight,
                          overflow: 'auto',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          margin: 0
                        }}
                        showLineNumbers
                      >
                        {codeSnippets[tab]}
                      </SyntaxHighlighter>
                    </div>
                    {aiResponses[tab] && (
                      <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          <h4 className="text-sm font-semibold text-slate-900">AI Response</h4>
                        </div>
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto scrollbar-hide">
                          {aiResponses[tab].split('\n').map((line, idx) => (
                            <p key={idx} className={line.trim() ? 'mb-2' : 'mb-1'}>
                              {line.trim() || '\u00A0'}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodePreview;