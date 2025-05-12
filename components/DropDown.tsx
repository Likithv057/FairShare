import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, FlatList, Modal } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { hp, wp } from "@/helpers/common";
import Icon from "@/assets/icons";
import { Theme } from "@/constants/theme";

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  icon?: React.ReactNode;
  label?: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  actionComponent?: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({
  icon,
  label,
  options,
  selectedValue,
  onSelect,
  actionComponent,
}) => {
  const [visible, setVisible] = useState(false);
  const { theme } = useTheme();
  const styles = getStyle(theme);

  const selectedLabel =
    options.find((opt) => opt.value === selectedValue)?.label || "Select";

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable style={styles.dropdown} onPress={() => setVisible(true)}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={selectedValue ? styles.selected : styles.placeholder}>
          {selectedLabel}
        </Text>
        <Icon name="arrowdown"/>
        {actionComponent && <View style={styles.icon}>{actionComponent}</View>}
      </Pressable>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.modal}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Dropdown;

const getStyle = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: hp(0),
    },
    label: {
      marginLeft: wp(2),
      fontSize: hp(1.9),
      marginBottom: hp(0.5),
      color: theme.colors.text,
      fontWeight: "600",
    },
    dropdown: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: wp(2),
      height: hp(7),
      width: wp(90),
      borderWidth: theme.borderWidth.thick, // Use theme border width
      borderColor: theme.colors.text, // Use theme border color
      borderRadius: theme.radius.md,
      paddingHorizontal: wp(4),
    },
    selected: {
      marginLeft: wp(2),
      flex: 1,
      fontSize: hp(2),
      color: theme.colors.text,
    },
    placeholder: {
      flex: 1,
      marginLeft: wp(2),
      fontSize: hp(2),
      color: theme.colors.textLight,
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      backgroundColor: theme.colors.cardBackground, // Use theme card background
      borderRadius: theme.radius.xl,
      width: wp(80),
      maxHeight: hp(50),
      paddingVertical: hp(1),
      elevation: theme.elevation.md, // Use theme elevation
    },
    option: {
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(4),
    },
    optionText: {
      fontSize: hp(2),
      color: theme.colors.text,
    },
    icon: {
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: wp(1),
      zIndex:2,
    },
  });