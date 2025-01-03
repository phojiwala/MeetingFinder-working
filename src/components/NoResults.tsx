import { Alert, Box, Stack } from '@chakra-ui/react';
import { State } from '../helpers';
import { ButtonPrimary } from './ButtonPrimary';

export type NoResultsProps = {
  state: State;
  toggleTag: (filter: string, value: string, checked: boolean) => void;
  clearSearch: () => void;
};

export function NoResults({
  state,
  toggleTag,
  clearSearch,
  translationData
}: NoResultsProps) {
  let headerData = translationData?.[0];

  //get currrently active filters
  const filters = Object.keys(state.filters)
    .map(filter =>
      state.filters[filter]
        ?.filter(({ checked }) => checked)
        ?.map(tag => [filter, tag.tag])
    )
    .flat();

  return (
    <Alert flexDirection="column" py={60} rounded="md" w="full">
      <Stack spacing={5} align="center">
        {translationData.length && (
          <Box>{headerData?.no_results}</Box>
        )}
        {state.search && (
          <ButtonPrimary
            icon="small-close"
            onClick={() => clearSearch()}
            text={headerData.clear_search}
            title={headerData.clear_search}
          />
        )}
        {filters.map(([filter, tag], index) => (
          <Box key={index}>
            <ButtonPrimary
              key={index}
              icon="small-close"
              onClick={() => toggleTag(filter, tag, false)}
              text={tag}
              title={tag}
            />
          </Box>
        ))}
      </Stack>
    </Alert>
  );
}
