import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { colors, typography } from '@/constants/Theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: typography.fontSizes.md,
    lineHeight: typography.lineHeights.tight,
  },
  defaultSemiBold: {
    fontSize: typography.fontSizes.md,
    lineHeight: typography.lineHeights.tight,
    fontWeight: typography.fontWeights.semiBold,
  },
  title: {
    fontSize: typography.fontSizes.hero,
    fontWeight: typography.fontWeights.bold,
    lineHeight: typography.lineHeights.title,
  },
  subtitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
  },
  link: {
    lineHeight: typography.lineHeights.normal,
    fontSize: typography.fontSizes.md,
    color: colors.link,
  },
});
