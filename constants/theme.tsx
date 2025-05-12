export const lightTheme = {
  colors: {
    background: '#E6E4DF',         // Soft warm gray-beige
    cardBackground: '#DAD8D3',     // Slightly darker neutral for contrast
    primary: '#709CA7',            // Muted dusty teal
    primaryDark: '#4E7681',        // More grounded version for buttons/hover
    text: '#2F2F2F',               // Deep gray for text, avoids black
    textLight: '#6F6F6F',          // Soft neutral gray for secondary text
    error: '#B35D5D',              // Soft rust red
    errorLight: '#E2C5C5',         // Dusty rose background for subtle errors
    success: '#6D9A75',            // Calm earthy green
    successLight: '#C9D9C4',       // Muted mint green
    warning: '#C7A148',            // Muted amber yellow
    warningLight: '#E5D8B4',       // Pale gold for warnings
    border: '#B8B6B0',             // Warm soft gray for outlines
    divider: '#C7C5BF',            // Light neutral divider
    accent: '#9C86B5',             // Desaturated lavender
    accentLight: '#D2C9E0',        // Misty lavender highlight
    shadow: 'rgba(0, 0, 0, 0.04)', // Extra soft neutral shadow
  },
  pie: [
    '#A98B7D', // Soft coffee
    '#8DA291', // Sage
    '#D8B4A0', // Pale terracotta
    '#A7B8C1', // Muted steel blue
    '#D6C68A', // Pale ochre
  ],
  fonts: {
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  opacity: {
    low: 0.3,
    medium: 0.6,
    full: 1,
  },
  elevation: {
    none: 0,
    sm: 2,
    md: 4,
    lg: 8,
  },
  borderWidth: {
    none: 0,
    thin: 1,
    thick: 2,
  },
};


export const darkTheme = {
  colors: {
    background: '#0A0E14',           // Almost black with blue tint
    cardBackground: '#161B22',       // Dark steel blue-gray for cards
    primary: '#26D9D9',              // Soft neon teal
    primaryDark: '#1CA7A7',          // Deeper teal for interaction
    text: '#D5EFFF',                 // Muted light blue
    textLight: '#92AFC2',            // Faded blue-gray for secondary
    error: '#FF5F5F',                // Soft neon red
    errorLight: '#F8B8B8',           // Light red glow
    success: '#4CD9A6',              // Soft mint green
    successLight: '#B2F1DB',         // Light mint background
    warning: '#F0C349',              // Warm muted yellow
    warningLight: '#FBE9AC',         // Creamy yellow background
    border: '#2A3442',               // Very dark slate for borders
    divider: '#1C252E',              // Soft edge separator
    accent: '#BD8EFF',               // Muted lavender glow
    accentLight: '#D9C6F9',          // Light purple highlight
    shadow: 'rgba(38, 217, 217, 0.08)', // Subtle teal glow
  },
  pie: [
    '#3CBAC8', // Teal
    '#9B72CF', // Soft violet
    '#D8A31D', // Gold ochre
    '#66D9A4', // Pale mint
    '#FF9AA2', // Faded neon pink
  ],
  fonts: lightTheme.fonts,
  fontSizes: lightTheme.fontSizes,
  radius: lightTheme.radius,
  spacing: lightTheme.spacing,
  opacity: lightTheme.opacity,
  elevation: lightTheme.elevation,
  borderWidth: lightTheme.borderWidth,
};



export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export type Theme = typeof lightTheme;