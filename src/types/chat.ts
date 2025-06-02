
export interface Message {
  id: string;
  message: string;
  participant_id: string;
  created_at: string;
  participants?: {
    display_name: string;
  };
}

export interface UseChatProps {
  roomCode: string;
  participantId: string | null;
}
