
import { useState } from 'react';
import ChatPanel from './ChatPanel';
import VideoRoomHeader from './VideoRoomHeader';
import VideoGrid from './VideoGrid';
import VideoControls from './VideoControls';
import { useVideoRoom } from '@/hooks/useVideoRoom';

interface VideoRoomProps {
  roomCode: string;
  userName: string;
  onLeaveRoom: () => void;
}

const VideoRoom = ({ roomCode, userName, onLeaveRoom }: VideoRoomProps) => {
  const [showChat, setShowChat] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const {
    participants,
    currentParticipant,
    isVideoOn,
    isAudioOn,
    toggleVideo,
    toggleAudio,
    leaveRoom
  } = useVideoRoom({ roomCode, userName });

  const handleLeaveRoom = async () => {
    await leaveRoom();
    onLeaveRoom();
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  return (
    <div className="min-h-screen bg-black-glossy relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-golden-500/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-golden-600/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <VideoRoomHeader
        roomCode={roomCode}
        participantsCount={participants.length}
        showChat={showChat}
        onToggleChat={() => setShowChat(!showChat)}
      />

      {/* Main Content */}
      <div className="relative z-10 flex-1 p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
        {/* Video Grid */}
        <VideoGrid
          participants={participants}
          currentParticipant={currentParticipant}
          userName={userName}
          isVideoOn={isVideoOn}
          showChat={showChat}
        />

        {/* Chat Panel */}
        {showChat && currentParticipant && (
          <div className="lg:col-span-1">
            <ChatPanel roomCode={roomCode} participantId={currentParticipant.id} userName={userName} />
          </div>
        )}
      </div>

      {/* Controls */}
      <VideoControls
        isVideoOn={isVideoOn}
        isAudioOn={isAudioOn}
        isScreenSharing={isScreenSharing}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onToggleScreenShare={toggleScreenShare}
        onLeaveRoom={handleLeaveRoom}
      />
    </div>
  );
};

export default VideoRoom;
