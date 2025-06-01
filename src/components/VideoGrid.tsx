
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
      if (!isVideoOn) return;
      
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

    // Cleanup function to stop video stream when component unmounts or video is turned off
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoOn]);

  // Stop video stream when video is turned off
  useEffect(() => {
    if (!isVideoOn && videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [isVideoOn]);

  const currentUserParticipant = currentParticipant ? {
    ...currentParticipant,
    display_name: userName
  } : null;

  // Calculate grid columns based on number of participants and chat visibility
  const totalParticipants = participants.length;
  const gridCols = totalParticipants === 1 ? 'grid-cols-1' : 
                   totalParticipants === 2 ? 'grid-cols-1 md:grid-cols-2' :
                   totalParticipants <= 4 ? 'grid-cols-1 md:grid-cols-2' :
                   'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`${showChat ? 'lg:col-span-3' : 'lg:col-span-4'} grid ${gridCols} gap-4 h-full`}>
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
          isCurrentUser={false}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
