
import { useState, useEffect, useRef } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ChatPanelProps {
  roomCode: string;
  userName: string;
}

const ChatPanel = ({ roomCode, userName }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'أحمد محمد',
      content: 'مرحباً بالجميع! 👋',
      timestamp: new Date(Date.now() - 300000),
      isOwn: false
    },
    {
      id: '2',
      sender: 'فاطمة علي',
      content: 'أهلاً وسهلاً 😊',
      timestamp: new Date(Date.now() - 240000),
      isOwn: false
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: userName,
      content: newMessage,
      timestamp: new Date(),
      isOwn: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <Card className="glass-card border border-golden-400/30 h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-golden-300 text-center">
          الدردشة
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
          <div className="space-y-3 pr-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isOwn
                      ? 'bg-golden-gradient text-black'
                      : 'bg-black/30 text-golden-100 border border-golden-400/20'
                  }`}
                >
                  {!message.isOwn && (
                    <p className="text-xs font-semibold text-golden-300 mb-1">
                      {message.sender}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.isOwn ? 'text-black/70' : 'text-golden-200/70'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب رسالة..."
              className="bg-black/30 border-golden-400/30 text-golden-100 placeholder-golden-300/50 
                       focus:border-golden-400 focus:ring-golden-400/30 pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6 
                       text-golden-400 hover:text-golden-300 hover:bg-golden-400/10"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="golden-button px-3 py-2 h-auto"
          >
            <Send className="w-4 h-4 icon-3d" />
          </Button>
        </div>

        {/* Online Users */}
        <div className="mt-4 pt-4 border-t border-golden-400/20">
          <p className="text-xs text-golden-300/70 mb-2">المتصلون الآن:</p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded border border-green-400/30">
              {userName} (أنت)
            </span>
            <span className="text-xs bg-golden-600/20 text-golden-300 px-2 py-1 rounded border border-golden-400/30">
              أحمد محمد
            </span>
            <span className="text-xs bg-golden-600/20 text-golden-300 px-2 py-1 rounded border border-golden-400/30">
              فاطمة علي
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;
