"use client";

import { useEffect, useRef } from "react";

type Message = {
  id: number;
  user: string;
  text: string;
  self: boolean;
  created_at: string;
};

export default function MessageList({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function formatTime(isoString: string) {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex-1 flex flex-col gap-4 p-6 overflow-y-auto bg-white">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col max-w-sm ${message.self ? "self-end items-end" : "self-start items-start"}`}
        >
          <span className="text-xs text-gray-400 mb-1">{message.user}</span>
          <div className={`px-4 py-2 rounded-2xl text-sm ${message.self ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"}`}>
            {message.text}
          </div>
          <span className={`mt-1 text-[10px] text-gray-400 ${message.self ? "text-right" : ""}`}>
            {formatTime(message.created_at)}
          </span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}