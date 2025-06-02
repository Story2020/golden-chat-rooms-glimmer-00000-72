
export interface Participant {
  id: string;
  display_name: string;
  is_muted: boolean;
  is_video_off: boolean;
  is_online: boolean;
  user_id: string;
}

export interface UseVideoRoomProps {
  roomCode: string;
  userName: string;
}
