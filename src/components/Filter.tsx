import { Button, FormControl, Select, Stack } from '@chakra-ui/react';
import moment from 'moment-timezone';
import { FormEvent, useContext, useState } from 'react';
import { State, i18n, wordsToSkip } from '../helpers';
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

  const langObj = headerData
    ? Object.fromEntries(
        Object.entries(headerData)
          .filter(([key, _]) => key.startsWith('lang_'))
          .map(([key, value]) => [key.replace('lang_', ''), value])
      )
    : {};

  return (
    <Stack spacing={{ base: 3, md: 6 }}>
      <FormControl>
        <Search
          search={state.search}
          setSearch={setSearch}
          state={state}
          headerData={headerData}
        />
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
                        ? headerData?.participants
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
        {state.languages?.length > 1 && (
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
              {state.languages?.map((language, index) => {
                return (
                  <option key={index} value={language}>
                    {langObj[language]}
                  </option>
                );
              })}
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
            onChange={(e: FormEvent<HTMLSelectElement>) => {
              // console.log(e.currentTarget.value)
              setTimezone(e.currentTarget.value);
            }}
            value={state.timezone}
          >
            {headerData?.timezones?.map((item, index) => (
              <option key={index} value={item?.text}>
                {item?.value}
              </option>
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
