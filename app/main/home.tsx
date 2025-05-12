import { Text, View, StyleSheet, Pressable, FlatList, Alert, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useRouter } from "expo-router";
import { wp, hp } from "@/helpers/common";
import Icon from "@/assets/icons";
import CardDisplay from "@/components/CardDisplay";
import supabase from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/Loading";
import { useAvoidBackPress } from "@/hooks/avoidbackpress";
import { useTheme } from "@/context/ThemeContext";
import UserHeader from "@/components/UserHeader";
import Nav from "@/components/Nav";
import { Theme } from "@/constants/theme";

const Home: React.FC = () => {
  useAvoidBackPress();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { user } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("group_members")
        .select("group_id, role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching groups:", error.message);
        setLoading(false);
        return;
      }

      const groupRoles = Object.fromEntries(data.map(({ group_id, role }) => [group_id, role]));
      const groupIds = data.map(({ group_id }) => group_id);

      if (groupIds.length > 0) {
        const { data: groupData, error: groupError } = await supabase
          .from("groups")
          .select("*, group_members(count)")
          .in("id", groupIds);

        if (!groupError) {
          setGroups(
            groupData.map((group) => ({
              ...group,
              role: groupRoles[group.id],
              memberCount: group.group_members[0].count,
            }))
          );
        } else {
          console.error("Error fetching group details:", groupError.message);
        }
      }
      setLoading(false);
    };
    fetchGroups();
  }, [user]);

  const handleDeleteGroup = async (groupId: number) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group || group.memberCount > 1) {
      Alert.alert("Cannot delete", "Only Group With No Members Can Be Deleted");
      return;
    }

    Alert.alert("Confirm", "Are you sure you want to Delete the Group", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          const { error } = await supabase.from("groups").delete().eq("id", groupId);
          if (error) {
            console.error("Error deleting group:", error.message);
          } else {
            setGroups(groups.filter((g) => g.id !== groupId));
          }
        },
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <UserHeader title="Home" backbutton={false} />
        <Text style={styles.groupTitle}>Groups</Text>
        {loading ? (
          <Loading />
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <CardDisplay
                icon={<Icon name="group" />}
                title={item.name}
                onPress={() => router.push(`/main/groupdetails?groupId=${item.id}`)}
                actionComponent={
                  item.role === "admin" ? (
                    <View style={styles.actions}>
                      <Pressable onPress={() => router.push(`/main/editgroup?groupId=${item.id}`)}>
                        <Icon name="edit" color={theme.colors.primaryDark} />
                      </Pressable>
                      <Pressable onPress={() => handleDeleteGroup(item.id)}>
                        <Icon name="delete" color={theme.colors.error} />
                      </Pressable>
                    </View>
                  ) : null
                }
              />
            )}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
      <View style={styles.navBar}>
        <Nav
          actionComponent={
            <>
              <Pressable style={styles.navItem} onPress={() => router.push(`/main/creategroup`)}>
                <Icon name="add" />
                <Text style={styles.navText}>Create Group</Text>
              </Pressable>
              <Pressable style={styles.navItem} onPress={() => router.push(`/main/profile`)}>
                <Icon name="user" />
                <Text style={styles.navText}>Profile</Text>
              </Pressable>
            </>
          }
        />
      </View>
    </ScreenWrapper>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: wp(4),
    },
    groupTitle: {
      fontSize: hp(2.4),
      fontWeight: theme.fonts.bold,
      marginTop: hp(2),
      marginBottom: hp(1.5),
      color: theme.colors.text,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: wp(4),
    },
    navBar: {
      paddingVertical: hp(1),
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderColor: theme.colors.border,
    },
    navItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    navText: {
      marginTop: hp(0.5),
      fontSize: hp(1.6),
      color: theme.colors.textLight,
    },
  });

export default Home;