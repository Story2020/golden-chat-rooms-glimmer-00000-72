
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
}

const ParticipantCard = ({ participant, isCurrentUser = false, videoRef, isVideoOn = true }: ParticipantCardProps) => {
  return (
    <Card className={`glass-card ${isCurrentUser ? 'border-2 border-golden-400/50' : 'border border-golden-400/30'} relative overflow-hidden ${isCurrentUser ? 'md:col-span-2' : ''}`}>
      <CardContent className="p-0 h-full relative">
        {isCurrentUser && isVideoOn ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
        ) : isCurrentUser && !isVideoOn ? (
          <div className="w-full h-full bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-golden-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-bold text-2xl">
                  {participant.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-golden-200 font-semibold">{participant.display_name}</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-golden-gradient rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-black font-bold text-xl">
                  {participant.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* User Info Overlay */}
        <div className={`absolute ${isCurrentUser ? 'bottom-4 left-4' : 'bottom-2 left-2'} flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2`}>
          <span className={`text-golden-200 font-semibold ${isCurrentUser ? '' : 'text-sm'}`}>
            {participant.display_name}{isCurrentUser ? ' (أنت)' : ''}
          </span>
          <div className="flex gap-1">
            {participant.is_muted && <MicOff className={`${isCurrentUser ? 'w-4 h-4' : 'w-3 h-3'} text-red-400`} />}
            {participant.is_video_off && <VideoOff className={`${isCurrentUser ? 'w-4 h-4' : 'w-3 h-3'} text-red-400`} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticipantCard;
