
import { MicOff, VideoOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Participant {
  id: string;
  display_name: string;
  is_muted: boolean;
  is_video_off: boolean;
  is_online: boolean;
  user_id: string;
}

interface ParticipantCardProps {
  participant: Participant;
  isCurrentUser?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
  isVideoOn?: boolean;
  hasPermissions?: boolean;
}

const ParticipantCard = ({ 
  participant, 
  isCurrentUser = false, 
  videoRef, 
  isVideoOn = true,
  hasPermissions = true
}: ParticipantCardProps) => {
  console.log('Rendering participant card:', participant, 'isCurrentUser:', isCurrentUser);
  
  const shouldShowVideo = isCurrentUser ? (isVideoOn && hasPermissions) : !participant.is_video_off;
  const isMuted = isCurrentUser ? !isVideoOn : participant.is_muted;

  return (
    <Card className={`glass-card ${isCurrentUser ? 'border-2 border-golden-400/50' : 'border border-golden-400/30'} relative overflow-hidden h-64 md:h-80`}>
      <CardContent className="p-0 h-full relative">
        {isCurrentUser && shouldShowVideo ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-lg"
          />
        ) : shouldShowVideo ? (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-golden-gradient rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-black font-bold text-xl">
                  {participant.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-golden-200 text-sm">فيديو المشارك</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-black/70 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-golden-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-bold text-2xl">
                  {participant.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-golden-200 font-semibold">{participant.display_name}</p>
              <p className="text-golden-300/70 text-sm mt-1">
                {isCurrentUser && !hasPermissions ? 'لا توجد صلاحيات للكاميرا' : 'الكاميرا مغلقة'}
              </p>
            </div>
          </div>
        )}
        
        {/* User Info Overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
          <span className="text-golden-200 font-semibold text-sm">
            {participant.display_name}{isCurrentUser ? ' (أنت)' : ''}
          </span>
          <div className="flex gap-1">
            {(isCurrentUser ? !isVideoOn : participant.is_muted) && <MicOff className="w-4 h-4 text-red-400" />}
            {!shouldShowVideo && <VideoOff className="w-4 h-4 text-red-400" />}
            {participant.is_online && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"></div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticipantCard;
