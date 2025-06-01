
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
      if (!isScreenSharing) {
        await navigator.mediaDevices.getDisplayMedia({ video: true });
        toast.success('تم بدء مشاركة الشاشة');
      } else {
        toast.info('تم إيقاف مشاركة الشاشة');
      }
      onToggleScreenShare();
    } catch (error) {
      console.error('Error with screen sharing:', error);
      toast.error('خطأ في مشاركة الشاشة');
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
    onLeaveRoom();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="glass-card border border-golden-400/30 p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handleToggleAudio}
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-full transition-all duration-300 ${
              isAudioOn 
                ? 'bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border-2 border-golden-400/50' 
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-2 border-red-400/50'
            }`}
          >
            {isAudioOn ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </Button>

          <Button
            onClick={handleToggleVideo}
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-full transition-all duration-300 ${
              isVideoOn 
                ? 'bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border-2 border-golden-400/50' 
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-2 border-red-400/50'
            }`}
          >
            {isVideoOn ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </Button>

          <Button
            onClick={handleToggleScreenShare}
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-full transition-all duration-300 ${
              isScreenSharing 
                ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-2 border-blue-400/50' 
                : 'bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border-2 border-golden-400/50'
            }`}
          >
            <Monitor className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border-2 border-golden-400/50"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <div className="w-px h-8 bg-golden-400/30 mx-2"></div>

          <Button
            onClick={handleLeaveRoom}
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border-2 border-red-400/50 transition-all duration-300"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
