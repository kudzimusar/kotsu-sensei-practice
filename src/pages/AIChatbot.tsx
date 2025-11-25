import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Trash2, Sparkles, Image as ImageIcon } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAIChat } from '@/hooks/useAIChat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TTSButton } from '@/components/ui/tts-button';
import { ImageFile } from '@/components/ui/image-upload';
import { ImageUploadMenu } from '@/components/ui/image-upload-menu';

const SUGGESTED_QUESTIONS = [
  "What are the speed limits in different areas in Japan?",
  "Explain the right-of-way rules at intersections",
  "What do I need to know about parking regulations?",
  "How should I handle a pedestrian crossing?",
  "What are the common road signs I should memorize?",
];

const AIChatbot = () => {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<ImageFile[]>([]);
  const { messages, isLoading, sendMessage, clearChat } = useAIChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && images.length === 0) || isLoading) return;
    
    const messageToSend = input;
    const imagesToSend = [...images];
    setInput('');
    setImages([]);
    await sendMessage(messageToSend, imagesToSend.length > 0 ? imagesToSend : undefined);
    inputRef.current?.focus();
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kōtsū Sensei AI</h1>
                <p className="text-sm text-gray-500">Your Japanese Driving Assistant</p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                title="Clear chat"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Kōtsū Sensei AI!
            </h2>
            <p className="text-gray-600 mb-6">
              Ask me anything about Japanese traffic rules, road signs, or driving techniques.
            </p>

            {/* Suggested Questions */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">Try asking:</p>
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start h-auto py-3 px-4 whitespace-normal"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{question}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="h-[calc(100vh-280px)] mb-4 overflow-y-auto" ref={scrollRef}>
            <div className="space-y-4 p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <Card
                    className={`max-w-[85%] p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className={`text-sm prose prose-sm max-w-none ${
                      message.role === 'user' 
                        ? 'prose-invert' 
                        : 'prose-slate'
                    }`}>
                      {message.role === 'user' ? (
                        <div className="space-y-2">
                          {message.images && message.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {message.images.map((img, idx) => (
                                <div key={img.id || idx} className="relative group">
                                  <img
                                    src={img.storage_url}
                                    alt={img.sign_name_en || 'Road sign'}
                                    className="w-24 h-24 object-cover rounded-lg border-2 border-white/20 cursor-pointer hover:opacity-90 transition"
                                    onClick={() => window.open(img.storage_url, '_blank')}
                                  />
                                  {img.sign_name_en && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded-b-lg truncate">
                                      {img.sign_name_en}
                                    </div>
                                  )}
                                  {img.ai_confidence && (
                                    <div className="absolute top-1 right-1 bg-blue-600 text-white text-[9px] px-1 py-0.5 rounded">
                                      {(img.ai_confidence * 100).toFixed(0)}%
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {message.content && (
                            <div className="flex items-start gap-2">
                              <p className="whitespace-pre-wrap break-words m-0 flex-1">{message.content}</p>
                              <TTSButton 
                                text={message.content}
                                size="sm" 
                                variant="ghost"
                                className="text-white hover:bg-blue-700"
                              />
                            </div>
                          )}
                        </div>
                      ) : message.sections ? (
                        // Structured section-based response
                        <div className="space-y-6">
                          {message.sections.map((section, sectionIdx) => {
                            const sectionText = `${section.heading}. ${section.content}${section.summary ? ` Summary: ${section.summary}` : ''}`;
                            return (
                            <div key={sectionIdx} className="border-l-4 border-blue-500 pl-4">
                              {/* Heading */}
                              <div className="flex items-start gap-2 mb-3">
                                <h3 className="text-base font-bold text-gray-900 flex-1">
                                  {section.heading}
                                </h3>
                                <TTSButton 
                                  text={sectionText}
                                  size="sm" 
                                  variant="ghost" 
                                />
                              </div>
                              
                              {/* Image */}
                              {section.image && (
                                <div className="mb-3">
                                  <img
                                    src={section.image}
                                    alt={section.heading || 'Road sign'}
                                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition"
                                    onClick={() => window.open(section.image, '_blank')}
                                    onError={(e) => {
                                      console.error(`❌ Image failed to load for section "${section.heading}":`, {
                                        url: section.image,
                                        heading: section.heading
                                      });
                                      e.currentTarget.style.display = 'none';
                                    }}
                                    onLoad={() => {
                                      console.log(`✅ Image loaded for section "${section.heading}"`);
                                    }}
                                  />
                                  {/* Attribution for Wikimedia Commons images */}
                                  {(section.imageSource === 'wikimedia_commons' || section.attribution || section.wikimediaPageUrl) && (
                                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-1 flex-wrap">
                                      <span>©</span>
                                      {section.attribution ? (
                                        <span>{section.attribution}</span>
                                      ) : (
                                        <span>Wikimedia Commons</span>
                                      )}
                                      {section.wikimediaPageUrl && (
                                        <a 
                                          href={section.wikimediaPageUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          View source
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                              {!section.image && console.warn(`⚠️ Section "${section.heading}" missing image property`)}
                              
                              {/* Content */}
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({node, ...props}) => <p className="my-2 leading-relaxed text-gray-700" {...props} />,
                                  ul: ({node, ...props}) => <ul className="my-2 ml-4 list-disc space-y-1" {...props} />,
                                  ol: ({node, ...props}) => <ol className="my-2 ml-4 list-decimal space-y-1" {...props} />,
                                  li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                                  strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                                  em: ({node, ...props}) => <em className="italic" {...props} />,
                                  code: ({node, ...props}) => (
                                    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs" {...props} />
                                  ),
                                }}
                              >
                                {section.content}
                              </ReactMarkdown>
                              
                              {/* Summary */}
                              {section.summary && (
                                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <p className="text-sm text-blue-900 flex items-start gap-2">
                                    <span className="text-base">💡</span>
                                    <span className="font-medium">{section.summary}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                            );
                          })}
                        </div>
                      ) : (
                        // Fallback to plain markdown for backward compatibility
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                            h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-4 mb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-base font-bold mt-3 mb-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                            p: ({node, ...props}) => <p className="my-2 leading-relaxed" {...props} />,
                            ul: ({node, ...props}) => <ul className="my-2 ml-4 list-disc space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="my-2 ml-4 list-decimal space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                            em: ({node, ...props}) => <em className="italic" {...props} />,
                            code: ({node, ...props}) => {
                              const isInline = !props.className?.includes('language-');
                              return isInline ? (
                                <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs" {...props} />
                              ) : (
                                <code className="block bg-gray-100 text-gray-800 p-2 rounded text-xs my-2" {...props} />
                              );
                            },
                            blockquote: ({node, ...props}) => (
                              <blockquote className="border-l-4 border-blue-500 pl-4 my-2 italic" {...props} />
                            ),
                          }}
                            >
                              {message.content || ''}
                            </ReactMarkdown>
                          </div>
                          {message.content && (
                            <TTSButton 
                              text={message.content}
                              size="sm" 
                              variant="ghost" 
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div
                      className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </Card>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="max-w-[85%] p-4 bg-white border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="fixed bottom-20 left-0 right-0 bg-white border-t">
          <div className="max-w-4xl mx-auto p-4">
            {/* Upload Menu Component with Image Previews */}
            <ImageUploadMenu
              images={images}
              onImagesChange={setImages}
              maxImages={5}
              disabled={isLoading}
              trigger="icon"
            />
            
            {/* Input row */}
            <div className="flex gap-2 items-center mt-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={images.length > 0 ? "Ask about this sign..." : "Ask about Japanese driving rules..."}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={(!input.trim() && images.length === 0) || isLoading}
                size="icon"
                className="flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AIChatbot;
