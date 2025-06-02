
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
      console.log('Loading messages for room ID:', roomId);

      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          participants (
            display_name
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        throw messagesError;
      }

      console.log('Messages loaded successfully:', messagesData?.length || 0, 'messages');
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error in loadMessages:', error);
      toast.error('خطأ في تحميل الرسائل');
    }
  }, []);

  useEffect(() => {
    if (!participantId || !roomCode || isSetupRef.current) {
      console.log('Skipping chat setup:', { participantId, roomCode, alreadySetup: isSetupRef.current });
      return;
    }

    const setupChat = async () => {
      try {
        console.log('Setting up chat for room:', roomCode, 'participant:', participantId);
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
          toast.error('لا يمكن تحميل الدردشة - الغرفة غير موجودة');
          return;
        }

        setRoomId(room.id);

        // Load existing messages
        await loadMessages(room.id);

        // Set up real-time subscription for new messages
        const channel = supabase
          .channel(`room-messages-${room.id}-${Date.now()}`)
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
              
              try {
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
                  if (exists) {
                    console.log('Message already exists, skipping');
                    return prev;
                  }
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
  }, [roomCode, participantId, loadMessages]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !participantId || !roomId || isLoading) {
      console.log('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasParticipant: !!participantId, 
        hasRoom: !!roomId, 
        isLoading 
      });
      return;
    }

    const messageText = newMessage.trim();
    console.log('Attempting to send message:', messageText);
    
    // Clear input immediately for better UX
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
        setNewMessage(messageText); // Restore message on error
        throw error;
      }

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      // Message is already restored above in case of error
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
