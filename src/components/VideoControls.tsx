
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
  const handleToggleScreenShare = () => {
    onToggleScreenShare();
    toast.info(isScreenSharing ? 'تم إيقاف مشاركة الشاشة' : 'تم بدء مشاركة الشاشة');
  };

  return (
    <div className="relative z-10 p-4">
      <div className="glass-card border border-golden-400/30 p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={onToggleAudio}
            className={`w-12 h-12 rounded-full transition-all duration-300 ${
              isAudioOn 
                ? 'bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border-2 border-golden-400/50' 
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-2 border-red-400/50'
            }`}
          >
            {isAudioOn ? (
              <Mic className="w-5 h-5 icon-3d" />
            ) : (
              <MicOff className="w-5 h-5 icon-3d" />
            )}
          </Button>

          <Button
            onClick={onToggleVideo}
            className={`w-12 h-12 rounded-full transition-all duration-300 ${
              isVideoOn 
                ? 'bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border-2 border-golden-400/50' 
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-2 border-red-400/50'
            }`}
          >
            {isVideoOn ? (
              <Video className="w-5 h-5 icon-3d" />
            ) : (
              <VideoOff className="w-5 h-5 icon-3d" />
            )}
          </Button>

          <Button
            onClick={handleToggleScreenShare}
            className={`w-12 h-12 rounded-full transition-all duration-300 ${
              isScreenSharing 
                ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-2 border-blue-400/50' 
                : 'bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border-2 border-golden-400/50'
            }`}
          >
            <Monitor className="w-5 h-5 icon-3d" />
          </Button>

          <Button
            variant="ghost"
            className="w-12 h-12 rounded-full bg-golden-600/20 hover:bg-golden-600/30 text-golden-300 border-2 border-golden-400/50"
          >
            <Settings className="w-5 h-5 icon-3d" />
          </Button>

          <div className="w-px h-8 bg-golden-400/30 mx-2"></div>

          <Button
            onClick={onLeaveRoom}
            className="w-12 h-12 rounded-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border-2 border-red-400/50 transition-all duration-300"
          >
            <PhoneOff className="w-5 h-5 icon-3d" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
