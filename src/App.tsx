import { useEffect, useState } from 'react';
import { Box, CSSReset, Grid, ChakraProvider } from '@chakra-ui/react';
import { Filter } from './components/Filter';
import { Loading } from './components/Loading';
import { Meeting } from './components/Meeting';
import { NoResults } from './components/NoResults';
import {
  Meeting as MeetingType,
  State,
  dataUrl,
  filter,
  getLanguage,
  i18n,
  isLanguageCode,
  languages,
  load,
  meetingsPerPage,
  setQuery,
  getLangCodeFromCurrentURL
} from './helpers';
import { ButtonPrimary } from './components/ButtonPrimary';
// import staticData from './meetings-fr.json'

export const App = () => {
  //check out query string
  const query = new URLSearchParams(window.location.search);
  const queryLang = query.get('lang');
  const language = isLanguageCode(queryLang) ? queryLang : getLanguage();
  const direction = languages[language].rtl ? 'rtl' : 'ltr';

  let current_lang = getLangCodeFromCurrentURL() || 'en';

  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<State>({
    filters: {
      days: [],
      times: [],
      formats: [],
      types: []
    },
    limit: meetingsPerPage,
    loaded: false,
    meetings: [],
    search: '',
    timezone: '',
    language,
    languages: []
  });

  const [searchWords, setSearchWords] = useState<string[]>([]);
  const [translationData, setTranslationData] = useState<any[]>([]);

  useEffect(() => {
    setQuery(state);
  }, [state]);

  useEffect(() => {
    setSearchWords(
      state.search
        .toLowerCase()
        .split(' ')
        .filter(e => e)
    );
  }, [state.search]);

  //set html attributes
  document.documentElement.lang = language;
  document.documentElement.dir = direction;

  //function to remove a tag
  const toggleTag = (filter: string, value: string, checked: boolean): void => {
    //loop through and add the tag
    state.filters[filter].forEach(tag => {
      if (tag.tag === value) {
        tag.checked = checked;
      } else if (['days', 'formats', 'language'].includes(filter)) {
        //if we're setting a tag or format, uncheck the others
        tag.checked = false;
      }
    });
    //this will cause a re-render; the actual filtering is done in filterData
    setState({ ...state });
  };

  useEffect(() => {
    let pathFetch = '';
    if (current_lang) {
      pathFetch = `https://meetings.staging.al-anon.org/${current_lang}/apps/meeting-finder/static-translation-words.json`;
    } else {
      pathFetch =
        'https://meetings.staging.al-anon.org/apps/meeting-finder/static-translation-words.json';
    }
    fetch(pathFetch)
      .then(result => result.json())
      .then(result => {
        result = result.map(obj => {
          return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [
              key.replace('_key', ''),
              value
            ])
          );
        });
        result[0].wso_id = 'WSO ID';
        setTranslationData(result);
        setLoading(false);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    if (loading) {
      let pathFetch = '';
      if (current_lang) {
        pathFetch = `https://meetings.staging.al-anon.org/${current_lang}/apps/meeting-finder/meetings.json`;
      } else {
        pathFetch =
          'https://meetings.staging.al-anon.org/apps/meeting-finder/meetings.json';
      }
      setLoading(false);
      fetch(pathFetch || dataUrl)
        .then(result => result.json())
        .then(result => {
          // result = staticData
          // console.log(result)
          setState(
            load(result, query, state.language, languages[current_lang].strings)
          );
        });
    }
  }, [translationData]);

  // console.log('27/3/25 3.22pm')

  //get currently-checked tags
  const tags: string[] = Object.keys(state.filters)
    .map(filter =>
      state.filters[filter]
        .filter(value => value.checked)
        .map(value => value.tag)
    )
    .flat();

  const [filteredMeetings, currentDays] = filter(
    state,
    tags,
    languages[current_lang].strings
  );

  // console.log(filteredMeetings)

  return (
    <i18n.Provider
      value={{
        language: state.language,
        rtl: languages[state.language].rtl,
        strings: languages[language].strings
      }}
    >
      <ChakraProvider>
        <CSSReset />
        {!state.loaded ? (
          <Loading />
        ) : (
          <Box
            as="main"
            maxW={1240}
            minH="100%"
            w="100%"
            mx="auto"
            p={{ base: 3, md: 6 }}
          >
            <Grid
              as="section"
              gap={{ base: 3, md: 6 }}
              templateColumns={{
                md: 'auto 300px'
              }}
            >
              <Box as="section" order={{ base: 1, md: 2 }}>
                <Filter
                  setSearch={(search: string) => setState({ ...state, search })}
                  setTimezone={(timezone: string) =>
                    setState({ ...state, timezone })
                  }
                  state={state}
                  currentDays={currentDays}
                  toggleTag={toggleTag}
                  translationData={translationData || []}
                />
              </Box>
              <Box order={{ base: 2, md: 1 }}>
                {!filteredMeetings.length ? (
                  <NoResults
                    state={state}
                    toggleTag={toggleTag}
                    clearSearch={() => setState({ ...state, search: '' })}
                    translationData={translationData || []}
                  />
                ) : (
                  <div>
                    {filteredMeetings
                      .slice(0, state.limit)
                      .map((meeting: MeetingType, index: number) => (
                        <Meeting
                          key={index}
                          meeting={meeting}
                          searchWords={searchWords}
                          tags={tags}
                          translationData={translationData || []}
                          loading={loading}
                        />
                      ))}
                  </div>
                )}
              </Box>
            </Grid>
            {Array.isArray(translationData) &&
            translationData?.[0] &&
            filteredMeetings.length > 10 &&
            filteredMeetings.length > state.limit ? (
              <Box display="flex" justifyContent="center">
                <ButtonPrimary
                  text={translationData?.[0]?.load_more || ''}
                  title={translationData?.[0]?.load_more || ''}
                  onClick={() => {
                    const limit = state.limit + meetingsPerPage;
                    setState({ ...state, limit });
                  }}
                />
              </Box>
            ) : null}
          </Box>
        )}
      </ChakraProvider>
    </i18n.Provider>
  );
};
