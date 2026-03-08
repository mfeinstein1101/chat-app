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
  channel_id: number;
  created_at: string;
};

type Channel = {
  id: number;
  name: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [username, setUsername] = useState<string>("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

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

    async function loadChannels() {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order("id", { ascending: true });

      if (error) console.error(error);
      else {
        setChannels(data);
        setActiveChannel(data[0] ?? null);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user!.id)
        .single();

      if (profile?.username) setUsername(profile.username);
    }

    loadChannels();
  }, [user]);

  useEffect(() => {
    if (!user || !username) return;

    const presenceChannel = supabase.channel("online-users");

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const users = Object.values(state)
          .flat()
          .map((presence: any) => presence.username as string);
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ username, user_id: user.id });
        }
      });

    return () => {
      presenceChannel.untrack();
      supabase.removeChannel(presenceChannel);
    };
  }, [user, username]);

  useEffect(() => {
    if (!user || !activeChannel) return;

    async function loadMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", activeChannel!.id)
        .order("created_at", { ascending: true });

      if (error) console.error(error);
      else setMessages(data.map((m) => ({ ...m, self: m.user_id === user!.id })));
    }

    loadMessages();

    const channel = supabase
      .channel(`messages:${activeChannel.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${activeChannel.id}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => [...prev, { ...m, self: m.user_id === user!.id }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeChannel]);

  async function addMessage(text: string) {
    const { error } = await supabase
      .from("messages")
      .insert({ text, user: username, user_id: user?.id, channel_id: activeChannel?.id });

    if (error) console.error(error);
  }

  if (!user) return <Auth />;

  return (
    <div className="flex h-screen">
      <Sidebar
        channels={channels}
        activeChannelId={activeChannel?.id ?? null}
        onChannelSelect={setActiveChannel}
        onlineUsers={onlineUsers}
      />
      <div className="flex flex-col flex-1">
        <MessageList messages={messages} />
        <MessageInput onSend={addMessage} />
      </div>
    </div>
  );
}
