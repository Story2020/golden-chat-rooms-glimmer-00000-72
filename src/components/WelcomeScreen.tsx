
import { useState } from 'react';
import { Video, Users, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface WelcomeScreenProps {
  onJoinRoom: (roomCode: string, userName: string) => void;
}

const WelcomeScreen = ({ onJoinRoom }: WelcomeScreenProps) => {
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generateRoomCode = async () => {
    setIsLoading(true);
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create room in database
      const { error } = await supabase
        .from('rooms')
        .insert({
          room_code: code,
          is_active: true
        });

      if (error) throw error;

      setRoomCode(code);
      setIsCreating(true);
      toast.success(`تم إنشاء الغرفة بكود: ${code}`);
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('خطأ في إنشاء الغرفة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!roomCode.trim()) {
      toast.error('يرجى إدخال كود الغرفة');
      return;
    }
    if (!userName.trim()) {
      toast.error('يرجى إدخال اسمك');
      return;
    }

    setIsLoading(true);
    try {
      // Check if room exists
      const { data: room, error } = await supabase
        .from('rooms')
        .select('id, is_active')
        .eq('room_code', roomCode.toUpperCase())
        .single();

      if (error || !room) {
        toast.error('الغرفة غير موجودة');
        return;
      }

      if (!room.is_active) {
        toast.error('الغرفة غير نشطة');
        return;
      }

      onJoinRoom(roomCode.toUpperCase(), userName);
    } catch (error) {
      console.error('Error checking room:', error);
      toast.error('خطأ في التحقق من الغرفة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-golden-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-golden-600/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-golden-400/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-golden-gradient rounded-full shadow-lg animate-golden-glow">
            <Video className="w-10 h-10 text-black icon-3d" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-golden-300 to-golden-500 bg-clip-text text-transparent">
            الفيديو شات الذهبي
          </h1>
          <p className="text-golden-200/80 text-lg">
            تواصل مع الأصدقاء في غرف خاصة آمنة
          </p>
        </div>

        {/* Main Card */}
        <Card className="glass-card border-2 border-golden-400/30 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-golden-300 flex items-center justify-center gap-2">
              <Users className="w-6 h-6 icon-3d" />
              انضم إلى غرفة فيديو
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="space-y-4">
              <div>
                <label className="block text-golden-200 mb-2 font-semibold">اسمك</label>
                <Input
                  type="text"
                  placeholder="أدخل اسمك"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-black/50 border-golden-400/50 text-golden-100 placeholder-golden-300/50 
                           focus:border-golden-400 focus:ring-golden-400/30 h-12"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-golden-200 mb-2 font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 icon-3d" />
                  كود الغرفة
                </label>
                <Input
                  type="text"
                  placeholder="أدخل كود الغرفة"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="bg-black/50 border-golden-400/50 text-golden-100 placeholder-golden-300/50 
                           focus:border-golden-400 focus:ring-golden-400/30 h-12 tracking-widest"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleJoin}
                className="golden-button w-full h-12 text-lg font-bold"
                disabled={!roomCode.trim() || !userName.trim() || isLoading}
              >
                <Video className="w-5 h-5 ml-2 icon-3d" />
                {isLoading ? 'جاري التحقق...' : 'دخول الغرفة'}
              </Button>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-golden-400/30"></div>
                <span className="text-golden-300/70 text-sm">أو</span>
                <div className="flex-1 h-px bg-golden-400/30"></div>
              </div>

              <Button
                onClick={generateRoomCode}
                variant="outline"
                className="w-full h-12 border-2 border-golden-400/50 bg-transparent text-golden-300 
                         hover:bg-golden-400/10 hover:border-golden-400 transition-all duration-300
                         hover:shadow-lg hover:scale-105"
                disabled={isLoading}
              >
                <Sparkles className="w-5 h-5 ml-2 icon-3d" />
                {isLoading ? 'جاري الإنشاء...' : 'إنشاء غرفة جديدة'}
              </Button>
            </div>

            {isCreating && (
              <div className="bg-golden-400/10 border border-golden-400/30 rounded-lg p-4 text-center">
                <p className="text-golden-200 text-sm mb-2">
                  كود الغرفة الجديدة:
                </p>
                <p className="text-golden-300 font-bold text-xl tracking-widest">
                  {roomCode}
                </p>
                <p className="text-golden-200/70 text-xs mt-2">
                  شارك هذا الكود مع الأصدقاء للانضمام
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="glass-card p-4 border border-golden-400/20">
            <Video className="w-8 h-8 text-golden-400 mx-auto mb-2 icon-3d" />
            <p className="text-golden-200 text-sm">فيديو عالي الجودة</p>
          </div>
          <div className="glass-card p-4 border border-golden-400/20">
            <Lock className="w-8 h-8 text-golden-400 mx-auto mb-2 icon-3d" />
            <p className="text-golden-200 text-sm">غرف آمنة</p>
          </div>
          <div className="glass-card p-4 border border-golden-400/20">
            <Users className="w-8 h-8 text-golden-400 mx-auto mb-2 icon-3d" />
            <p className="text-golden-200 text-sm">دردشة جماعية</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
