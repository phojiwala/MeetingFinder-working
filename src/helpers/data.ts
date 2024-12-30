import moment from 'moment-timezone';

import { meetingsPerPage, videoServices } from './config';
import { DataRow, GoogleSheetData, Meeting, State, Tag } from './types';

import { Language, isLanguage, languageLookup, LanguageStrings } from './i18n';

//parse google spreadsheet data into state object (runs once on init)
export function load(
  data: GoogleSheetData | DataRow[],
  query: URLSearchParams,
  language: Language,
  strings: LanguageStrings
): State {
  const meetings: Meeting[] = [];
  const formats: string[] = [];
  const types: string[] = [];
  const availableLanguages: Language[] = [];

  //translate google sheet format
  if (isGoogleSheetData(data)) {
    data = translateGoogleSheet(data);
  }

  //does the data contain any language column data
  const hasLanguages = data.some(row => row.languages);

  let meeting_languages: string[] = [];

  //loop through json entries
  data.forEach((row: DataRow, i: number) => {
    //required fields
    if (!row.name || !row.timezone) return;

    //let
    let addMeeting = true;

    //handle language
    if (hasLanguages) {
      meeting_languages = stringToTrimmedArray(row.languages);
      const meetingLanguages = meeting_languages
        .filter(string => {
          const isLanguageDefined = isLanguage(string);
          if (!isLanguageDefined) warn(string, 'language', i);
          return isLanguageDefined;
        })
        .map(string => languageLookup[string]);

      //make sure available languages is populated
      meetingLanguages.forEach(language => {
        if (language && !availableLanguages.includes(language)) {
          availableLanguages.push(language);
        }
      });

      //only want meetings for current language, but need to keep going to see all data issues
      addMeeting = meetingLanguages.includes(language);
    }

    //start creating meeting
    const meeting: Meeting = {
      name: row.name.trim(),
      buttons: [],
      notes: stringToTrimmedArray(row.notes, true),
      search: '',
      tags: [],
      id: row.meeting_id,
      email: row.email,
      report_problem: [],
      is_24_7: false,
      access_code: row.access_code,
      meeting_id: row.meeting_id,
      meeting_password: row.meeting_password,
      dial_in_number: row.dial_in_number,
      wso_id: row.wso_id,
      times: row.times,
      meeting_day: row.meeting_day,
      meeting_hour: row.meeting_hour,
      meeting_minutes: row.meeting_minutes,
      meeting_ampm: row.meeting_ampm,
      timezone: row.timezone
    };

    if (row.report_problem) {
      const originalUrl = row.report_problem.trim();

      if (originalUrl) {
        try {
          const url = new URL(originalUrl);
          if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error();
          }
          meeting.report_problem.push({
            icon: 'link',
            onClick: () => {
              window.open(originalUrl, '_blank');
            },
            value: 'Report Problem'
          });
        } catch {
          warn(originalUrl, 'URL', i);
        }
      }
    }

    //handle url
    if (row.url) {
      const originalUrl = row.url.trim();
      if (originalUrl) {
        let label;
        let icon: 'link' | 'video' = 'link';
        try {
          const url = new URL(originalUrl);
          if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error();
          }
          const host = url.hostname;
          const service = Object.keys(videoServices).filter(
            service =>
              videoServices[service].filter(domain => host.endsWith(domain))
                .length
          );
          if (service.length) {
            label = service[0];
            icon = 'video';
          } else {
            label = url.hostname.replace('www.', '');
          }
          meeting.buttons.push({
            icon: icon,
            onClick: () => {
              window.open(originalUrl, '_blank');
            },
            value: label
          });
        } catch {
          warn(originalUrl, 'URL', i);
        }
      }
    }

    //handle phone
    if (row.phone) {
      const originalPhone = row.phone.trim();
      if (originalPhone) {
        let phone = originalPhone.replace(/\D/g, '');
        if (phone.length > 8) {
          if (row.access_code) {
            const accessCode = row.access_code.trim();
            if (accessCode.length) {
              phone += ',,' + accessCode;
            }
          }
          meeting.buttons.push({
            icon: 'phone',
            onClick: () => {
              window.open(`tel:${phone}`);
            },
            value: phone
          });
        } else {
          warn(originalPhone, 'phone number', i);
        }
      }
    }

    //handle email
    if (row.email) {
      const email = row.email.trim();
      if (email) {
        if (validateEmail(email)) {
          meeting.buttons.push({
            icon: 'email',
            onClick: () => {
              window.open('mailto:' + email);
            },
            value: email
          });
        } else {
          warn(email, 'email address', i);
        }
      }
    }

    //handle formats
    const meeting_formats = stringToTrimmedArray(row['formats']);

    //get types
    const meeting_types = stringToTrimmedArray(row['types']);

    //append to formats & types arrays
    if (addMeeting) {
      meeting_formats.forEach((format: string) => {
        if (!formats.includes(format)) {
          formats.push(format);
        }
      });
      meeting_types
        .filter(
          type => !meeting_languages.includes(type) && !types.includes(type)
        )
        .forEach(type => {
          types.push(type);
        });
    }

    if (row.is_24_7) {
      meeting.is_24_7 = true;
      meeting.tags = meeting.tags.concat(
        meeting_formats,
        meeting_types,
        '24/7'
      );
    } else {
      //append to meeting tags
      meeting.tags = meeting.tags.concat(meeting_formats, meeting_types);
    }

    //add words to search index
    meeting.search = meeting.name
      .toLowerCase()
      .split(' ')
      .filter(e => e)
      .join(' ');

    //timezone
    const timezone = row.timezone.trim();

    //handle times
    const times = stringToTrimmedArray(row['times']);

    if (times.length) {
      //loop through create an entry for each time
      times.forEach(timestring => {
        let time = moment
          .tz(timestring, ['dddd HH:mm', 'dddd H:mm', 'dddd h:mm a'], timezone)
          .locale(language);

        if (!time.isValid()) {
          time = moment
            .tz(timestring, ['HH:mm', 'H:mm', 'h:mm a'], timezone)
            .locale(language);
        }
        if (time.isValid() && addMeeting) {
          meetings.push({ ...meeting, time, meeting_day: time.format('dddd') });
        }
      });
    } else if (addMeeting) {
      //ongoing meeting; add to meetings
      meetings.push(meeting);
    }
  });

  //sort
  formats.sort();
  types.sort();
  availableLanguages.sort();

  return {
    filters: {
      days: arrayToTagsArray(
        [
          strings.sunday,
          strings.monday,
          strings.tuesday,
          strings.wednesday,
          strings.thursday,
          strings.friday,
          strings.saturday,
          strings.twenty_four_seven
        ],
        query.get('days')?.split(',') || []
      ),
      formats: arrayToTagsArray(
        formats,
        query.get('formats')?.split(',') || []
      ),
      types: arrayToTagsArray(types, query.get('types')?.split(',') || [])
    },
    limit: meetingsPerPage,
    loaded: true,
    meetings: meetings,
    search: '',
    timezone: moment.tz.guess(),
    language: language,
    languages: availableLanguages
  };
}

