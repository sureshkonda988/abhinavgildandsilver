export const BASE_URL = 'https://abhinavgildandsilver-git-main-sureshs-projects-386c3552.vercel.app';
export const API_URL = `${BASE_URL}/api`;

export const ENDPOINTS = {
  RATES: {
    LIVE: `${API_URL}/rates/live`,
    SETTINGS: `${API_URL}/rates/settings`,
    PROXY: `${API_URL}/rates/proxy`,
    AUDIO: `${API_URL}/rates/audio`,
  },
  VIDEOS: `${API_URL}/videos`,
  MUSIC: {
    SETTINGS: `${API_URL}/music`,
    UPLOAD: `${API_URL}/music/upload`,
  },
};

export const EXTERNAL_SOURCES = {
  RB_GOLD_URL: 'https://bcast.rbgoldspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/rbgold',
  TEMPLATE_ID: 'rbgold',
};

export const BACKEND_KEYS = {
  MONGODB_URI: 'mongodb+srv://Vercel-Admin-abhinav:42fdaOXvKqWWXeH6@abhinav.awfrdrl.mongodb.net/?retryWrites=true&w=majority',
};

export const DEFAULT_SITE_URL = BASE_URL;
