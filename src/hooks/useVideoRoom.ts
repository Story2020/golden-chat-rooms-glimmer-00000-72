
import { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    const joinRoom = async () => {
      try {
        console.log('Joining room with code:', roomCode);
        
        // Check if room exists
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

        console.log('Room found:', room);
        setRoomId(room.id);

        // Add participant to room
        const { data: participant, error } = await supabase
          .from('participants')
          .insert({
            room_id: room.id,
            display_name: userName,
            is_muted: !isAudioOn,
            is_video_off: !isVideoOn,
            is_online: true
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding participant:', error);
          throw error;
        }

        console.log('Participant added:', participant);
        setCurrentParticipant(participant);
        toast.success('تم الانضمام إلى الغرفة بنجاح');

        // Load all participants initially
        await loadParticipants(room.id);

        // Listen for participant changes
        const channel = supabase
          .channel(`room-participants-${room.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'participants',
              filter: `room_id=eq.${room.id}`
            },
            (payload) => {
              console.log('Participant change detected:', payload);
              loadParticipants(room.id);
            }
          )
          .subscribe((status) => {
            console.log('Subscription status:', status);
          });

        cleanupRef.current = () => {
          console.log('Cleaning up subscription');
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error joining room:', error);
        toast.error('خطأ في الانضمام إلى الغرفة');
      }
    };

    const loadParticipants = async (roomId: string) => {
      console.log('Loading participants for room:', roomId);
      
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
    };

    if (roomCode && userName) {
      joinRoom();
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [roomCode, userName]);

  const toggleVideo = async () => {
    if (!currentParticipant) {
      console.log('No current participant for video toggle');
      return;
    }

    const newVideoState = !isVideoOn;
    console.log('Toggling video to:', newVideoState);

    try {
      const { error } = await supabase
        .from('participants')
        .update({ is_video_off: !newVideoState })
        .eq('id', currentParticipant.id);

      if (error) {
        console.error('Database error toggling video:', error);
        throw error;
      }

      setIsVideoOn(newVideoState);
      setCurrentParticipant(prev => prev ? { ...prev, is_video_off: !newVideoState } : null);

      console.log('Video state updated successfully:', newVideoState);
      toast.success(newVideoState ? 'تم تشغيل الكاميرا' : 'تم إيقاف الكاميرا');
    } catch (error) {
      console.error('Error toggling video:', error);
      toast.error('خطأ في تغيير حالة الكاميرا');
    }
  };

  const toggleAudio = async () => {
    if (!currentParticipant) {
      console.log('No current participant for audio toggle');
      return;
    }

    const newAudioState = !isAudioOn;
    console.log('Toggling audio to:', newAudioState);

    try {
      const { error } = await supabase
        .from('participants')
        .update({ is_muted: !newAudioState })
        .eq('id', currentParticipant.id);

      if (error) {
        console.error('Database error toggling audio:', error);
        throw error;
      }

      setIsAudioOn(newAudioState);
      setCurrentParticipant(prev => prev ? { ...prev, is_muted: !newAudioState } : null);

      console.log('Audio state updated successfully:', newAudioState);
      toast.success(newAudioState ? 'تم تشغيل الصوت' : 'تم كتم الصوت');
    } catch (error) {
      console.error('Error toggling audio:', error);
      toast.error('خطأ في تغيير حالة الصوت');
    }
  };

  const leaveRoom = async () => {
    if (!currentParticipant) return;

    try {
      console.log('Leaving room for participant:', currentParticipant.id);
      await supabase
        .from('participants')
        .update({ is_online: false })
        .eq('id', currentParticipant.id);

      console.log('Successfully left room');
      toast.success('تم مغادرة الغرفة');
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  return {
    participants,
    currentParticipant,
    isVideoOn,
    isAudioOn,
    toggleVideo,
    toggleAudio,
    leaveRoom
  };
};
