import { Button, FormControl, Select, Stack } from '@chakra-ui/react';
import moment from 'moment-timezone';
import { FormEvent, useContext, useState } from 'react';

import { Language, State, i18n, languages, wordsToSkip } from '../helpers';
import { ButtonTag } from './ButtonTag';
import { Icon } from './Icon';
import { Search } from './Search';

export type FilterProps = {
  setSearch: (search: string) => void;
  setTimezone: (timezone: string) => void;
  state: State;
  toggleTag: (filter: string, value: string, checked: boolean) => void;
  currentDays: string[];
};

export function Filter({
  setSearch,
  setTimezone,
  state,
  toggleTag,
  currentDays,
  translationData
}: FilterProps) {
  const [open, setOpen] = useState(false);
  const { language, rtl, strings } = useContext(i18n);

  //filter out unused days
  state.filters.days = state.filters?.days?.filter(day => {
    return currentDays.includes(day.tag);
  });

  let headerData = translationData?.[0];

  return (
    <Stack spacing={{ base: 3, md: 6 }}>
      <FormControl>
        <Search search={state.search} setSearch={setSearch} state={state} headerData={headerData} />
      </FormControl>
      <Stack
        display={{ base: open ? 'block' : 'none', md: 'block' }}
        spacing={{ base: 3, md: 6 }}
      >
        {Object.keys(state.filters).map((filter: string, index: number) => {
          return (
            !!state.filters[filter].length && (
              <FormControl key={index}>
                <div>
                  <strong>
                    <label>
                      {filter === 'days'
                        ? headerData?.days
                        : filter === 'formats'
                        ? headerData?.platforms
                        : filter === 'types'
                        ? headerData?.attendees
                        : ''}
                    </label>
                  </strong>
                </div>
                {state.filters[filter]?.map((tag, index) => {
                  return (
                    <ButtonTag
                      filter={filter}
                      key={index}
                      tag={tag}
                      toggleTag={toggleTag}
                      className={
                        wordsToSkip?.includes(tag.tag) ? 'notranslate' : ''
                      }
                    />
                  );
                })}
              </FormControl>
            )
          );
        })}
        {state.languages.length > 1 && (
          <FormControl display="block" as="fieldset">
            <label>
              <strong>{headerData?.meeting_language}</strong>
            </label>
            <Select
              marginTop={1}
              aria-label={strings.language}
              bgColor="white"
              borderColor="gray.300"
              color="gray.500"
              iconColor="gray.500"
              icon={rtl ? <div /> : <Icon name="language" />}
              onChange={(e: FormEvent<HTMLSelectElement>) => {
                window.location.href = `${window.location.pathname}?lang=${e.currentTarget.value}`;
              }}
              value={language}
            >
              {state.languages.map((language, index) => (
                <option key={index} value={language}>
                  {languages[language as Language].name}
                </option>
              ))}
            </Select>
          </FormControl>
        )}
        <FormControl display="block" as="fieldset">
          <label>
            <strong>{headerData?.timezone}</strong>
          </label>
          <Select
            marginTop={1}
            aria-label={strings.timezone}
            bgColor="white"
            borderColor="gray.300"
            color="gray.500"
            icon={rtl ? <div /> : <Icon name="time" />}
            onChange={(e: FormEvent<HTMLSelectElement>) =>
              setTimezone(e.currentTarget.value)
            }
            value={state.timezone}
          >
            {moment.tz.names().map((name, index) => (
              <option key={index}>{name}</option>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <FormControl display={{ md: 'none' }}>
        <Button
          bg={open ? 'transparent' : 'white'}
          borderColor="gray.300"
          color="gray.500"
          onClick={() => setOpen(!open)}
          rightIcon={<Icon name={open ? 'chevron-up' : 'chevron-down'} />}
          variant="outline"
          w="100%"
        >
          {open ? strings.close : strings.filters}
        </Button>
      </FormControl>
    </Stack>
  );
}
