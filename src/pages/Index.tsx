
import { useState } from 'react';
import WelcomeScreen from '../components/WelcomeScreen';
import VideoRoom from '../components/VideoRoom';

const Index = () => {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  const handleJoinRoom = (roomCode: string, name: string) => {
    setCurrentRoom(roomCode);
    setUserName(name);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setUserName('');
  };

  return (
    <div className="min-h-screen bg-black-glossy overflow-hidden">
      {!currentRoom ? (
        <WelcomeScreen onJoinRoom={handleJoinRoom} />
      ) : (
        <VideoRoom 
          roomCode={currentRoom} 
          userName={userName} 
          onLeaveRoom={handleLeaveRoom} 
        />
      )}
    </div>
  );
};

export default Index;
