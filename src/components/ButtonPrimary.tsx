import { Box, Button } from '@chakra-ui/react';
import {
  capitalizeFirstLetter,
  capitalizeWords,
  wordsToSkip
} from '../helpers';
import { Icon } from './Icon';

export type ButtonPrimaryProps = {
  disabled?: boolean;
  icon?: 'link' | 'email' | 'phone' | 'small-close' | 'video';
  onClick: () => void;
  text: string;
  title?: string;
};

export function ButtonPrimary({
  disabled,
  icon,
  onClick,
  text,
  title
}: ButtonPrimaryProps) {

  return (
    <Button
      className="notranslate"
      bg="blue.600"
      color="white"
      disabled={disabled}
      onClick={onClick}
      title={title}
      _hover={{ bg: 'blue.800' }}
      className={wordsToSkip?.some(i => text?.includes(i)) ? 'notranslate' : ''}
    >
      {icon && (
        <Box me={1}>
          <Icon name={icon} />
        </Box>
      )}
      {text?.includes('.')
        ? text
        : text?.toLowerCase().includes('afg') ||
          text?.toLowerCase().includes('mobile')
        ? capitalizeWords(text)
        : capitalizeFirstLetter(text)}
    </Button>
  );
}
