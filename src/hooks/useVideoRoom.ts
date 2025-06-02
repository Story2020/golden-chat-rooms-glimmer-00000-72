
import { useEffect, useRef } from 'react';
import { UseVideoRoomProps } from '@/types/video-room';
import { useParticipants } from './useParticipants';
import { useRoom } from './useRoom';
import { useMediaControls } from './useMediaControls';

export const useVideoRoom = ({ roomCode, userName }: UseVideoRoomProps) => {
  const isInitialized = useRef(false);
  
  const { roomId, getRoomId } = useRoom();
  const {
    participants,
    currentParticipant,
    loadParticipants,
    addParticipant,
    setupParticipantSubscription,
    updateParticipant,
    leaveRoom,
    cleanup
  } = useParticipants();

  const {
    isVideoOn,
    isAudioOn,
    toggleVideo,
    toggleAudio
  } = useMediaControls(updateParticipant, currentParticipant?.id);

  useEffect(() => {
    if (!roomCode || !userName || isInitialized.current) return;

    const initializeRoom = async () => {
      try {
        console.log('Initializing room:', roomCode);
        isInitialized.current = true;

        const foundRoomId = await getRoomId(roomCode);
        if (!foundRoomId) return;

        const participant = await addParticipant(foundRoomId, userName);
        if (!participant) return;

        await loadParticipants(foundRoomId);
        setupParticipantSubscription(foundRoomId);

      } catch (error) {
        console.error('Error initializing room:', error);
      }
    };

    initializeRoom();

    return cleanup;
  }, [roomCode, userName, getRoomId, addParticipant, loadParticipants, setupParticipantSubscription, cleanup]);

  return {
    participants,
    currentParticipant,
    isVideoOn,
    isAudioOn,
    toggleVideo,
    toggleAudio,
    leaveRoom,
    roomId
  };
};