function arrayToTagsArray(array: string[], values: string[]): Tag[] {
  return array.map(tag => ({ tag: tag, checked: values.includes(tag) }));
}

function isGoogleSheetData(data: unknown): data is GoogleSheetData {
  return !process.env.REACT_APP_JSON_URL;
}

//split "foo, bar\nbaz" into ["foo", "bar", "baz"]
function stringToTrimmedArray(str?: string, breaksOnly = false): string[] {
  if (!str) return [];
  const sep = '\n';
  const safeStr = String(str);
  if (!breaksOnly) {
    return safeStr
      .replace(/,/g, sep)
      .split(sep)
      .map(val => val.trim())
      .filter(val => val);
  }
  return safeStr
    .split(sep)
    .map(val => val.trim())
    .filter(val => val);
}

//translate response from Google Sheet v4
function translateGoogleSheet({ values }: GoogleSheetData): DataRow[] {
  const headers = values
    ?.shift()
    ?.map((header: string) => header.toLowerCase().replace(' ', '_'));
  return values.map(row => {
    const thisRow: DataRow = {};
    headers?.forEach((header: string, index: number) => {
      thisRow[header as keyof DataRow] = row[index];
    });
    return thisRow;
  });
}

export function validateEmail(email: string) {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );
}

function warn(value: string, type: string, line: number) {
  console.warn(`Row ${line + 2}: “${value}” is not a valid ${type}.`);
}
