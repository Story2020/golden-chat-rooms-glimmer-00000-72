
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [isLoading, setIsLoading] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!participantId) {
      console.log('No participant ID, skipping chat setup');
      return;
    }

    const setupChat = async () => {
      try {
        console.log('Setting up chat for room:', roomCode, 'participant:', participantId);
        setIsLoading(true);
        
        // Get room ID
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .select('id')
          .eq('room_code', roomCode)
          .single();

        if (roomError || !room) {
          console.error('Room not found for chat:', roomError);
          toast.error('لا يمكن تحميل الدردشة - الغرفة غير موجودة');
          return;
        }

        console.log('Loading messages for room ID:', room.id);

        // Load existing messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            participants (
              display_name
            )
          `)
          .eq('room_id', room.id)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error loading messages:', messagesError);
          toast.error('خطأ في تحميل الرسائل');
        } else {
          console.log('Messages loaded successfully:', messagesData?.length || 0, 'messages');
          setMessages(messagesData || []);
        }

        // Set up real-time subscription for new messages
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
              console.log('New message received via subscription:', payload);
              
              // Get participant info for the new message
              const { data: participant } = await supabase
                .from('participants')
                .select('display_name')
                .eq('id', payload.new.participant_id)
                .single();

              const newMsg = {
                ...payload.new,
                participants: participant
              } as Message;

              console.log('Adding new message to state:', newMsg);
              setMessages(prev => {
                // Avoid duplicates
                const exists = prev.some(msg => msg.id === newMsg.id);
                if (exists) return prev;
                return [...prev, newMsg];
              });
            }
          )
          .subscribe((status) => {
            console.log('Chat subscription status:', status);
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to chat updates');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Chat subscription error');
              toast.error('خطأ في الاتصال بالدردشة');
            }
          });

        cleanupRef.current = () => {
          console.log('Cleaning up chat subscription');
          supabase.removeChannel(channel);
        };

      } catch (error) {
        console.error('Error setting up chat:', error);
        toast.error('خطأ في إعداد الدردشة');
      } finally {
        setIsLoading(false);
      }
    };

    setupChat();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [roomCode, participantId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !participantId || isLoading) {
      console.log('Cannot send message: missing content, participant ID, or loading');
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      console.log('Sending message:', messageText);
      setIsLoading(true);
      
      const { data: room } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_code', roomCode)
        .single();

      if (!room) {
        console.error('Room not found when sending message');
        toast.error('خطأ في إرسال الرسالة - الغرفة غير موجودة');
        setNewMessage(messageText); // Restore message on error
        return;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: room.id,
          participant_id: participantId,
          message: messageText
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error('خطأ في إرسال الرسالة');
        setNewMessage(messageText); // Restore message on error
        throw error;
      }

      console.log('Message sent successfully');
      toast.success('تم إرسال الرسالة');
    } catch (error) {
      console.error('Error sending message:', error);
      // Message is already restored above in case of error
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    isLoading
  };
};
