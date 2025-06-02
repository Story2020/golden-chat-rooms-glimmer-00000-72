
import { useEffect, useRef, useState, useCallback } from 'react';
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
  const [permissionRequested, setPermissionRequested] = useState(false);

  console.log('VideoGrid rendering with participants:', participants.length);
  console.log('Current participant:', currentParticipant?.display_name);

  // Function to request media permissions with better error handling
  const requestPermissions = useCallback(async () => {
    if (permissionRequested) return;
    
    setPermissionRequested(true);
    let mediaStream: MediaStream | null = null;

    try {
      console.log('Requesting camera and microphone permissions...');
      
      // Try to get both video and audio first
      mediaStream = await navigator.mediaDevices.getUserMedia({ 
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
      
      console.log('Full media permissions granted');
      setStream(mediaStream);
      setHasPermissions(true);
      toast.success('تم الحصول على صلاحيات الكاميرا والميكروفون');
      
    } catch (error) {
      console.error('Error getting full media permissions:', error);
      
      // Try audio only as fallback
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        console.log('Audio-only permissions granted');
        setStream(mediaStream);
        setHasPermissions(false); // No video permission
        toast.warning('تم الحصول على صلاحية الميكروفون فقط');
        
      } catch (audioError) {
        console.error('Failed to get any media permissions:', audioError);
        setHasPermissions(false);
        
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            toast.error('تم رفض صلاحيات الكاميرا والميكروفون. يرجى السماح بالوصول من إعدادات المتصفح.');
          } else if (error.name === 'NotFoundError') {
            toast.error('لم يتم العثور على كاميرا أو ميكروفون');
          } else {
            toast.error('خطأ في الوصول إلى الكاميرا أو الميكروفون');
          }
        }
      }
    }

    return mediaStream;
  }, [permissionRequested]);

  // Auto-request permissions on component mount
  useEffect(() => {
    requestPermissions();
    
    // Cleanup function
    return () => {
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
      
      // Clear video element if no video
      if (videoRef.current) {
        videoRef.current.srcObject = null;
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
