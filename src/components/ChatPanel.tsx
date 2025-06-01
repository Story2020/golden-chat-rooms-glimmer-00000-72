
import { useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat';

interface ChatPanelProps {
  roomCode: string;
  participantId: string;
  userName: string;
}

const ChatPanel = ({ roomCode, participantId, userName }: ChatPanelProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { messages, newMessage, setNewMessage, sendMessage } = useChat({
    roomCode,
    participantId
  });

  console.log('ChatPanel rendered with:', { roomCode, participantId, userName, messagesCount: messages.length });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      console.log('Message is empty, not sending');
      return;
    }
    
    console.log('Sending message:', newMessage);
    try {
      await sendMessage();
      // Focus back on input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
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
          الدردشة ({messages.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
          <div className="space-y-3 pr-4">
            {messages.length === 0 ? (
              <div className="text-center text-golden-300/50 py-8">
                <p>لا توجد رسائل بعد</p>
                <p className="text-sm mt-1">ابدأ المحادثة!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.participant_id === participantId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        isOwn
                          ? 'bg-golden-gradient text-black'
                          : 'bg-black/30 text-golden-100 border border-golden-400/20'
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-semibold text-golden-300 mb-1">
                          {message.participants?.display_name || 'مجهول'}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-black/70' : 'text-golden-200/70'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
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
            variant="ghost"
            className="golden-button px-3 py-2 h-auto bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border border-golden-400/50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;
