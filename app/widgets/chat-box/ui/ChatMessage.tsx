'use client';

interface Msg {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe?: boolean;
}

interface Props {
  msg: Msg;
  avatarColor: string;
}

export default function ChatMessage({ msg, avatarColor }: Props) {
  return (
    <div className={`flex gap-2 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
      {!msg.isMe && (
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: avatarColor }}>
          {msg.sender[0]}
        </div>
      )}
      <div className={`max-w-[75%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        {!msg.isMe && <span className="text-[10px] text-[#5A5C58] mb-0.5 font-medium">{msg.sender}</span>}
        <div className={`px-3 py-2 rounded-2xl text-[12px] leading-relaxed ${msg.isMe ? 'bg-[#6B2D3E] text-white rounded-tr-sm' : 'bg-white border border-[#E5E5DF] text-[#2D2D2D] rounded-tl-sm'}`}>
          {msg.text}
        </div>
        <span className="text-[10px] text-[#9CA3AF] mt-0.5">{msg.time}</span>
      </div>
    </div>
  );
}
