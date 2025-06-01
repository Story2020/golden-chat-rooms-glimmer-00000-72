import { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  MessageCircle, 
  PhoneOff,
  Settings,
  Share2,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import ChatPanel from './ChatPanel';
import { useVideoRoom } from '@/hooks/useVideoRoom';

interface VideoRoomProps {
  roomCode: string;
  userName: string;
  onLeaveRoom: () => void;
}

const VideoRoom = ({ roomCode, userName, onLeaveRoom }: VideoRoomProps) => {
  const [showChat, setShowChat] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    participants,
    currentParticipant,
    isVideoOn,
    isAudioOn,
    toggleVideo,
    toggleAudio,
    leaveRoom
  } = useVideoRoom({ roomCode, userName });

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.log('Camera access denied or not available');
        toast.error('لا يمكن الوصول إلى الكاميرا');
      }
    };

    startVideo();
  }, []);

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast.info(isScreenSharing ? 'تم إيقاف مشاركة الشاشة' : 'تم بدء مشاركة الشاشة');
  };

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

  const handleLeaveRoom = async () => {
    await leaveRoom();
    onLeaveRoom();
  };

  return (
    <div className="min-h-screen bg-black-glossy relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-golden-500/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-golden-600/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
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
                <span>{participants.length}</span>
              </div>
              <Button
                onClick={() => setShowChat(!showChat)}
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

      {/* Main Content */}
      <div className="relative z-10 flex-1 p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
        {/* Video Grid */}
        <div className={`${showChat ? 'lg:col-span-3' : 'lg:col-span-4'} grid grid-cols-1 md:grid-cols-2 gap-4`}>
          {/* Main Video (Current User) */}
          <Card className="glass-card border-2 border-golden-400/50 relative overflow-hidden md:col-span-2">
            <CardContent className="p-0 h-full relative">
              {isVideoOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-golden-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-black font-bold text-2xl">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-golden-200 font-semibold">{userName}</p>
                  </div>
                </div>
              )}
              
              {/* User Info Overlay */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-golden-200 font-semibold">{userName} (أنت)</span>
                <div className="flex gap-1">
                  {!isAudioOn && <MicOff className="w-4 h-4 text-red-400" />}
                  {!isVideoOn && <VideoOff className="w-4 h-4 text-red-400" />}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Participants */}
          {participants.filter(p => p.id !== currentParticipant?.id).map((participant) => (
            <Card key={participant.id} className="glass-card border border-golden-400/30 relative overflow-hidden">
              <CardContent className="p-0 h-full relative">
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-golden-gradient rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-black font-bold text-xl">
                        {participant.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Participant Info */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
                  <span className="text-golden-200 text-sm font-medium">{participant.display_name}</span>
                  <div className="flex gap-1">
                    {participant.is_muted && <MicOff className="w-3 h-3 text-red-400" />}
                    {participant.is_video_off && <VideoOff className="w-3 h-3 text-red-400" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chat Panel */}
        {showChat && currentParticipant && (
          <div className="lg:col-span-1">
            <ChatPanel roomCode={roomCode} participantId={currentParticipant.id} userName={userName} />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 p-4">
        <div className="glass-card border border-golden-400/30 p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={toggleAudio}
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
              onClick={toggleVideo}
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
              onClick={toggleScreenShare}
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
              onClick={handleLeaveRoom}
              className="w-12 h-12 rounded-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border-2 border-red-400/50 transition-all duration-300"
            >
              <PhoneOff className="w-5 h-5 icon-3d" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRoom;
