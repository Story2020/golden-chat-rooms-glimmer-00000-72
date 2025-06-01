
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
      await navigator.share({
        title: 'انضم إلى غرفة الفيديو شات',
        text: `انضم إلي في غرفة الفيديو شات باستخدام الكود: ${roomCode}`,
        url: window.location.href
      });
    } catch (error) {
      navigator.clipboard.writeText(roomCode);
      toast.success('تم نسخ كود الغرفة');
    }
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
              className="text-golden-400 hover:text-golden-300 hover:bg-golden-400/10"
            >
              <Share2 className="w-4 h-4 icon-3d" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-golden-200">
              <Users className="w-4 h-4 icon-3d" />
              <span>{participantsCount}</span>
            </div>
            <Button
              onClick={onToggleChat}
              variant="ghost"
              size="sm"
              className="text-golden-400 hover:text-golden-300 hover:bg-golden-400/10"
            >
              <MessageCircle className="w-4 h-4 icon-3d" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRoomHeader;
