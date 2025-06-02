
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Participant {
  id: string;
  display_name: string;
  is_muted: boolean;
  is_video_off: boolean;
  is_online: boolean;
  user_id: string;
}

interface UseVideoRoomProps {
  roomCode: string;
  userName: string;
}

export const useVideoRoom = ({ roomCode, userName }: UseVideoRoomProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [roomId, setRoomId] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isInitialized = useRef(false);

  const loadParticipants = useCallback(async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_online', true);

      if (error) {
        console.error('Error loading participants:', error);
        return;
      }

      console.log('Participants loaded:', data);
      setParticipants(data || []);
    } catch (error) {
      console.error('Error in loadParticipants:', error);
    }
  }, []);

  // Initialize room and participant
  useEffect(() => {
    if (!roomCode || !userName || isInitialized.current) return;

    const initializeRoom = async () => {
      try {
        console.log('Initializing room:', roomCode);
        isInitialized.current = true;

        // Get room
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .select('id')
          .eq('room_code', roomCode)
          .single();

        if (roomError || !room) {
          console.error('Room not found:', roomError);
          toast.error('الغرفة غير موجودة');
          return;
        }

        setRoomId(room.id);

        // Add participant
        const { data: participant, error: participantError } = await supabase
          .from('participants')
          .insert({
            room_id: room.id,
            display_name: userName,
            is_muted: false,
            is_video_off: false,
            is_online: true
          })
          .select()
          .single();

        if (participantError) {
          console.error('Error adding participant:', participantError);
          toast.error('خطأ في الانضمام إلى الغرفة');
          return;
        }

        console.log('Participant created:', participant);
        setCurrentParticipant(participant);
        toast.success('تم الانضمام إلى الغرفة بنجاح');

        // Load participants
        await loadParticipants(room.id);

        // Setup real-time subscription
        const channel = supabase
          .channel(`room-participants-${room.id}-${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'participants',
              filter: `room_id=eq.${room.id}`
            },
            (payload) => {
              console.log('Participant change:', payload);
              loadParticipants(room.id);
            }
          )
          .subscribe((status) => {
            console.log('Participant subscription status:', status);
          });

        cleanupRef.current = () => {
          console.log('Cleaning up participant subscription');
          supabase.removeChannel(channel);
        };

      } catch (error) {
        console.error('Error initializing room:', error);
        toast.error('خطأ في إعداد الغرفة');
      }
    };

    initializeRoom();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [roomCode, userName, loadParticipants]);

  const toggleVideo = useCallback(async () => {
    if (!currentParticipant) {
      console.log('No current participant for video toggle');
      return;
    }

    const newVideoState = !isVideoOn;
    console.log('Toggling video:', newVideoState);

    // Update local state immediately
    setIsVideoOn(newVideoState);

    try {
      const { error } = await supabase
        .from('participants')
        .update({ is_video_off: !newVideoState })
        .eq('id', currentParticipant.id);

      if (error) {
        console.error('Error updating video state:', error);
        // Revert on error
        setIsVideoOn(!newVideoState);
        toast.error('خطأ في تغيير حالة الكاميرا');
        return;
      }

      // Update current participant
      setCurrentParticipant(prev => prev ? { ...prev, is_video_off: !newVideoState } : null);
      console.log('Video state updated successfully');

    } catch (error) {
      console.error('Error in toggleVideo:', error);
      setIsVideoOn(!newVideoState);
      toast.error('خطأ في تغيير حالة الكاميرا');
    }
  }, [currentParticipant, isVideoOn]);

  const toggleAudio = useCallback(async () => {
    if (!currentParticipant) {
      console.log('No current participant for audio toggle');
      return;
    }

    const newAudioState = !isAudioOn;
    console.log('Toggling audio:', newAudioState);

    // Update local state immediately
    setIsAudioOn(newAudioState);

    try {
      const { error } = await supabase
        .from('participants')
        .update({ is_muted: !newAudioState })
        .eq('id', currentParticipant.id);

      if (error) {
        console.error('Error updating audio state:', error);
        // Revert on error
        setIsAudioOn(!newAudioState);
        toast.error('خطأ في تغيير حالة الصوت');
        return;
      }

      // Update current participant
      setCurrentParticipant(prev => prev ? { ...prev, is_muted: !newAudioState } : null);
      console.log('Audio state updated successfully');

    } catch (error) {
      console.error('Error in toggleAudio:', error);
      setIsAudioOn(!newAudioState);
      toast.error('خطأ في تغيير حالة الصوت');
    }
  }, [currentParticipant, isAudioOn]);

  const leaveRoom = useCallback(async () => {
    if (!currentParticipant) return;

    try {
      await supabase
        .from('participants')
        .update({ is_online: false })
        .eq('id', currentParticipant.id);

      console.log('Left room successfully');
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }, [currentParticipant]);

  return {
    participants,
    currentParticipant,
    isVideoOn,
    isAudioOn,
    toggleVideo,
    toggleAudio,
    leaveRoom,
    roomId
  };
};
