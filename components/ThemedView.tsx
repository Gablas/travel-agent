import { View, type ViewProps } from 'react-native';
import { Colors } from '@/constants/Colors';

export type ThemedViewProps = ViewProps & {
  backgroundColor?: string;
  variant?: 'default' | 'surface' | 'secondary';
};

export function ThemedView({ 
  style, 
  backgroundColor: customBackgroundColor, 
  variant = 'default',
  ...otherProps 
}: ThemedViewProps) {
  const getBackgroundColor = () => {
    if (customBackgroundColor) return customBackgroundColor;
    
    switch (variant) {
      case 'surface':
        return Colors.surface;
      case 'secondary':
        return Colors.surfaceSecondary;
      default:
        return Colors.background;
    }
  };

  const backgroundColor = getBackgroundColor();

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
