import { Button } from '@chakra-ui/react';
import { capitalizeFirstLetter } from '../helpers';
import { Tag } from '../helpers/types';

export type ButtonTagProps = {
  filter: string;
  tag: Tag;
  toggleTag: (filter: string, value: string, checked: boolean) => void;
};

export function ButtonTag({ filter, tag, toggleTag }: ButtonTagProps) {
  return (
    <Button
      bg={tag.checked ? 'gray.900' : 'gray.100'}
      border="1px"
      borderRadius="base"
      borderColor="gray.200"
      color={tag.checked ? 'gray.100' : 'gray.600'}
      me={2}
      my={1}
      onClick={e => {
        toggleTag(filter, tag.tag, !tag.checked);
      }}
      padding="18px 10px"
      sx={{ 'text-wrap': 'balance' }}
      size="sm"
      _hover={{
        bg: tag.checked ? 'gray.800' : 'gray.200',
        color: tag.checked ? 'gray.100' : 'gray.600'
      }}
    >
      {capitalizeFirstLetter(tag.tag)}
    </Button>
  );
}
