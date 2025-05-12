import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Alert, ScrollView, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import supabase from "@/lib/supabase";
import { wp, hp } from "@/helpers/common";
import ScreenWrapper from "@/components/ScreenWrapper";
import UserHeader from "@/components/UserHeader";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import TextDisplay from "@/components/TextDisplay";
import Input from "@/components/Input";
import Icon from "@/assets/icons";
import Loading from "@/components/Loading";
import Nav from "@/components/Nav";
import { Theme } from "@/constants/theme";

const GroupDetail: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { groupId } = useLocalSearchParams();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchGroupDetails = async () => {
    if (!user || !groupId) return;
    setLoading(true);
    try {
      const { data: groupData, error: groupError } = await supabase.from("groups").select("*").eq("id", groupId).single();

      if (groupError) {
        Alert.alert("Error", groupError.message);
        return;
      }

      setGroup(groupData);

      const { data: memberData, error: memberError } = await supabase.from("group_members").select("user_id, role").eq("group_id", groupId);

      if (memberError) {
        Alert.alert("Error", memberError.message);
        return;
      }

      const memberIds = memberData.map((member: { user_id: string }) => member.user_id);
      const { data: userData, error: userError } = await supabase.from("users").select("id, name, points").in("id", memberIds);

      if (userError) {
        Alert.alert("Error", userError.message);
        return;
      }

      const membersWithDetails = memberData.map((member: any) => {
        const userDetails = userData.find((user: any) => user.id === member.user_id);
        return {
          ...member,
          user_name: userDetails ? userDetails.name : "Unknown",
          points: userDetails ? userDetails.points : 0,
        };
      });

      setMembers(membersWithDetails);

      const currentUser = membersWithDetails.find((m) => m.user_id === user.id);
      setUserRole(currentUser ? currentUser.role : "member");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId, user]);

  const handleAddMember = async () => {
    if (userRole !== "admin") {
      Alert.alert("Error", "Only admins can add members.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email.");
      return;
    }

    const { data: userData, error: userError } = await supabase.from("users").select("id").eq("email", email).single();

    if (userError || !userData) {
      Alert.alert("Error", "User not found with this email.");
      return;
    }

    const { error: memberError } = await supabase.from("group_members").insert([{ group_id: groupId, user_id: userData.id, role: "member" }]);

    if (memberError) {
      Alert.alert("Error", memberError.message);
    } else {
      Alert.alert("Success", "Member added successfully!");
      setEmail("");
      fetchGroupDetails();
    }
  };

  const handleRemoveMember = async (memberId: string, role: string) => {
    if (userRole !== "admin") {
      Alert.alert("Error", "Only admins can remove members.");
      return;
    }

    if (role === "admin") {
      Alert.alert("Error", "Admins cannot be removed.");
      return;
    }

    Alert.alert("Confirm", "Are you sure you want to remove this member?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          const { error } = await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", memberId);

          if (error) {
            Alert.alert("Error", error.message);
          } else {
            Alert.alert("Success", "Member removed successfully!");
            fetchGroupDetails();
          }
        },
      },
    ]);
  };

  if (loading) return <Loading />;

  if (!group) return (
    <ScreenWrapper>
      <UserHeader title="Group Details" />
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Group Not Found</Text>
      </View>
    </ScreenWrapper>
  );

  return (
    <ScreenWrapper>
      <UserHeader title={group?.name || "Group Details"} />
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Members:</Text>
        <ScrollView style={styles.membersScrollView}>
          {members.map((member) => (
            <View key={member.user_id} style={styles.memberItem}>
              <TextDisplay
                icon={<Icon name="user" />}
                text={`${member.user_name} | [ ${member.role} ] | [ Points : ${member.points} ]`}
                actionComponent={
                  userRole === "admin" && member.role !== "admin" && (
                    <Icon name="delete" color={theme.colors.error} onPress={() => handleRemoveMember(member.user_id, member.role)} />
                  )
                }
              />
            </View>
          ))}
        </ScrollView>

        {userRole === "admin" && (
          <View style={styles.addMemberSection}>
            <Text style={styles.sectionTitle}>Add Member by Email</Text>
            <Input
              icon={<Icon name="mail" />}
              placeholder="Enter User Email"
              value={email}
              onChangeText={setEmail}
              actionComponent={<Icon name="add" onPress={handleAddMember} color={theme.colors.success} />}
            />
          </View>
        )}
      </View>
      <View style={styles.bottomNav}>
        <Nav
          actionComponent={
            <>
              <Pressable style={styles.navItem} onPress={() => router.push(`./chat?groupId=${groupId}`)}>
                <Icon name="message" size={24} />
                <Text style={styles.navText}>Chat</Text>
              </Pressable>
              <Pressable style={styles.navItem} onPress={() => router.push(`./expenses?groupId=${groupId}`)}>
                <Icon name="expenses" size={24} />
                <Text style={styles.navText}>Expense</Text>
              </Pressable>
            </>
          }
        />
      </View>
    </ScreenWrapper>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: wp(4),
    paddingBottom: hp(9), // Increased padding to create space
  },
  sectionTitle: {
    marginVertical: hp(1.5),
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  membersScrollView: {
    flexGrow: 1,
    marginHorizontal:wp(1),
    marginBottom: hp(2), // Added margin below the scroll view
  },
  memberItem: {
    marginBottom: theme.spacing.sm,
  },
  addMemberSection: {
    marginHorizontal:wp(1),
    marginTop: hp(2),
    paddingBottom: hp(2), // Added padding below the input section
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: hp(2.2),
    color: theme.colors.textLight,
  },
});

export default GroupDetail;