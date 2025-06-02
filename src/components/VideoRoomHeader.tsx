
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
      console.log('Share button clicked for room code:', roomCode);
      
      const shareText = `انضم إلي في غرفة الفيديو شات!\nكود الغرفة: ${roomCode}\nالرابط: ${window.location.href}`;
      const shareData = {
        title: 'انضم إلى غرفة الفيديو شات',
        text: shareText,
        url: window.location.href
      };
      
      // Method 1: Try native share API first (works on mobile and some desktop browsers)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          console.log('Native share successful');
          toast.success('تم مشاركة الغرفة بنجاح');
          return;
        } catch (shareError) {
          console.log('Native share cancelled or failed:', shareError);
          // Continue to fallback methods
        }
      }
      
      // Method 2: Try clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(shareText);
          console.log('Clipboard copy successful');
          toast.success('تم نسخ تفاصيل الغرفة إلى الحافظة');
          return;
        } catch (clipboardError) {
          console.log('Clipboard copy failed:', clipboardError);
          // Continue to final fallback
        }
      }
      
      // Method 3: Final fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        
        // Focus and select the text
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          console.log('Fallback copy successful');
          toast.success('تم نسخ تفاصيل الغرفة');
        } else {
          throw new Error('execCommand copy failed');
        }
      } catch (fallbackError) {
        console.error('All copy methods failed:', fallbackError);
        // Show manual copy option
        const userMessage = `يرجى نسخ هذه المعلومات يدوياً:\n\nكود الغرفة: ${roomCode}\nالرابط: ${window.location.href}`;
        
        if (window.prompt) {
          window.prompt('نسخ تفاصيل الغرفة:', userMessage);
        } else {
          toast.error('خطأ في المشاركة. كود الغرفة: ' + roomCode);
        }
      }
      
    } catch (error) {
      console.error('General error sharing room code:', error);
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
              className="text-golden-400 hover:text-golden-300 hover:bg-golden-400/10 p-2 transition-all duration-200 hover:scale-105"
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
              className={`text-golden-400 hover:text-golden-300 hover:bg-golden-400/10 p-2 transition-all duration-200 hover:scale-105 ${
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
