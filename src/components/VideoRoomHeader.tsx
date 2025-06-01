
import { Users, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VideoRoomHeaderProps {
  roomCode: string;
  participantsCount: number;
  showChat: boolean;
  onToggleChat: () => void;
}

const VideoRoomHeader = ({ roomCode, participantsCount, showChat, onToggleChat }: VideoRoomHeaderProps) => {
  const shareRoomCode = async () => {
    try {
      console.log('Attempting to share room code:', roomCode);
      
      // Try native share API first
      if (navigator.share) {
        await navigator.share({
          title: 'انضم إلى غرفة الفيديو شات',
          text: `انضم إلي في غرفة الفيديو شات باستخدام الكود: ${roomCode}`,
          url: window.location.href
        });
        toast.success('تم مشاركة الغرفة بنجاح');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`كود الغرفة: ${roomCode}\nالرابط: ${window.location.href}`);
        toast.success('تم نسخ كود الغرفة والرابط');
      }
    } catch (error) {
      console.error('Error sharing room code:', error);
      // Final fallback
      try {
        await navigator.clipboard.writeText(roomCode);
        toast.success('تم نسخ كود الغرفة');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        toast.error('خطأ في مشاركة الغرفة');
      }
    }
  };

  const handleToggleChat = () => {
    console.log('Chat toggle clicked, current state:', showChat);
    onToggleChat();
  };

  return (
    <div className="relative z-10 p-4">
      <div className="glass-card border border-golden-400/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-golden-200 font-semibold">متصل</span>
            </div>
            <div className="h-6 w-px bg-golden-400/30"></div>
            <span className="text-golden-300 font-bold">غرفة: {roomCode}</span>
            <Button
              onClick={shareRoomCode}
              variant="ghost"
              size="sm"
              className="text-golden-400 hover:text-golden-300 hover:bg-golden-400/10 p-2"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-golden-200">
              <Users className="w-4 h-4" />
              <span>{participantsCount}</span>
            </div>
            <Button
              onClick={handleToggleChat}
              variant="ghost"
              size="sm"
              className={`text-golden-400 hover:text-golden-300 hover:bg-golden-400/10 p-2 ${
                showChat ? 'bg-golden-400/20' : ''
              }`}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRoomHeader;
