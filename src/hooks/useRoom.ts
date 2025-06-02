
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRoom = () => {
  const [roomId, setRoomId] = useState<string | null>(null);

  const getRoomId = useCallback(async (roomCode: string) => {
    try {
      console.log('Getting room ID for:', roomCode);

      const { data: room, error } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_code', roomCode)
        .single();

      if (error || !room) {
        console.error('Room not found:', error);
        toast.error('الغرفة غير موجودة');
        return null;
      }

      setRoomId(room.id);
      return room.id;
    } catch (error) {
      console.error('Error getting room:', error);
      toast.error('خطأ في العثور على الغرفة');
      return null;
    }
  }, []);

  return {
    roomId,
    getRoomId
  };
};
