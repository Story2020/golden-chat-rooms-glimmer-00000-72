
import { Video, VideoOff, Mic, MicOff, PhoneOff, Settings, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VideoControlsProps {
  isVideoOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  onLeaveRoom: () => void;
}

const VideoControls = ({
  isVideoOn,
  isAudioOn,
  isScreenSharing,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onLeaveRoom
}: VideoControlsProps) => {
  
  const handleToggleAudio = () => {
    console.log('Audio button clicked, current state:', isAudioOn);
    onToggleAudio();
    toast.success(isAudioOn ? 'تم كتم الصوت' : 'تم تشغيل الصوت');
  };

  const handleToggleVideo = () => {
    console.log('Video button clicked, current state:', isVideoOn);
    onToggleVideo();
    toast.success(isVideoOn ? 'تم إيقاف الكاميرا' : 'تم تشغيل الكاميرا');
  };

  const handleToggleScreenShare = async () => {
    try {
      console.log('Screen share toggle clicked');
      
      if (!isScreenSharing) {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: true 
        });
        
        console.log('Screen sharing started');
        toast.success('تم بدء مشاركة الشاشة');
        
        displayStream.getVideoTracks()[0].addEventListener('ended', () => {
          console.log('Screen sharing ended');
          toast.info('تم إيقاف مشاركة الشاشة');
          onToggleScreenShare();
        });
      } else {
        toast.info('تم إيقاف مشاركة الشاشة');
      }
      
      onToggleScreenShare();
    } catch (error) {
      console.error('Screen sharing error:', error);
      toast.error('خطأ في مشاركة الشاشة');
    }
  };

  const handleLeaveRoom = () => {
    console.log('Leave room clicked');
    if (window.confirm('هل أنت متأكد من مغادرة الغرفة؟')) {
      onLeaveRoom();
      toast.success('تم مغادرة الغرفة');
    }
  };

  const handleSettings = () => {
    toast.info('الإعدادات قريباً');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="glass-card border border-golden-400/30 p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-4">
          {/* Audio Toggle */}
          <Button
            onClick={handleToggleAudio}
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-full transition-all duration-300 hover:scale-105 ${
              isAudioOn 
                ? 'bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border-2 border-golden-400/50' 
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-2 border-red-400/50'
            }`}
            title={isAudioOn ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          {/* Video Toggle */}
          <Button
            onClick={handleToggleVideo}
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-full transition-all duration-300 hover:scale-105 ${
              isVideoOn 
                ? 'bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border-2 border-golden-400/50' 
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-2 border-red-400/50'
            }`}
            title={isVideoOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          {/* Screen Share */}
          <Button
            onClick={handleToggleScreenShare}
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-full transition-all duration-300 hover:scale-105 ${
              isScreenSharing 
                ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-2 border-blue-400/50' 
                : 'bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border-2 border-golden-400/50'
            }`}
            title={isScreenSharing ? 'إيقاف مشاركة الشاشة' : 'مشاركة الشاشة'}
          >
            <Monitor className="w-5 h-5" />
          </Button>

          {/* Settings */}
          <Button
            onClick={handleSettings}
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border-2 border-golden-400/50 transition-all duration-300 hover:scale-105"
            title="الإعدادات"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <div className="w-px h-8 bg-golden-400/30 mx-2"></div>

          {/* Leave Room */}
          <Button
            onClick={handleLeaveRoom}
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border-2 border-red-400/50 transition-all duration-300 hover:scale-105"
            title="مغادرة الغرفة"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
