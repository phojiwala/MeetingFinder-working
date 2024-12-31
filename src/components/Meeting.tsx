import { Box, Heading, Stack, Tag, Text } from '@chakra-ui/react';
import moment from 'moment-timezone';
import { createContext, useContext } from 'react';
import Highlighter from 'react-highlight-words';
import Linkify from 'react-linkify';
import {
  Meeting as MeetingType,
  capitalizeWords,
  getLangCodeFromCurrentURL,
  i18n,
  wordsToSkip
} from '../helpers';
import { ButtonPrimary } from './ButtonPrimary';
import { Report } from './Report';
import { ReportProblem } from './ReportProblemButton';

export type MeetingProps = {
  meeting: MeetingType;
  searchWords: string[];
  tags: string[];
};

export function Meeting({
  meeting,
  searchWords,
  tags,
  translationData,
  loading
}: MeetingProps) {
  const translations = translationData?.[0];
  const { language, rtl, strings } = useContext(i18n);
  console.log('i18n language', language)

  let current_lang = getLangCodeFromCurrentURL() || 'en';

  let days = [];
  if (translationData.length > 0) {
    days = [
      translations?.sunday,
      translations?.monday,
      translations?.tuesday,
      translations?.wednesday,
      translations?.thursday,
      translations?.friday,
      translations?.saturday
    ];
  }
  const formatTime = time => {
    if (!time) return '';
    const dayIndex = time.day();
    const formattedTime = time.format('LT');
    return `${days[dayIndex]} ${formattedTime}`;
  };

  const displayOrder = [
    'wso_id',
    'meeting_id',
    'meeting_password',
    'access_code',
    'dial_in_number'
  ];

  return (
    <Box
      as="article"
      bg="white"
      border="1px"
      borderColor="gray.300"
      mb={{ base: 3, md: 6 }}
      overflow="hidden"
      rounded="md"
      shadow="md"
      textAlign={rtl ? 'right' : 'left'}
    >
      <Stack spacing={3} p={{ base: 3, md: 5 }}>
        <Box alignItems="baseline">
          <Heading
            as="h2"
            display={{ lg: 'inline' }}
            fontSize="2xl"
            className="notranslate"
          >
            <Highlighter
              searchWords={searchWords}
              textToHighlight={meeting.name}
            />
          </Heading>
          <Heading
            as="h3"
            color="gray.600"
            display={{ lg: 'inline' }}
            fontSize="lg"
            fontWeight="normal"
            ml={{ lg: 2 }}
            className="notranslate"
          >
            {!meeting.time
              ? meeting.is_24_7 === true
                ? strings.twenty_four_seven
                : strings.ongoing
              : formatTime(moment(meeting.time))}
          </Heading>
        </Box>
        {!!meeting.buttons.length && (
          <Box>
            {meeting.buttons.map((button, index) => {
              const text =
                button.icon === 'email'
                  ? current_lang === 'fr'
                    ? 'Courriel'
                    : current_lang === 'es'
                    ? 'Correo Electronico'
                    : strings?.email || strings?.courriel
                  : button.icon === 'phone'
                  ? translationData?.[0]?.phone || ''
                  : button.value === 'AFG Mobile App'
                  ? translationData?.[0]?.afg
                  : button.value;
              const title =
                button.icon === 'email'
                  ? strings?.email_use.replace('{{value}}', button.value)
                  : button.icon === 'phone'
                  ? translationData?.[0]?.phone || ''
                  : button.value == 'AFG Mobile App'
                  ? translationData?.[0]?.afg
                  : strings?.video_use.replace('{{value}}', button.value);
              return (
                <Box
                  float={rtl ? 'right' : 'left'}
                  mr={rtl ? 0 : 2}
                  ml={rtl ? 2 : 0}
                  my={1}
                  key={index}
                >
                  <ButtonPrimary text={text} title={title} {...button} />
                </Box>
              );
            })}
          </Box>
        )}
        {(meeting?.notes || [])?.map((i, j) => (
          <Text key={j} wordBreak="break-word">
            {i}
          </Text>
        ))}
        {/* {loading
          ? 'Loading...'
          : Array.isArray(translationData) &&
            translationData[0] &&
            Object.entries(translationData[0]).map(([key, value]) => {
              return (
                meeting[key] && (
                  <Text key={key} wordBreak="break-word">
                    <Linkify>
                      <span className={value === 'WSO ID' ? 'notranslate' : ''}>
                        {value}:{' '}
                      </span>
                      <span className="notranslate">{meeting[key]}</span>
                    </Linkify>
                  </Text>
                )
              );
            })} */}
        {displayOrder.map(key => {
          const translation = translations?.[key];
          const value = meeting?.[key];
          if (!value) return null;
          return (
            <Text key={key} wordBreak="break-word">
              <Linkify>
                <span className={value === 'WSO ID' ? 'notranslate' : ''}>
                  {translation}:{' '}
                </span>
                <span className="notranslate">{value}</span>
              </Linkify>
            </Text>
          );
        })}

        {!!meeting.tags?.length && (
          <Box>
            {[...new Set(meeting.tags)]?.map((tag: string, index: number) => (
              <Tag
                bg={tags.includes(tag) ? 'gray.300' : 'gray.100'}
                border="1px"
                borderColor={tags.includes(tag) ? 'gray.400' : 'gray.200'}
                borderRadius="base"
                color={tags.includes(tag) ? 'gray.700' : 'gray.600'}
                key={index}
                me={2}
                my={1}
                px={3}
                py={1}
                size="sm"
                className={wordsToSkip?.includes(tag) ? 'notranslate' : ''}
              >
                {capitalizeWords(tag)}
              </Tag>
            ))}
          </Box>
        )}
        {!!meeting.report_problem.length && (
          <Box>
            {meeting.report_problem.map((button, index) => {
              const text =
                button.icon === 'email'
                  ? strings?.email
                  : button.icon === 'phone'
                  ? strings?.telephone
                  : button.value;

              const title =
                button.icon === 'email'
                  ? strings?.email_use.replace('{{value}}', button.value)
                  : button.icon === 'phone'
                  ? strings?.telephone_use.replace('{{value}}', button.value)
                  : strings?.video_use.replace('{{value}}', button.value);

              return (
                <Box
                  float={!rtl ? 'right' : 'left'}
                  mr={rtl ? 0 : 2}
                  ml={rtl ? 2 : 0}
                  my={1}
                  key={index}
                >
                  <ReportProblem text={text} title={title} {...button} />
                </Box>
              );
            })}
          </Box>
        )}
      </Stack>
      {process.env.REACT_APP_EMAIL_JS_SERVICE_ID && (
        <Report meeting={meeting} />
      )}
    </Box>
  );
}
