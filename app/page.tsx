"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";
import Sidebar from "./components/Sidebar";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import Auth from "./components/Auth";

type Message = {
  id: number;
  user: string;
  user_id: string;
  text: string;
  self: boolean;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    async function loadMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) console.error(error);
      else setMessages(data.map((m) => ({ ...m, self: m.user_id === user!.id })));
    }

    loadMessages();

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => [...prev, { ...m, self: m.user_id === user!.id }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function addMessage(text: string) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user?.id)
      .single();

    const { error } = await supabase
      .from("messages")
      .insert({ text, user: profile?.username, user_id: user?.id });

    if (error) console.error(error);
  }

  if (!user) return <Auth />;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <MessageList messages={messages} />
        <MessageInput onSend={addMessage} />
      </div>
    </div>
  );
}