'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  ChatSuggestions, 
  ChatSuggestionsHeader, 
  ChatSuggestionsTitle, 
  ChatSuggestionsDescription, 
  ChatSuggestionsContent, 
  ChatSuggestion 
} from '@/components/explorer/ChatSuggestions';

const STARTER_QUESTIONS = [
  {
    label: 'Why did we choose Postgres over MongoDB for the tech stack?',
    icon: '💾',
  },
  {
    label: 'What was decided about the payments vendor compliance?',
    icon: '💳',
  },
];

export default function ExplorerPage() {
  const { isAuthenticated, isLoading, user, getAuthHeaders } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    handleSearch(query);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const [messages, setMessages] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([
    'Postgres architecture decision',
    'Payments vendor sync',
  ]);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [stats, setStats] = useState({
    meetingsCount: 3,
    decisionsCount: 7,
    chunksCount: 24,
  });

  const chatEndRef = useRef(null);

  // Authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSearching]);

  // Fetch some stats on load
  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/meeting', {
        headers: getAuthHeaders(),
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setStats((prev) => ({
              ...prev,
              meetingsCount: data.length,
              decisionsCount: data.reduce((acc, curr) => acc + (curr.decisions || 0), 7),
            }));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-accent-strong" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs text-text-3 font-[family-name:var(--font-mono)]">Loading Memory Explorer...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length === 0) return;

    const userMsg = { role: 'user', content: searchQuery };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsSearching(true);

    if (!searchHistory.includes(searchQuery)) {
      setSearchHistory((prev) => [searchQuery, ...prev.slice(0, 4)]);
    }

    try {
      const response = await fetch(`/api/memory/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const assistantMsg = {
        role: 'assistant',
        content: data.text || "I couldn't find any information matching that query in your meetings.",
        sources: data.sources || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error searching the organizational memory. Please try again.',
          sources: [],
        },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteHistory = (e, itemToDelete) => {
    e.stopPropagation();
    setSearchHistory((prev) => prev.filter((item) => item !== itemToDelete));
  };

  // Highlights citations [N] in text and makes them clickable
  const renderFormattedAnswer = (text, sources) => {
    if (!text) return null;

    // Split text into blocks: code-blocks, lists, headers, paragraphs
    const lines = text.split('\n');
    const blocks = [];
    let currentCodeBlock = null;
    let currentList = null; // { type: 'ul' | 'ol', items: [] }

    const flushList = () => {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
    };

    const parseInline = (str, keyPrefix) => {
      if (!str) return [];

      // Regex matches bold, inline code, or citation reference
      const inlineRegex = /(\*\*([^*]+)\*\*|`([^`]+)`|\[(\d+)\])/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      let partKey = 0;

      while ((match = inlineRegex.exec(str)) !== null) {
        const matchIndex = match.index;
        if (matchIndex > lastIndex) {
          parts.push(str.substring(lastIndex, matchIndex));
        }

        const fullMatch = match[0];
        
        if (fullMatch.startsWith('**')) {
          const boldText = match[2];
          parts.push(
            <strong key={`${keyPrefix}-bold-${partKey++}`} className="font-semibold text-text-1">
              {boldText}
            </strong>
          );
        } else if (fullMatch.startsWith('`')) {
          const codeText = match[3];
          parts.push(
            <code key={`${keyPrefix}-code-${partKey++}`} className="px-1.5 py-0.5 rounded bg-surface-3 border border-border text-accent font-mono text-xs">
              {codeText}
            </code>
          );
        } else if (fullMatch.startsWith('[')) {
          const sourceNum = match[4];
          const sourceIndex = parseInt(sourceNum, 10) - 1;
          const citation = sources[sourceIndex];

          if (citation) {
            parts.push(
              <button
                key={`${keyPrefix}-cite-${partKey++}`}
                onClick={() => setSelectedCitation(citation)}
                className="mx-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold rounded bg-accent-dim text-accent hover:bg-accent hover:text-accent-ink border border-accent/25 transition-all font-[family-name:var(--font-mono)] active:scale-95 cursor-pointer"
                title={`${citation.speaker} in "${citation.meeting_title || 'Meeting'}"`}
              >
                {sourceNum}
              </button>
            );
          } else {
            parts.push(fullMatch);
          }
        }

        lastIndex = inlineRegex.lastIndex;
      }

      if (lastIndex < str.length) {
        parts.push(str.substring(lastIndex));
      }

      return parts.length > 0 ? parts : str;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code Block parsing
      if (line.trim().startsWith('```')) {
        if (currentCodeBlock !== null) {
          blocks.push({ type: 'code', content: currentCodeBlock.join('\n'), lang: currentCodeBlock.lang });
          currentCodeBlock = null;
        } else {
          flushList();
          const lang = line.replace('```', '').trim();
          currentCodeBlock = [];
          currentCodeBlock.lang = lang;
        }
        continue;
      }

      if (currentCodeBlock !== null) {
        currentCodeBlock.push(line);
        continue;
      }

      // List parsing
      const bulletMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
      if (bulletMatch) {
        if (!currentList || currentList.type !== 'ul') {
          flushList();
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(bulletMatch[2]);
        continue;
      }

      const numListMatch = line.match(/^(\s*)\d+\.\s+(.*)/);
      if (numListMatch) {
        if (!currentList || currentList.type !== 'ol') {
          flushList();
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push(numListMatch[2]);
        continue;
      }

      // If not a list item, flush any active list
      flushList();

      // Header parsing
      const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        blocks.push({ type: 'header', level, content: headerMatch[2] });
        continue;
      }

      // Empty line / paragraph
      if (line.trim() === '') {
        blocks.push({ type: 'empty' });
      } else {
        blocks.push({ type: 'paragraph', content: line });
      }
    }

    flushList();

    return (
      <div className="space-y-3 text-sm text-text-2 leading-relaxed">
        {blocks.map((block, idx) => {
          const key = `block-${idx}`;
          switch (block.type) {
            case 'code':
              return (
                <div key={key} className="relative my-3.5 rounded-xl border border-border bg-[#09090b] p-4 overflow-x-auto font-mono text-xs text-accent">
                  {block.lang && (
                    <div className="absolute top-2 right-3 text-[9px] font-mono text-text-3 uppercase tracking-wider select-none">
                      {block.lang}
                    </div>
                  )}
                  <pre className="pt-2"><code>{block.content}</code></pre>
                </div>
              );
            case 'ul':
              return (
                <ul key={key} className="list-disc pl-5 space-y-1.5 my-2">
                  {block.items.map((item, itemIdx) => (
                    <li key={`ul-item-${itemIdx}`} className="text-text-2">
                      {parseInline(item, `ul-${idx}-${itemIdx}`)}
                    </li>
                  ))}
                </ul>
              );
            case 'ol':
              return (
                <ol key={key} className="list-decimal pl-5 space-y-1.5 my-2">
                  {block.items.map((item, itemIdx) => (
                    <li key={`ol-item-${itemIdx}`} className="text-text-2">
                      {parseInline(item, `ol-${idx}-${itemIdx}`)}
                    </li>
                  ))}
                </ol>
              );
            case 'header': {
              const Tag = `h${Math.min(block.level + 1, 6)}`;
              const sizeClass = block.level === 1 ? 'text-base font-bold mt-4 mb-2 text-text-1' :
                                block.level === 2 ? 'text-sm font-semibold mt-3 mb-2 text-text-1' :
                                'text-xs font-semibold mt-3 mb-1 text-text-1';
              return (
                <Tag key={key} className={`${sizeClass} font-[family-name:var(--font-display)]`}>
                  {parseInline(block.content, `h-${idx}`)}
                </Tag>
              );
            }
            case 'empty':
              return <div key={key} className="h-2" />;
            case 'paragraph':
            default:
              return (
                <p key={key} className="text-text-2 leading-relaxed">
                  {parseInline(block.content, `p-${idx}`)}
                </p>
              );
          }
        })}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-bg overflow-hidden font-body">
      
      {/* ─── Sidebar ────────────────────────────────────────────────────── */}
      <aside className="w-64 border-r border-border bg-bg hidden md:flex flex-col p-5 overflow-y-auto shrink-0 select-none">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-strong text-accent-ink font-[family-name:var(--font-display)] text-xs font-bold">
            N
          </div>
          <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-text-1 tracking-tight">
            Nexus Chat
          </span>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => {
            setMessages([]);
            setSelectedCitation(null);
          }}
          className="mb-5 flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-border hover:border-accent hover:bg-surface text-xs font-medium text-text-2 hover:text-text-1 transition-all cursor-pointer"
        >
          <span>+</span>
          <span>New Chat</span>
        </button>

        {/* Search History */}
        <div className="flex-grow overflow-y-auto mb-6">
          <h3 className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-2 select-none px-1">
            Recent Queries
          </h3>
          {searchHistory.length === 0 ? (
            <span className="text-xs text-text-3 italic block pl-1">No recent searches</span>
          ) : (
            <div className="space-y-0.5">
              {searchHistory.map((hist, idx) => (
                <div
                  key={idx}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-text-2 hover:bg-surface hover:text-text-1 border border-transparent transition-all group overflow-hidden"
                >
                  <button
                    onClick={() => handleSearch(hist)}
                    className="flex-grow text-left truncate cursor-pointer py-0.5 flex items-center gap-2"
                    title={hist}
                  >
                    <span className="text-text-3 group-hover:text-accent transition-colors">🔍</span>
                    <span className="truncate">{hist}</span>
                  </button>
                  <button
                    onClick={(e) => handleDeleteHistory(e, hist)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-text-3 hover:text-danger hover:bg-danger/8 border border-transparent rounded transition-all cursor-pointer text-[10px]"
                    title="Delete query"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="pt-4 border-t border-border flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-accent-dim border border-accent/25 flex items-center justify-center text-accent text-xs font-semibold font-[family-name:var(--font-display)] select-none shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-semibold text-text-1 block truncate leading-none mb-1">
              {user?.name || 'Nexus User'}
            </span>
            <span className="text-[10px] text-text-3 block truncate">
              {user?.email || 'user@nexus.ai'}
            </span>
          </div>
        </div>
      </aside>

      {/* ─── Chat Area ──────────────────────────────────────────────────── */}
      <section className="flex-grow flex flex-col h-full relative">
        {/* Messages Feed */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 pb-36">
          {messages.length === 0 ? (
            /* Welcome / Zero State */
            <div className="max-w-3xl mx-auto py-12 md:py-20 text-center animate-fade-in">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-dim text-accent border border-accent/25 mb-6 text-2xl animate-pulse">
                🧠
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-display)] text-transparent bg-clip-text bg-gradient-to-b from-white via-text-1 to-text-3 tracking-tight mb-3">
                Organizational Memory Hub
              </h1>
              <p className="text-xs md:text-sm text-text-2 max-w-lg mx-auto mb-10 leading-relaxed font-body">
                Query or search across conversations, design reviews, decisions, and agreements indexed securely in Pinecone.
              </p>

              {/* Suggestions */}
              <ChatSuggestions className="max-w-xl mx-auto mt-6 text-left">
                <ChatSuggestionsHeader>
                  <ChatSuggestionsTitle>Suggested Queries</ChatSuggestionsTitle>
                  <ChatSuggestionsDescription>Click one to query our memory index instantly</ChatSuggestionsDescription>
                </ChatSuggestionsHeader>
                <ChatSuggestionsContent>
                  {STARTER_QUESTIONS.map((q, idx) => (
                    <ChatSuggestion key={idx} onClick={() => handleSearch(q.label)}>
                      {q.icon} {q.label}
                    </ChatSuggestion>
                  ))}
                </ChatSuggestionsContent>
              </ChatSuggestions>
            </div>
          ) : (
            /* Messages List */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start animate-fade-in'}`}
                >
                  {msg.role !== 'user' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-dim border border-accent/25 text-accent text-sm font-bold font-[family-name:var(--font-display)] select-none shrink-0 shadow-sm shadow-accent/5">
                      N
                    </div>
                  )}
                  
                  <div
                    className={`${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-accent-strong to-accent text-accent-ink rounded-2xl rounded-tr-none px-5 py-3 text-sm font-medium shadow-md shadow-accent-dim/10 max-w-xl hover:opacity-95 transition-opacity'
                        : 'flex-grow max-w-2xl bg-surface/20 border border-border/50 backdrop-blur-sm rounded-2xl rounded-tl-none p-5 md:p-6 text-text-1 shadow-md leading-relaxed text-sm'
                    }`}
                  >
                    {msg.role !== 'user' && (
                      <div className="flex items-center gap-2 mb-3 select-none">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider font-[family-name:var(--font-mono)]">
                          Nexus AI
                        </span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className="text-[9px] font-semibold text-text-3 font-[family-name:var(--font-mono)]">
                          Retrieval Synthesis
                        </span>
                      </div>
                    )}
 
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="space-y-4">
                        {renderFormattedAnswer(msg.content, msg.sources)}
 
                        {/* Citations Footer */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="pt-4 border-t border-border/30 mt-5">
                            <h4 className="text-[9px] font-bold text-text-3 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-[family-name:var(--font-mono)]">
                              <span className="text-accent">📁</span> Sources Referenced ({msg.sources.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {msg.sources.map((citation, cIdx) => (
                                <div
                                  key={cIdx}
                                  onClick={() => setSelectedCitation(citation)}
                                  className="p-3.5 rounded-xl bg-surface/30 border border-border/70 hover:border-accent/40 hover:bg-surface-2/45 transition-all cursor-pointer flex flex-col justify-between shadow-sm active:scale-[0.98] group"
                                >
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-bold text-text-1 truncate max-w-[130px] group-hover:text-accent transition-colors" title={citation.meeting_title || 'Meeting'}>
                                      {citation.meeting_title || 'Meeting'}
                                    </span>
                                    <span className="text-[8px] font-[family-name:var(--font-mono)] text-text-3">
                                      {citation.timestamp ? citation.timestamp.split('T')[0] : ''}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-text-2 line-clamp-2 italic mb-2 leading-relaxed">
                                    "{citation.text}"
                                  </p>
                                  <div className="flex items-center justify-between mt-0.5">
                                    <span className="text-[9px] font-medium text-text-2">
                                      👤 {citation.speaker}
                                    </span>
                                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-accent-dim text-accent font-semibold font-[family-name:var(--font-mono)] group-hover:bg-accent group-hover:text-accent-ink transition-all">
                                      Ref [{cIdx + 1}]
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Searching Indicator */}
              {isSearching && (
                <div className="flex justify-start items-start gap-3 animate-fade-in">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-dim border border-accent/20 text-accent text-sm font-bold font-[family-name:var(--font-display)] select-none shrink-0 animate-pulse">
                    N
                  </div>
                  <div className="bg-surface border border-border rounded-2xl rounded-tl-sm p-4.5 max-w-sm shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce"></div>
                      </div>
                      <span className="text-[10px] text-text-3 font-[family-name:var(--font-mono)] uppercase tracking-wider animate-pulse">Consulting collective memory...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bg via-bg/95 to-transparent pointer-events-none z-20">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <form
              onSubmit={handleSubmit}
              className="bg-[#0e0e11]/90 backdrop-blur-md rounded-xl border border-border shadow-2xl transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Textarea Input */}
              <div className="px-4 pt-3 pb-2">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Nexus's memory..."
                  disabled={isSearching}
                  rows={2}
                  className="w-full resize-none bg-transparent border-0 outline-none text-text-1 text-sm leading-relaxed placeholder:text-text-3/60 focus:ring-0 focus:outline-none"
                  style={{ minHeight: '44px', maxHeight: '160px' }}
                />
              </div>

              {/* Action Bar (Divider & Bottom row) */}
              <div className="flex items-center justify-between border-t border-border/40 px-4 py-2 bg-surface/5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuery((prev) => prev + '@')}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors cursor-pointer"
                    title="Mention someone"
                  >
                    <span className="text-sm font-semibold font-mono">@</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-1.5 text-[10px] text-text-3 font-mono">
                  <span>Enter to send, Shift + Enter for newline</span>
                  <span className="hidden sm:inline">· Pinecone + Groq</span>
                </div>

                <button
                  type="submit"
                  disabled={!query.trim() || isSearching}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-all cursor-pointer ${
                    query.trim() && !isSearching
                      ? 'bg-accent-strong text-accent-ink hover:bg-accent scale-100 hover:scale-105 active:scale-95'
                      : 'bg-border/30 text-text-3/40 cursor-not-allowed opacity-50'
                  }`}
                  aria-label="Send query"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          <div className="max-w-3xl mx-auto text-center mt-2.5">
            <span className="text-[9px] text-text-3 font-[family-name:var(--font-mono)] uppercase tracking-wider">
              Powered by Pinecone vector storage &amp; Groq Llama synthesis
            </span>
          </div>
        </div>
      </section>

      {/* ─── Citation Detail Sidebar / Drawer ────────────────────────────── */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in" onClick={() => setSelectedCitation(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full bg-[#0e0e11] border-l border-border p-6 flex flex-col overflow-y-auto animate-slide-right shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">📁</span>
                <h3 className="font-[family-name:var(--font-display)] font-semibold text-text-1 text-base">
                  Source Reference
                </h3>
              </div>
              <button
                onClick={() => setSelectedCitation(null)}
                className="text-text-3 hover:text-text-1 p-1 hover:bg-surface rounded-lg transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <div>
                <span className="text-[10px] font-bold text-text-3 uppercase tracking-wider block mb-1 font-[family-name:var(--font-mono)]">
                  Meeting Title
                </span>
                <span className="text-sm font-bold text-text-1">
                  {selectedCitation.meeting_title || 'Meeting Details'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-text-3 uppercase tracking-wider block mb-1 font-[family-name:var(--font-mono)]">
                    Speaker
                  </span>
                  <span className="text-xs text-text-2 font-medium">
                    👤 {selectedCitation.speaker || 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-text-3 uppercase tracking-wider block mb-1 font-[family-name:var(--font-mono)]">
                    Captured At
                  </span>
                  <span className="text-xs text-text-2 font-[family-name:var(--font-mono)]">
                    📅 {selectedCitation.timestamp ? selectedCitation.timestamp.replace('T', ' ').substring(0, 16) : 'Unknown'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-text-3 uppercase tracking-wider block mb-1 font-[family-name:var(--font-mono)]">
                  Transcribed Excerpt
                </span>
                <div className="p-4 rounded-xl border border-border bg-[#070708] text-xs text-text-2 italic leading-relaxed border-l-2 border-l-accent">
                  "{selectedCitation.text}"
                </div>
              </div>

              {selectedCitation.meeting_id && (
                <button
                  onClick={() => {
                    setSelectedCitation(null);
                    router.push(`/meeting/${selectedCitation.meeting_id}`);
                  }}
                  className="w-full py-3 px-4 rounded-xl border border-accent bg-accent-dim hover:bg-accent text-accent hover:text-accent-ink text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
                >
                  <span>Go to Meeting Transcript</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
