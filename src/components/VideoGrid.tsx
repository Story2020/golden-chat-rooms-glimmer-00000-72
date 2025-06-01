import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import ParticipantCard from './ParticipantCard';

interface Participant {
  id: string;
  display_name: string;
  is_muted: boolean;
  is_video_off: boolean;
  is_online: boolean;
  user_id: string;
}

interface VideoGridProps {
  participants: Participant[];
  currentParticipant: Participant | null;
  userName: string;
  isVideoOn: boolean;
  showChat: boolean;
}

const VideoGrid = ({ participants, currentParticipant, userName, isVideoOn, showChat }: VideoGridProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const currentUserParticipant = currentParticipant ? {
    ...currentParticipant,
    display_name: userName
  } : null;

  return (
    <div className={`${showChat ? 'lg:col-span-3' : 'lg:col-span-4'} grid grid-cols-1 md:grid-cols-2 gap-4`}>
      {/* Current User Video */}
      {currentUserParticipant && (
        <ParticipantCard
          participant={currentUserParticipant}
          isCurrentUser={true}
          videoRef={videoRef}
          isVideoOn={isVideoOn}
        />
      )}

      {/* Other Participants */}
      {participants.filter(p => p.id !== currentParticipant?.id).map((participant) => (
        <ParticipantCard
          key={participant.id}
          participant={participant}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
