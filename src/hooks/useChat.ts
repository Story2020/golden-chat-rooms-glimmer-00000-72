
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UseChatProps } from '@/types/chat';
import { useMessages } from './useMessages';
import { useChatSubscription } from './useChatSubscription';

export const useChat = ({ roomCode, participantId }: UseChatProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const isSetupRef = useRef(false);

  const { messages, loadMessages, addMessage, sendMessage: sendMessageToDb } = useMessages();
  const { setupSubscription, cleanup } = useChatSubscription(addMessage);

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
        setupSubscription(room.id);

      } catch (error) {
        console.error('Error setting up chat:', error);
        toast.error('خطأ في إعداد الدردشة');
      } finally {
        setIsLoading(false);
      }
    };

    setupChat();

    return cleanup;
  }, [roomCode, participantId, loadMessages, setupSubscription, cleanup]);

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

      const success = await sendMessageToDb(messageText, participantId, roomId);
      
      if (!success) {
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
  }, [newMessage, participantId, roomId, isLoading, sendMessageToDb]);

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    isLoading
  };
};
