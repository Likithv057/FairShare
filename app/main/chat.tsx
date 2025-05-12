import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, FlatList, Alert, Keyboard, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import supabase from "@/lib/supabase";
import { hp, wp } from "@/helpers/common";
import ScreenWrapper from "@/components/ScreenWrapper";
import UserHeader from "@/components/UserHeader";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Theme } from "@/constants/theme";
import Icon from "@/assets/icons";
import Input from "@/components/Input";
import MessageDisplay from "@/components/MessageDisplay";
import Button from "@/components/Button";

const Chat: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const styles = getStyles(theme);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  const flatListRef = useRef<FlatList>(null); // Change ref type

  const fetchMessages = async () => {
    if (!groupId) return;

    const { data, error } = await supabase
      .from("messages")
      .select(`
        id,
        content,
        created_at,
        sender:users (
          id,
          name
        )
      `)
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setMessages(data);
  };

  const fetchAdminStatus = async () => {
    if (!user?.id || !groupId) return;

    const { data, error } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (!error && data?.role === "admin") {
      setIsAdmin(true);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Message cannot be empty.");
      return;
    }

    const { error } = await supabase.from("messages").insert([
      { group_id: groupId, sender_id: user?.id, content: message },
    ]);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setMessage("");
    fetchMessages();
    Keyboard.dismiss();
  };

  const deleteMessage = async (messageId: number) => {
    Alert.alert("Delete Message", "Are you sure you want to delete this message?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("messages").delete().eq("id", messageId);
          if (error) {
            Alert.alert("Error", error.message);
          } else {
            fetchMessages();
          }
        },
      },
    ]);
  };

  const clearAllMessages = async () => {
    Alert.alert("Clear All", "Are you sure you want to delete all messages?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Clear All",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("messages").delete().eq("group_id", groupId);
          if (error) {
            Alert.alert("Error", error.message);
          } else {
            fetchMessages();
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchMessages();
    fetchAdminStatus();

    const channel = supabase
      .channel("chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <ScreenWrapper>
      <UserHeader title="Group Chat" />
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable onPress={item.sender.id === user?.id ? () => deleteMessage(item.id) : undefined}>
              <MessageDisplay
                sender={item.sender.id === user?.id ? "You" : item.sender.name}
                content={item.content}
                timestamp={new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                isCurrentUser={item.sender.id === user?.id}
              />
            </Pressable>
          )}
        />
        <View style={styles.inputContainer}>
          <Input
            icon={<Icon name="texticon" />}
            value={message}
            onChangeText={setMessage}
            placeholder="Your Message Here"
            actionComponent={
              <Icon name="send" color={theme.colors.primary} onPress={handleSendMessage} />
            }
          />
          {isAdmin && (<Button title="Clear All Messages" onPress={clearAllMessages} />)}
        </View>
      </View>
    </ScreenWrapper>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(3),
      backgroundColor: theme.colors.background,
    },
    inputContainer: {
      alignItems: "center",
      gap: hp(1),
      marginVertical:theme.spacing.sm,
      borderTopWidth: theme.borderWidth.thick,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
    },
  });

export default Chat;
