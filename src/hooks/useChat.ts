
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [roomId, setRoomId] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isSetupRef = useRef(false);

  const loadMessages = useCallback(async (roomId: string) => {
    try {
      console.log('Loading messages for room:', roomId);

      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          participants (
            display_name
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      console.log('Messages loaded:', messagesData?.length || 0);
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error in loadMessages:', error);
    }
  }, []);

  useEffect(() => {
    if (!participantId || !roomCode || isSetupRef.current) {
      return;
    }

    const setupChat = async () => {
      try {
        console.log('Setting up chat for:', roomCode);
        setIsLoading(true);
        isSetupRef.current = true;
        
        // Get room ID
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .select('id')
          .eq('room_code', roomCode)
          .single();

        if (roomError || !room) {
          console.error('Room not found for chat:', roomError);
          toast.error('خطأ في تحميل الدردشة');
          return;
        }

        setRoomId(room.id);
        await loadMessages(room.id);

        // Setup real-time subscription
        const channel = supabase
          .channel(`chat-messages-${room.id}-${Date.now()}`)
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
              
              try {
                const { data: participant } = await supabase
                  .from('participants')
                  .select('display_name')
                  .eq('id', payload.new.participant_id)
                  .single();

                const newMsg = {
                  ...payload.new,
                  participants: participant
                } as Message;

                setMessages(prev => {
                  const exists = prev.some(msg => msg.id === newMsg.id);
                  if (exists) return prev;
                  return [...prev, newMsg];
                });
              } catch (error) {
                console.error('Error processing new message:', error);
              }
            }
          )
          .subscribe((status) => {
            console.log('Chat subscription status:', status);
            if (status === 'SUBSCRIBED') {
              console.log('Chat subscription active');
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
  }, [roomCode, participantId, loadMessages]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !participantId || !roomId || isLoading) {
      console.log('Cannot send message - missing requirements');
      return;
    }

    const messageText = newMessage.trim();
    console.log('Sending message:', messageText);
    
    setNewMessage('');

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          participant_id: participantId,
          message: messageText
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error('خطأ في إرسال الرسالة');
        setNewMessage(messageText);
        return;
      }

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText);
    } finally {
      setIsLoading(false);
    }
  }, [newMessage, participantId, roomId, isLoading]);

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    isLoading
  };
};
