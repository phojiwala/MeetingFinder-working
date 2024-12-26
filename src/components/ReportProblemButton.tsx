import { Button } from '@chakra-ui/react';

export type ReportProblemProps = {
  disabled?: boolean;
  icon?: 'link' | 'email' | 'phone' | 'small-close' | 'video';
  onClick: () => void;
  text: string;
  title?: string;
};

export function ReportProblem({
  disabled,
  icon,
  onClick,
  text,
  title
}: ReportProblemProps) {
  return (
    <Button
      colorScheme='red' variant='outline'
      size='xs'
      disabled={disabled}
      onClick={onClick}
      title="Report Problem"
      // _hover={{ bg: 'red.200' }}
    >
      {}
      {text}
    </Button>
  );
}
