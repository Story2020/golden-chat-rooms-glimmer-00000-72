
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

  console.log('VideoGrid rendering with participants:', participants.length);
  console.log('Current participant:', currentParticipant?.display_name);

  // Auto-request permissions on component mount
  useEffect(() => {
    let mounted = true;

    const requestPermissions = async () => {
      try {
        console.log('Auto-requesting camera and microphone permissions...');
        
        // Request both video and audio permissions automatically
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        console.log('Media stream obtained successfully');
        setStream(mediaStream);
        setHasPermissions(true);
        
        // Immediately set up video if enabled
        if (isVideoOn && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(e => console.log('Auto-play prevented:', e));
        }
        
        console.log('Permissions granted and stream set up successfully');
        toast.success('تم الحصول على صلاحيات الكاميرا والميكروفون');
      } catch (error) {
        console.error('Error getting media permissions:', error);
        
        if (!mounted) return;
        
        setHasPermissions(false);
        
        // Try to get at least audio if video fails
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (mounted) {
            setStream(audioStream);
            toast.warning('تم الحصول على صلاحية الميكروفون فقط');
          } else {
            audioStream.getTracks().forEach(track => track.stop());
          }
        } catch (audioError) {
          console.error('Failed to get audio as well:', audioError);
          if (mounted) {
            toast.error('لا يمكن الوصول إلى الكاميرا أو الميكروفون');
          }
        }
      }
    };

    // Auto-request permissions immediately
    requestPermissions();
    
    // Cleanup function
    return () => {
      mounted = false;
      if (stream) {
        console.log('Cleaning up media stream');
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped track:', track.kind);
        });
      }
    };
  }, []); // Empty dependency array to run only once

  // Handle video on/off state changes
  useEffect(() => {
    if (!stream || !videoRef.current) return;

    console.log('Video state changed:', isVideoOn, 'hasPermissions:', hasPermissions);

    if (isVideoOn && hasPermissions) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.log('Video play error:', e));
      
      // Enable video track
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = true;
        console.log('Video track enabled');
      }
    } else {
      // Disable video track but keep stream
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = false;
        console.log('Video track disabled');
      }
    }
  }, [isVideoOn, stream, hasPermissions]);

  // Calculate grid layout based on participants and chat visibility
  const totalParticipants = participants.length;
  const getGridCols = () => {
    if (totalParticipants === 1) return 'grid-cols-1';
    if (totalParticipants === 2) return 'grid-cols-1 md:grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-1 md:grid-cols-2';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  return (
    <div className={`${showChat ? 'lg:col-span-3' : 'lg:col-span-4'} grid ${getGridCols()} gap-4 h-full`}>
      {participants.map((participant) => {
        const isCurrentUser = participant.id === currentParticipant?.id;
        console.log('Rendering participant:', participant.display_name, 'isCurrentUser:', isCurrentUser);
        
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
