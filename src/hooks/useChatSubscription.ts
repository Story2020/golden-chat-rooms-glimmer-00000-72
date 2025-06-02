
import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export const useChatSubscription = (onNewMessage: (message: Message) => void) => {
  const cleanupRef = useRef<(() => void) | null>(null);

  const setupSubscription = useCallback((roomId: string) => {
    const channel = supabase
      .channel(`chat-messages-${roomId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
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

            onNewMessage(newMsg);
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
  }, [onNewMessage]);

  const cleanup = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
    }
  }, []);

  return {
    setupSubscription,
    cleanup
  };
};
