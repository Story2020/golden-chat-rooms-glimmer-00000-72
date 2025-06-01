
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
    if (!participantId) {
      console.log('No participant ID, skipping chat setup');
      return;
    }

    const loadMessages = async () => {
      try {
        console.log('Loading messages for room:', roomCode);
        
        const { data: room } = await supabase
          .from('rooms')
          .select('id')
          .eq('room_code', roomCode)
          .single();

        if (!room) {
          console.error('Room not found for chat');
          return;
        }

        console.log('Loading messages for room ID:', room.id);

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

        if (error) {
          console.error('Error loading messages:', error);
          throw error;
        }

        console.log('Messages loaded:', data);
        setMessages(data || []);

        // Listen for new messages
        const channel = supabase
          .channel(`room-messages-${room.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `room_id=eq.${room.id}`
            },
            async (payload) => {
              console.log('New message received:', payload);
              
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
          .subscribe((status) => {
            console.log('Chat subscription status:', status);
          });

        return () => {
          console.log('Cleaning up chat subscription');
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [roomCode, participantId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !participantId) {
      console.log('Cannot send message: missing content or participant ID');
      return;
    }

    try {
      console.log('Sending message:', newMessage);
      
      const { data: room } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_code', roomCode)
        .single();

      if (!room) {
        console.error('Room not found when sending message');
        return;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: room.id,
          participant_id: participantId,
          message: newMessage.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      console.log('Message sent successfully');
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
