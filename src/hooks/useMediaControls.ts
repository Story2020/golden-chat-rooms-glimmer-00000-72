
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useMediaControls = (updateParticipant: (id: string, updates: any) => Promise<boolean>, currentParticipantId?: string) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);

  const toggleVideo = useCallback(async () => {
    if (!currentParticipantId) {
      console.log('No current participant for video toggle');
      return;
    }

    const newVideoState = !isVideoOn;
    console.log('Toggling video:', newVideoState);

    setIsVideoOn(newVideoState);

    const success = await updateParticipant(currentParticipantId, { is_video_off: !newVideoState });
    
    if (!success) {
      setIsVideoOn(!newVideoState);
      toast.error('خطأ في تغيير حالة الكاميرا');
      return;
    }

    console.log('Video state updated successfully');
  }, [currentParticipantId, isVideoOn, updateParticipant]);

  const toggleAudio = useCallback(async () => {
    if (!currentParticipantId) {
      console.log('No current participant for audio toggle');
      return;
    }

    const newAudioState = !isAudioOn;
    console.log('Toggling audio:', newAudioState);

    setIsAudioOn(newAudioState);

    const success = await updateParticipant(currentParticipantId, { is_muted: !newAudioState });
    
    if (!success) {
      setIsAudioOn(!newAudioState);
      toast.error('خطأ في تغيير حالة الصوت');
      return;
    }

    console.log('Audio state updated successfully');
  }, [currentParticipantId, isAudioOn, updateParticipant]);

  return {
    isVideoOn,
    isAudioOn,
    toggleVideo,
    toggleAudio
  };
};
