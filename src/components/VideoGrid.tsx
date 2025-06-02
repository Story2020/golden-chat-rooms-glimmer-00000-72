
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
  const [permissionStatus, setPermissionStatus] = useState<'requesting' | 'granted' | 'denied' | 'idle'>('idle');

  console.log('VideoGrid rendering:', { 
    participantsCount: participants.length, 
    currentParticipant: currentParticipant?.display_name,
    isVideoOn,
    hasPermissions 
  });

  // Request media permissions
  const requestPermissions = useCallback(async () => {
    if (permissionStatus === 'requesting') return;
    
    setPermissionStatus('requesting');
    console.log('Requesting media permissions...');

    try {
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
      
      console.log('Media permissions granted:', mediaStream);
      setStream(mediaStream);
      setHasPermissions(true);
      setPermissionStatus('granted');
      toast.success('تم الحصول على صلاحيات الكاميرا والميكروفون');
      
    } catch (error) {
      console.error('Media permissions error:', error);
      setHasPermissions(false);
      setPermissionStatus('denied');
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast.error('تم رفض صلاحيات الكاميرا. يرجى السماح بالوصول من إعدادات المتصفح.');
        } else if (error.name === 'NotFoundError') {
          toast.error('لم يتم العثور على كاميرا أو ميكروفون');
        } else {
          toast.error('خطأ في الوصول إلى الكاميرا');
        }
      }
    }
  }, [permissionStatus]);

  // Initialize permissions on mount
  useEffect(() => {
    if (permissionStatus === 'idle') {
      requestPermissions();
    }

    return () => {
      if (stream) {
        console.log('Cleaning up media stream');
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, [requestPermissions]);

  // Handle video element and stream
  useEffect(() => {
    if (!stream || !videoRef.current) return;

    console.log('Setting video stream:', { isVideoOn, hasPermissions });

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
      // Disable video track
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = false;
        console.log('Video track disabled');
      }
    }
  }, [isVideoOn, stream, hasPermissions]);

  // Calculate grid layout
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
