import { Box, Heading, Stack, Tag, Text } from '@chakra-ui/react';
import moment from 'moment-timezone';
import { useContext } from 'react';
import Highlighter from 'react-highlight-words';
import Linkify from 'react-linkify';
import {
  Meeting as MeetingType,
  capitalizeFirstLetter,
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

const parseContactInfo = (note: string) => {
  const contactRegex =
    /Contact (\d+):\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)(?:\s*$|\s*\r?\n)/;
  const match = note.match(contactRegex);
  if (match) {
    return {
      number: match[1],
      name: match[2].trim(),
      phone: match[3].trim(),
      email: match[4].trim()
    };
  }
  return null;
};

const formatPhoneNumber = (phone: string) => {
  return phone.replace(/[^\d]/g, '');
};

export function Meeting({
  meeting,
  searchWords,
  tags,
  translationData,
  loading
}: MeetingProps) {
  const translations = translationData?.[0];
  const { rtl, strings } = useContext(i18n);

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
    'meeting_id',
    'meeting_password',
    'dial_in_number',
    'access_code',
    'wso_id'
  ];

  const detectEmail = (text: string) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const match = text.match(emailRegex);
    return match ? match[0] : null;
  };

  console.log(meeting?.notes);

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

        {/* {typeof meeting?.notes === 'object' && Array.isArray(meeting?.notes) ? (
          <Stack spacing={3} direction="column">
            <Text wordBreak="break-word">
              {meeting?.notes[0]}
            </Text>
          </Stack>
        ) : null} */}

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

        {typeof meeting?.notes === 'object' && Array.isArray(meeting?.notes) ? (
          <Stack spacing={3} direction="column">
            {meeting?.notes
              ?.filter(note => note.trim() !== '')
              ?.map((note, j) => {
                const contactInfo = parseContactInfo(note);
                if (contactInfo) {
                  return (
                    <Text key={j} wordBreak="break-word">
                      Contact {contactInfo.number}: {contactInfo.name} |{' '}
                      {contactInfo.phone && (
                        <a
                          href={`tel:${formatPhoneNumber(contactInfo.phone)}`}
                          style={{
                            textDecoration: 'underline',
                            color: '#3182CE'
                          }}
                        >
                          {contactInfo.phone}
                        </a>
                      )}{' '}
                      |{' '}
                      {contactInfo.email && (
                        <a
                          href={`mailto:${contactInfo.email}`}
                          style={{
                            textDecoration: 'underline',
                            color: '#3182CE'
                          }}
                        >
                          {contactInfo.email}
                        </a>
                      )}
                    </Text>
                  );
                }
                return (
                  <Text key={j} wordBreak="break-word">
                    {note}
                  </Text>
                );
              })}
          </Stack>
        ) : null}

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
                {capitalizeFirstLetter(tag)}
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
