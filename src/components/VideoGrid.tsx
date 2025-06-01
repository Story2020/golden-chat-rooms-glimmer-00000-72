import { useEffect, useRef, useState } from 'react';
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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  console.log('VideoGrid rendering with participants:', participants);
  console.log('Current participant:', currentParticipant);

  // Request permissions on component mount
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        console.log('Requesting camera and microphone permissions...');
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        setStream(mediaStream);
        setHasPermissions(true);
        
        if (isVideoOn && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        console.log('Permissions granted and stream obtained');
        toast.success('تم الحصول على صلاحيات الكاميرا والميكروفون');
      } catch (error) {
        console.error('Permission denied or camera not available:', error);
        setHasPermissions(false);
        toast.error('لا يمكن الوصول إلى الكاميرا أو الميكروفون');
      }
    };

    requestPermissions();
    
    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle video on/off
  useEffect(() => {
    if (!stream || !videoRef.current) return;

    if (isVideoOn && hasPermissions) {
      videoRef.current.srcObject = stream;
      // Enable video track
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = true;
      }
    } else {
      // Disable video track but keep stream
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = false;
      }
    }
  }, [isVideoOn, stream, hasPermissions]);

  // Calculate grid columns based on number of participants and chat visibility
  const totalParticipants = participants.length;
  const gridCols = totalParticipants === 1 ? 'grid-cols-1' : 
                   totalParticipants === 2 ? 'grid-cols-1 md:grid-cols-2' :
                   totalParticipants <= 4 ? 'grid-cols-1 md:grid-cols-2' :
                   'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`${showChat ? 'lg:col-span-3' : 'lg:col-span-4'} grid ${gridCols} gap-4 h-full`}>
      {/* All Participants */}
      {participants.map((participant) => {
        const isCurrentUser = participant.id === currentParticipant?.id;
        return (
          <ParticipantCard
            key={participant.id}
            participant={participant}
            isCurrentUser={isCurrentUser}
            videoRef={isCurrentUser ? videoRef : undefined}
            isVideoOn={isCurrentUser ? isVideoOn : !participant.is_video_off}
            hasPermissions={isCurrentUser ? hasPermissions : true}
          />
        );
      })}
    </div>
  );
};

export default VideoGrid;
