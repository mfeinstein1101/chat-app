"use client";

import { useState } from "react";

export default function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  function handleSend() {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  }

  return (
    <div className="flex items-center gap-3 p-4 border-t border-gray-200 bg-white">
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-sm outline-none focus:border-blue-400"
      />
      <button
        onClick={handleSend}
        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600"
      >
        Send
      </button>
    </div>
  );
}