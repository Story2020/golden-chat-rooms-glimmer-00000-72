
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
  
  const handleToggleScreenShare = async () => {
    try {
      console.log('Screen share toggle clicked, current state:', isScreenSharing);
      
      if (!isScreenSharing) {
        // Start screen sharing
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: true 
        });
        
        console.log('Screen sharing started:', displayStream);
        toast.success('تم بدء مشاركة الشاشة');
        
        // Listen for when user stops sharing via browser UI
        displayStream.getVideoTracks()[0].addEventListener('ended', () => {
          console.log('Screen sharing ended by user');
          toast.info('تم إيقاف مشاركة الشاشة');
        });
      } else {
        console.log('Stopping screen share');
        toast.info('تم إيقاف مشاركة الشاشة');
      }
      
      onToggleScreenShare();
    } catch (error) {
      console.error('Error with screen sharing:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('تم رفض إذن مشاركة الشاشة');
      } else if (error.name === 'NotSupportedError') {
        toast.error('مشاركة الشاشة غير مدعومة في هذا المتصفح');
      } else {
        toast.error('خطأ في مشاركة الشاشة');
      }
    }
  };

  const handleToggleAudio = () => {
    console.log('Audio toggle clicked, current state:', isAudioOn);
    onToggleAudio();
  };

  const handleToggleVideo = () => {
    console.log('Video toggle clicked, current state:', isVideoOn);
    onToggleVideo();
  };

  const handleLeaveRoom = () => {
    console.log('Leave room clicked');
    if (confirm('هل أنت متأكد من مغادرة الغرفة؟')) {
      onLeaveRoom();
    }
  };

  const handleSettings = () => {
    console.log('Settings clicked');
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
            className={`w-12 h-12 rounded-full transition-all duration-300 ${
              isAudioOn 
                ? 'bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border-2 border-golden-400/50' 
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-2 border-red-400/50'
            }`}
            title={isAudioOn ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {isAudioOn ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </Button>

          {/* Video Toggle */}
          <Button
            onClick={handleToggleVideo}
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-full transition-all duration-300 ${
              isVideoOn 
                ? 'bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border-2 border-golden-400/50' 
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-2 border-red-400/50'
            }`}
            title={isVideoOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
          >
            {isVideoOn ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </Button>

          {/* Screen Share */}
          <Button
            onClick={handleToggleScreenShare}
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-full transition-all duration-300 ${
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
            className="w-12 h-12 rounded-full bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border-2 border-golden-400/50 transition-all duration-300"
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
            className="w-12 h-12 rounded-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border-2 border-red-400/50 transition-all duration-300"
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
