export function parseMarkdown(text: string): string {
    // Pre-process text to normalize newlines
    text = text.replace(/\\n/g, '\n');
    text = text.replace(/\r\n/g, '\n');
    text = text.replace(/\r/g, '\n');
  
    // Headers
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  
    // Bold and Italic
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/\_\_(.+?)\_\_/g, '<strong>$1</strong>');
    text = text.replace(/\_(.+?)\_/g, '<em>$1</em>');
  
    // Code blocks
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  
    // Lists
    text = text.replace(/^\s*\n\*/gm, '\n• ');
    text = text.replace(/^\s*\n-/gm, '\n• ');
    
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-blue-400 hover:underline">$1</a>');
  
    // Handle consecutive newlines properly
    text = text.replace(/\n\n+/g, '</p><p>');
    text = text.replace(/\n/g, '<br />');
    
    // Wrap in paragraph if not already wrapped
    if (!text.startsWith('<')) {
      text = `<p>${text}</p>`;
    }
  
    return text;
  }
  