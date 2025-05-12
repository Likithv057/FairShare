import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from "react-native";
import Checkbox from "expo-checkbox";
import { hp, wp } from "@/helpers/common";
import Icon from "@/assets/icons";
import { useTheme } from "@/context/ThemeContext";
import { Theme } from "@/constants/theme";

type Option = {
  label: string;
  value: string;
};

type Props = {
  icon?: React.ReactNode;
  label?: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

const MultiSelect = ({ icon, label, options, selected, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  const styles = getStyle(theme);

  const toggleValue = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity style={styles.dropdown} onPress={() => setOpen(true)}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={selected.length ? styles.text : styles.placeholder}>
          {selected.length
            ? options
                .filter((opt) => selected.includes(opt.value))
                .map((opt) => opt.label)
                .join(", ")
            : "Select Members"}
        </Text>
        <Icon name="arrowdown" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.modal}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => toggleValue(item.value)}
                >
                  <Checkbox
                    value={selected.includes(item.value)}
                    onValueChange={() => toggleValue(item.value)}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default MultiSelect;

const getStyle = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: hp(0),
    },
    label: {
      fontSize: hp(1.9),
      marginLeft: wp(2),
      fontWeight: "500",
      marginBottom: hp(0.5),
      color: theme.colors.text,
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
    text: {
      flex: 1,
      marginLeft: wp(2),
      fontSize: hp(2),
      color: theme.colors.text,
      flexWrap: "wrap",
    },
    placeholder: {
      flex: 1,
      fontSize: hp(2),
      color: theme.colors.textLight,
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center",
      paddingHorizontal: wp(6),
    },
    modal: {
      backgroundColor: theme.colors.cardBackground, // Use theme card background
      borderRadius: theme.radius.xl,
      maxHeight: hp(50),
      paddingVertical: hp(1),
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(4),
    },
    optionText: {
      flex: 1,
      marginLeft: wp(3),
      fontSize: hp(2),
      color: theme.colors.text,
    },
    icon: {
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: wp(1),
    },
  });