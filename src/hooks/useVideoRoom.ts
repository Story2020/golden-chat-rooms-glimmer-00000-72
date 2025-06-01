
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const joinRoom = async () => {
      try {
        // Check if room exists
        const { data: room } = await supabase
          .from('rooms')
          .select('id')
          .eq('room_code', roomCode)
          .single();

        if (!room) {
          toast.error('الغرفة غير موجودة');
          return;
        }

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

        if (error) throw error;

        setCurrentParticipant(participant);
        toast.success('تم الانضمام إلى الغرفة بنجاح');

        // Load all participants
        loadParticipants(room.id);

        // Listen for participant changes
        const channel = supabase
          .channel('room-participants')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'participants',
              filter: `room_id=eq.${room.id}`
            },
            () => {
              loadParticipants(room.id);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error joining room:', error);
        toast.error('خطأ في الانضمام إلى الغرفة');
      }
    };

    const loadParticipants = async (roomId: string) => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_online', true);

      if (error) {
        console.error('Error loading participants:', error);
        return;
      }

      setParticipants(data || []);
    };

    joinRoom();
  }, [roomCode, userName, isAudioOn, isVideoOn]);

  const toggleVideo = async () => {
    if (!currentParticipant) return;

    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);

    await supabase
      .from('participants')
      .update({ is_video_off: !newVideoState })
      .eq('id', currentParticipant.id);

    toast.info(newVideoState ? 'تم تشغيل الكاميرا' : 'تم إيقاف الكاميرا');
  };

  const toggleAudio = async () => {
    if (!currentParticipant) return;

    const newAudioState = !isAudioOn;
    setIsAudioOn(newAudioState);

    await supabase
      .from('participants')
      .update({ is_muted: !newAudioState })
      .eq('id', currentParticipant.id);

    toast.info(newAudioState ? 'تم تشغيل الصوت' : 'تم كتم الصوت');
  };

  const leaveRoom = async () => {
    if (!currentParticipant) return;

    try {
      await supabase
        .from('participants')
        .update({ is_online: false })
        .eq('id', currentParticipant.id);

      toast.info('تم مغادرة الغرفة');
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
