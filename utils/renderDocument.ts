/**
 * Preprocess markdown to remove line breaks after bullet markers.
 * It converts patterns like "-\n   " into "- ".
 */
function preprocessMarkdown(input: string): string {
    return input.replace(/(^|\n)([\*\-\+])\n\s*/g, '$1$2 ');
  }
  
  export function renderDocument(text: string): string {
    // Preprocess markdown to remove unwanted line breaks
    text = preprocessMarkdown(text);
  
    // Normalize newlines
    text = text.replace(/\\n/g, '\n');
    text = text.replace(/\r\n/g, '\n');
    text = text.replace(/\r/g, '\n');
  
    // Tables
    text = text.replace(/\n((?:\|[^\n]+\|\n)+)/g, (match, table) => {
      const rows = table.trim().split('\n');
      interface TableRow {
        cells: string[];
        isHeader: boolean;
      }
  
      const htmlRows: string[] = rows.map((row: string): string => {
        const cells: string[] = row.split('|').slice(1, -1);
        const isHeader: boolean = row.includes('---');
        if (isHeader) return '';
        return `<tr>${cells.map((cell: string): string => `<td>${cell.trim()}</td>`).join('')}</tr>`;
      }).filter(Boolean);
      return `\n<table class="min-w-[200px] border-collapse">${htmlRows.join('')}</table>\n`;
    });
  
    // Headers (h1 through h6)
    text = text.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    text = text.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    text = text.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    text = text.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    text = text.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  
    // Bold and Italic
    text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
    text = text.replace(/_(.+?)_/g, '<em>$1</em>');
  
    // Code blocks and inline code
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  
    // Lists
    text = text.replace(/^\s*[-*+]\s+(.+)/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:underline">$1</a>');
  
    // Paragraphs
    text = text.replace(/\n\n+/g, '</p><p>');
    text = text.replace(/\n/g, '<br/>');
  
    // Remove line breaks immediately after bullet list
    text = text.replace(/<\/ul>(<br\/>)+/g, '</ul>');
  
    // Wrap in paragraph if not already wrapped
    if (!text.startsWith('<')) {
      text = `<p>${text}</p>`;
    }
  
    // Wrap final output with a style block and container for custom markdown styling
    return `<style>
.markdown-content { color: #f9f9f9; }
.markdown-content h1 { font-size: 2.5em; color: #f9f9f9; }
.markdown-content h2 { font-size: 2em; color: #f9f9f9; }
.markdown-content h3 { font-size: 1.75em; color: #f9f9f9; }
.markdown-content h4 { font-size: 1.5em; color: #f9f9f9; }
.markdown-content h5 { font-size: 1.25em; color: #f9f9f9; }
.markdown-content h6 { font-size: 1em; color: #f9f9f9; }
</style><div class="markdown-content">${text}</div>`;
  }
