
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
      
      const shareText = `انضم إلي في غرفة الفيديو شات!\nكود الغرفة: ${roomCode}\nالرابط: ${window.location.href}`;
      
      // Try native share API first (works on mobile and some desktop browsers)
      if (navigator.share && navigator.canShare && navigator.canShare({
        title: 'انضم إلى غرفة الفيديو شات',
        text: shareText
      })) {
        await navigator.share({
          title: 'انضم إلى غرفة الفيديو شات',
          text: shareText,
          url: window.location.href
        });
        toast.success('تم مشاركة الغرفة بنجاح');
        return;
      }
      
      // Fallback to clipboard
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareText);
        toast.success('تم نسخ تفاصيل الغرفة إلى الحافظة');
        return;
      }
      
      // Final fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        toast.success('تم نسخ تفاصيل الغرفة');
      } catch (err) {
        console.error('Fallback copy failed:', err);
        toast.error('خطأ في نسخ تفاصيل الغرفة');
      } finally {
        document.body.removeChild(textArea);
      }
      
    } catch (error) {
      console.error('Error sharing room code:', error);
      toast.error('خطأ في مشاركة الغرفة');
    }
  };

  const handleToggleChat = () => {
    console.log('Chat toggle clicked, current state:', showChat);
    onToggleChat();
    toast.info(showChat ? 'تم إغلاق الدردشة' : 'تم فتح الدردشة');
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
              className="text-golden-400 hover:text-golden-300 hover:bg-golden-400/10 p-2 transition-all duration-200"
              title="مشاركة كود الغرفة"
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
              className={`text-golden-400 hover:text-golden-300 hover:bg-golden-400/10 p-2 transition-all duration-200 ${
                showChat ? 'bg-golden-400/20 text-golden-300' : ''
              }`}
              title={showChat ? 'إغلاق الدردشة' : 'فتح الدردشة'}
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
