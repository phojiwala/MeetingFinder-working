//don't change this 👇 -- see README.md for help creating an .env file for your app
const sheetUrl = process.env.REACT_APP_GOOGLE_SHEET
  ? process.env.REACT_APP_GOOGLE_SHEET
  : 'https://docs.google.com/spreadsheets/d/1wER2LP3dT_6_LEQ8fSY1rv2bGzIZ2aaMBi_0Bt1aN3I/edit#gid=0';

export const dataUrl =
  process.env.REACT_APP_JSON_URL ||
  `https://sheets.googleapis.com/v4/spreadsheets/${
    sheetUrl.split('/')[5]
  }/values/A:ZZ?key=${process.env.REACT_APP_GOOGLE_API_KEY}`;

//number of meetings displayed (scroll to load more)
export const meetingsPerPage = 10;

//any link is supported, but these conference URLs identified by service name
export const videoServices: { [key: string]: string[] } = {
  'AFG Mobile App': ['al-anon.org'],
  BlueJeans: ['bluejeans.com'],
  Discord: ['discord.gg', 'discord.com'],
  'Free Conference': ['freeconference.com'],
  'Free Conference Call': ['freeconferencecall.com'],
  'Google Meet': ['meet.google.com'],
  GoToMeeting: ['gotomeet.me', 'gotomeeting.com'],
  Jitsi: ['jit.si'],
  'Second Life': ['secondlife.com'],
  Skype: ['skype.com'],
  WebEx: ['webex.com'],
  WhatsApp: ['whatsapp.com'],
  Zoho: ['zoho.com'],
  Zoom: ['zoom.com', 'zoom.us']
};

export const wordsToSkip = [
  "Al-Anon Family Groups Mobile App",
  "DialPad",
  "Discord",
  "Eitaa",
  "Facebook",
  "Free Conference Call",
  "FreeConferenceCall",
  "Google Meet",
  "GoToMeeting",
  "Jitsi",
  "JoinMe",
  "LGBTQIA+",
  "Microsoft Teams",
  "Ring Central",
  "Second Life",
  "Skype",
  "Voxer",
  "WhatsApp",
  "Zoom",
]

export function capitalizeFirstLetter(string) {
  return string?.charAt(0).toUpperCase() + string?.slice(1);
}

export function capitalizeWords(str) {
  const words = str?.split(' ');
  const capitalizedWords = words?.map(word => {
    return word?.charAt(0).toUpperCase() + word?.slice(1);
  });
  return capitalizedWords?.join(' ');
}

export function getLangCodeFromCurrentURL() {
  let pathname = window.location.pathname;
  let match = pathname.match(/\/([a-z]{2})\//);
  return match ? match[1] : null;
}