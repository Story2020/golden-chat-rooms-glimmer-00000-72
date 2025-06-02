
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message } from '@/types/chat';

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);

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

  const addMessage = useCallback((newMessage: Message) => {
    setMessages(prev => {
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) return prev;
      return [...prev, newMessage];
    });
  }, []);

  const sendMessage = useCallback(async (
    messageText: string, 
    participantId: string, 
    roomId: string
  ) => {
    try {
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
        return false;
      }

      console.log('Message sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, []);

  return {
    messages,
    loadMessages,
    addMessage,
    sendMessage
  };
};
