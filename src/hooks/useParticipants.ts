
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Participant } from '@/types/video-room';

export const useParticipants = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

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

  const addParticipant = useCallback(async (roomId: string, userName: string) => {
    try {
      const { data: participant, error } = await supabase
        .from('participants')
        .insert({
          room_id: roomId,
          display_name: userName,
          is_muted: false,
          is_video_off: false,
          is_online: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding participant:', error);
        toast.error('خطأ في الانضمام إلى الغرفة');
        return null;
      }

      console.log('Participant created:', participant);
      setCurrentParticipant(participant);
      toast.success('تم الانضمام إلى الغرفة بنجاح');
      return participant;
    } catch (error) {
      console.error('Error in addParticipant:', error);
      toast.error('خطأ في إعداد الغرفة');
      return null;
    }
  }, []);

  const setupParticipantSubscription = useCallback((roomId: string) => {
    const channel = supabase
      .channel(`room-participants-${roomId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('Participant change:', payload);
          loadParticipants(roomId);
        }
      )
      .subscribe((status) => {
        console.log('Participant subscription status:', status);
      });

    cleanupRef.current = () => {
      console.log('Cleaning up participant subscription');
      supabase.removeChannel(channel);
    };
  }, [loadParticipants]);

  const updateParticipant = useCallback(async (participantId: string, updates: Partial<Participant>) => {
    try {
      const { error } = await supabase
        .from('participants')
        .update(updates)
        .eq('id', participantId);

      if (error) {
        console.error('Error updating participant:', error);
        return false;
      }

      setCurrentParticipant(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (error) {
      console.error('Error in updateParticipant:', error);
      return false;
    }
  }, []);

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

  const cleanup = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
    }
  }, []);

  return {
    participants,
    currentParticipant,
    loadParticipants,
    addParticipant,
    setupParticipantSubscription,
    updateParticipant,
    leaveRoom,
    cleanup
  };
};
