import { StyleSheet, Text, type TextProps } from 'react-native';
import { Colors } from '@/constants/Colors';

export type ThemedTextProps = TextProps & {
  color?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'secondary' | 'muted';
};

export function ThemedText({
  style,
  color: customColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const getColor = () => {
    if (customColor) return customColor;
    
    switch (type) {
      case 'secondary':
        return Colors.textSecondary;
      case 'muted':
        return Colors.textMuted;
      case 'link':
        return Colors.primary;
      default:
        return Colors.text;
    }
  };

  const color = getColor();

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'secondary' ? styles.secondary : undefined,
        type === 'muted' ? styles.muted : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  link: {
    lineHeight: 24,
    fontSize: 16,
    fontWeight: '600',
  },
  secondary: {
    fontSize: 16,
    lineHeight: 24,
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
  },
});
