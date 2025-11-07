import { Text, type TextProps } from '@radix-ui/themes';

/**
 * Wrapped around Radix <Text/> providing a default size.
 * @param {TextProps} props Incoming props
 */
const PrimaryText = ({ size = '4', ...props }: TextProps) => {
  return <Text size={size} {...props} />;
};

export default PrimaryText;
