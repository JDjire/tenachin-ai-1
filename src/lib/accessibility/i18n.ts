// src/lib/accessibility/i18n.ts
// Internationalization setup for English, Amharic, and Oromo

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ' },
  { code: 'om', label: 'Oromo', nativeLabel: 'Afaan Oromoo' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

// ─── Translation resources ───────────────────────────────────

const resources = {
  en: {
    translation: {
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.scanner': 'Food Scanner',
      'nav.analytics': 'Analytics',
      'nav.chatbot': 'AI Assistant',
      'nav.accessibility': 'Accessibility',
      'nav.admin': 'Admin',
      'nav.settings': 'Settings',
      'nav.logout': 'Log Out',

      // Dashboard
      'dashboard.greeting': 'Good {{timeOfDay}}, {{name}}',
      'dashboard.score': 'Health Score',
      'dashboard.bmi': 'BMI',
      'dashboard.streak': 'Day Streak',
      'dashboard.calories': 'Calories Today',
      'dashboard.companion_greeting': 'Good {{timeOfDay}}, {{name}}. Your diabetes management score improved by {{improvement}}% this week.',
      'dashboard.streak_message': 'You have maintained your healthy eating streak for {{days}} days. Keep it up!',

      // Scanner
      'scanner.title': 'AI Food Scanner',
      'scanner.upload': 'Upload or take a photo',
      'scanner.analyze': 'Analyze Food',
      'scanner.narrate': 'Camera Narration',
      'scanner.listening': 'Listening...',
      'scanner.result': 'Analysis Result',

      // Emergency
      'emergency.sos': 'SOS Emergency',
      'emergency.help': 'Press for Emergency Help',
      'emergency.calling': 'Contacting Emergency Services...',
      'emergency.nearest': 'Nearest Hospital',
      'emergency.voice_prompt': 'Describe your symptoms by voice',
      'emergency.share_location': 'Share Location',

      // Accessibility
      'a11y.title': 'Accessibility Settings',
      'a11y.vision': 'Vision Assistance',
      'a11y.hearing': 'Hearing Assistance',
      'a11y.mobility': 'Mobility Assistance',
      'a11y.large_text': 'Large Text',
      'a11y.high_contrast': 'High Contrast',
      'a11y.voice_nav': 'Voice Navigation',
      'a11y.screen_reader': 'Screen Reader Optimized',
      'a11y.visual_alerts': 'Visual Alerts',
      'a11y.captions': 'Captions',
      'a11y.text_responses': 'Text-Based AI Responses',
      'a11y.voice_only': 'Voice-Only Mode',
      'a11y.large_buttons': 'Larger Buttons',
      'a11y.simple_nav': 'Simplified Navigation',
      'a11y.language': 'Language',

      // Voice Assistant
      'voice.title': 'Voice Health Assistant',
      'voice.tap_to_speak': 'Tap to speak',
      'voice.listening': 'Listening...',
      'voice.processing': 'Processing...',
      'voice.speaking': 'Speaking...',
      'voice.error': 'Could not understand. Please try again.',

      // AI Companion
      'companion.name': 'Tenachin',
      'companion.role': 'Your AI Health Companion',

      // Common
      'common.loading': 'Loading...',
      'common.error': 'Something went wrong',
      'common.retry': 'Retry',
      'common.close': 'Close',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.back': 'Back',
    },
  },
  am: {
    translation: {
      // Navigation
      'nav.dashboard': 'ዳሽቦርድ',
      'nav.scanner': 'ምግብ ስካነር',
      'nav.analytics': 'ትንተና',
      'nav.chatbot': 'AI ረዳት',
      'nav.accessibility': 'ተደራሽነት',
      'nav.admin': 'አስተዳዳሪ',
      'nav.settings': 'ቅንብሮች',
      'nav.logout': 'ውጣ',

      // Dashboard
      'dashboard.greeting': 'ደህና {{timeOfDay}} {{name}}',
      'dashboard.score': 'የጤና ውጤት',
      'dashboard.bmi': 'BMI',
      'dashboard.streak': 'የቀን ስትሪክ',
      'dashboard.calories': 'ዛሬ ካሎሪ',
      'dashboard.companion_greeting': 'ደህና {{timeOfDay}} {{name}}። የስኳር በሽታ አያያዝ ውጤትዎ በዚህ ሳምንት በ{{improvement}}% ተሻሽሏል።',
      'dashboard.streak_message': 'ጤናማ አመጋገብ ለ{{days}} ቀናት ቀጥለዋል። ቀጥሉ!',

      // Scanner
      'scanner.title': 'AI ምግብ ስካነር',
      'scanner.upload': 'ፎቶ ያስገቡ ወይም ያንሱ',
      'scanner.analyze': 'ምግብ ተንትን',
      'scanner.narrate': 'ካሜራ ትረካ',
      'scanner.listening': 'እያዳመጠ...',
      'scanner.result': 'የትንተና ውጤት',

      // Emergency
      'emergency.sos': 'SOS ድንገተኛ',
      'emergency.help': 'ለድንገተኛ እገዛ ይጫኑ',
      'emergency.calling': 'የድንገተኛ አገልግሎት እያገናኘ...',
      'emergency.nearest': 'ቅርብ ሆስፒታል',
      'emergency.voice_prompt': 'ምልክቶችዎን በድምፅ ይግለጹ',
      'emergency.share_location': 'ቦታ ያጋሩ',

      // Accessibility
      'a11y.title': 'የተደራሽነት ቅንብሮች',
      'a11y.vision': 'የእይታ እገዛ',
      'a11y.hearing': 'የመስማት እገዛ',
      'a11y.mobility': 'የእንቅስቃሴ እገዛ',
      'a11y.large_text': 'ትልቅ ጽሑፍ',
      'a11y.high_contrast': 'ከፍተኛ ንፅፅር',
      'a11y.voice_nav': 'የድምፅ ዳሰሳ',
      'a11y.screen_reader': 'የስክሪን አንባቢ ተስተካክሏል',
      'a11y.visual_alerts': 'ምስላዊ ማንቂያዎች',
      'a11y.captions': 'ግልባጮች',
      'a11y.text_responses': 'ጽሑፍ ላይ የተመሰረተ AI ምላሽ',
      'a11y.voice_only': 'በድምፅ ብቻ',
      'a11y.large_buttons': 'ትልቅ ቁልፎች',
      'a11y.simple_nav': 'ቀላል ዳሰሳ',
      'a11y.language': 'ቋንቋ',

      // Voice Assistant
      'voice.title': 'የድምፅ ጤና ረዳት',
      'voice.tap_to_speak': 'ለመናገር ይጫኑ',
      'voice.listening': 'እያዳመጠ...',
      'voice.processing': 'በማቀናበር ላይ...',
      'voice.speaking': 'በመናገር ላይ...',
      'voice.error': 'ሊረዳ አልቻለም። እባክዎ እንደገና ይሞክሩ።',

      // AI Companion
      'companion.name': 'ጤናችን',
      'companion.role': 'የ AI ጤና ጓደኛዎ',

      // Common
      'common.loading': 'በመጫን ላይ...',
      'common.error': 'ስህተት ተፈጥሯል',
      'common.retry': 'እንደገና ሞክር',
      'common.close': 'ዝጋ',
      'common.save': 'አስቀምጥ',
      'common.cancel': 'ሰርዝ',
      'common.back': 'ተመለስ',
    },
  },
  om: {
    translation: {
      // Navigation
      'nav.dashboard': 'Daashboordii',
      'nav.scanner': "Iskaanarii Nyaata",
      'nav.analytics': 'Xiinxala',
      'nav.chatbot': 'Gargaaraa AI',
      'nav.accessibility': "Argamuu",
      'nav.admin': 'Bulchiinsa',
      'nav.settings': 'Qindaa\'ina',
      'nav.logout': 'Ba\'i',

      // Dashboard
      'dashboard.greeting': 'Nagaatti {{timeOfDay}} {{name}}',
      'dashboard.score': 'Qabxii Fayyaa',
      'dashboard.bmi': 'BMI',
      'dashboard.streak': 'Guyyaa Walfaanaa',
      'dashboard.calories': 'Kaalorii Har\'a',
      'dashboard.companion_greeting': 'Nagaatti {{timeOfDay}} {{name}}. Qabxiin itti fayyadama dhibee sukkaaraa kee torban kana {{improvement}}% fooyyeessee jira.',
      'dashboard.streak_message': 'Soorata fayyaa guyyaa {{days}}f itti fuftee jirta. Itti fufi!',

      // Scanner
      'scanner.title': 'Iskaanarii Nyaata AI',
      'scanner.upload': 'Suuraa galchi ykn kaasi',
      'scanner.analyze': 'Nyaata Xiinxali',
      'scanner.narrate': 'Kaameraa Ibsuu',
      'scanner.listening': 'Dhaggeeffachaa...',
      'scanner.result': "Bu'aa Xiinxala",

      // Emergency
      'emergency.sos': 'SOS Balaa Tasaa',
      'emergency.help': 'Gargaarsa balaaf tuqi',
      'emergency.calling': 'Tajaajila balaa tasaa quunnamaa...',
      'emergency.nearest': 'Hospitaala Dhiheenyaa',
      'emergency.voice_prompt': 'Mallattoo kee sagaleen ibsi',
      'emergency.share_location': 'Bakka Qoodi',

      // Accessibility
      'a11y.title': "Qindaa'ina Argamuu",
      'a11y.vision': 'Gargaarsa Argaa',
      'a11y.hearing': 'Gargaarsa Dhageettii',
      'a11y.mobility': 'Gargaarsa Sochii',
      'a11y.large_text': 'Barreeffama Guddaa',
      'a11y.high_contrast': 'Garaagarummaa Guddaa',
      'a11y.voice_nav': 'Qajeelfama Sagalee',
      'a11y.screen_reader': 'Dubbisaa Iskiriinii',
      'a11y.visual_alerts': 'Akeekkachiisa Argamuu',
      'a11y.captions': 'Ibsa Barreeffamaa',
      'a11y.text_responses': 'Deebii AI Barreeffamaan',
      'a11y.voice_only': 'Sagalee Qofa',
      'a11y.large_buttons': 'Qaree Guddaa',
      'a11y.simple_nav': 'Qajeelfama Salphaatiin',
      'a11y.language': 'Afaan',

      // Voice Assistant
      'voice.title': 'Gargaaraa Fayyaa Sagalee',
      'voice.tap_to_speak': 'Dubbisuuf tuqi',
      'voice.listening': 'Dhaggeeffachaa...',
      'voice.processing': "Qindaa'aa...",
      'voice.speaking': 'Dubbachaa...',
      'voice.error': 'Hubachuu hin dandeenye. Irra deebi\'ii yaali.',

      // AI Companion
      'companion.name': 'Fayyaakoo',
      'companion.role': 'Hiriyaa Fayyaa AI Kee',

      // Common
      'common.loading': "Fe'aa jira...",
      'common.error': 'Dogoggorri uumameera',
      'common.retry': 'Irra deebi\'i yaali',
      'common.close': 'Cufi',
      'common.save': 'Kuusi',
      'common.cancel': 'Haquu',
      'common.back': "Duuba deebi'i",
    },
  },
};

// ─── Initialize i18n ─────────────────────────────────────────

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
