
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  message: string;
  participant_id: string;
  created_at: string;
  participants?: {
    display_name: string;
  };
}

interface UseChatProps {
  roomCode: string;
  participantId: string | null;
}

export const useChat = ({ roomCode, participantId }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!participantId) return;

    const loadMessages = async () => {
      try {
        const { data: room } = await supabase
          .from('rooms')
          .select('id')
          .eq('room_code', roomCode)
          .single();

        if (!room) return;

        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            participants (
              display_name
            )
          `)
          .eq('room_id', room.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setMessages(data || []);

        // Listen for new messages
        const channel = supabase
          .channel('room-messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `room_id=eq.${room.id}`
            },
            async (payload) => {
              // Get participant info for new message
              const { data: participant } = await supabase
                .from('participants')
                .select('display_name')
                .eq('id', payload.new.participant_id)
                .single();

              const newMsg = {
                ...payload.new,
                participants: participant
              } as Message;

              setMessages(prev => [...prev, newMsg]);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [roomCode, participantId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !participantId) return;

    try {
      const { data: room } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_code', roomCode)
        .single();

      if (!room) return;

      await supabase
        .from('messages')
        .insert({
          room_id: room.id,
          participant_id: participantId,
          message: newMessage.trim()
        });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage
  };
};
