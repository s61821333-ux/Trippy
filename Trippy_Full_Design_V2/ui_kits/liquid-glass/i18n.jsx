/* ════════════════════════════════════════════════════════════════════════
   Trippy Liquid Glass — i18n (English / עברית)
   window.LANG is set by App before each render; t() looks up Hebrew by the
   English source string (falls back to the English itself). Proper nouns and
   numbers pass through unchanged.
   ════════════════════════════════════════════════════════════════════════ */
window.LANG = 'en';

const HE = {
  // nav + chrome
  'Trip': 'טיול', 'Days': 'ימים', 'Map': 'מפה', 'Pack': 'ציוד', 'Crew': 'צוות',
  'Settings': 'הגדרות', 'Switch trip': 'החלף טיול', 'Active trip': 'טיול פעיל',
  // welcome / home
  'Plan together. Discover more.': 'מתכננים יחד. מגלים יותר.',
  'The new standard in collaborative travel. From desert dunes to city lights, your journey begins here.':
    'הסטנדרט החדש לתכנון טיולים משותף. מהדיונות במדבר ועד אורות העיר — המסע שלך מתחיל כאן.',
  'Start an adventure': 'צא להרפתקה', 'Document': 'תיעוד', 'Discover': 'גילוי', 'Collaborate': 'שיתוף',
  'Hey, Guy Ahron': 'היי, Guy Ahron', 'Where to': 'לאן', 'next?': 'הלאה?',
  'Your adventures are waiting.': 'ההרפתקאות שלך מחכות.',
  'Create a new trip': 'צור טיול חדש', 'Plan one with AI': 'תכנן טיול עם AI', 'Your trips': 'הטיולים שלך',
  'days': 'ימים', 'days to go': 'ימים נותרו',
  // dashboard
  'United States': 'ארצות הברית', 'Local time': 'שעה מקומית', 'Weather': 'מזג אוויר',
  'Next up': 'הבא בתור', 'Packed': 'ארוז', 'Budget': 'תקציב', 'of': 'מתוך',
  'Trippy AI': 'Trippy AI', 'Trip summary': 'סיכום הטיול',
  'Day 1 & 3 have open afternoons. I can suggest things to do nearby.':
    'בימים 1 ו-3 יש אחר־צהריים פנויים. אפשר להציע פעילויות בקרבת מקום.',
  '16 days · 9 events planned · NYC, then a road trip west. You\u2019re 62% packed and on budget.':
    '16 ימים · 9 אירועים מתוכננים · ניו יורק, ואז מסע מערבה. ארזת 62% ובתוך התקציב.',
  'See suggestions': 'ראה הצעות', 'Today': 'היום', 'Flight to New York': 'טיסה לניו יורק',
  // day
  'Adventure': 'הרפתקה', 'Day': 'יום', 'List': 'רשימה', 'Timeline': 'ציר זמן',
  'events': 'אירועים', 'free': 'פנוי', 'free time': 'זמן פנוי', 'Add an event': 'הוסף אירוע',
  'Day budget': 'תקציב יומי', 'Stay': 'לינה', 'Checkout': 'צ\u2019ק־אאוט',
  'Flight to JFK': 'טיסה ל-JFK', 'Hotel check-in': 'צ\u2019ק־אין למלון', 'Dinner, Hell\u2019s Kitchen': 'ארוחת ערב',
  'Quick edit': 'עריכה מהירה', 'Reschedule': 'שנה מועד', 'Suggest nearby': 'הצע בקרבת מקום',
  'Duration': 'משך', 'Notes': 'הערות', 'Cost': 'עלות', 'Add stop after': 'הוסף עצירה אחרי',
  // sheets
  'Add event': 'הוסף אירוע', 'Edit event': 'ערוך אירוע', 'Event name': 'שם האירוע',
  'Start': 'התחלה', 'Category': 'קטגוריה', 'Location (optional)': 'מיקום (אופציונלי)',
  'Cost (optional)': 'עלות (אופציונלי)', 'Save changes': 'שמור שינויים', 'Cancel': 'ביטול',
  'Flight': 'טיסה', 'Drive': 'נסיעה', 'Rest': 'מנוחה', 'Hotel': 'מלון', 'Sight': 'אתר',
  'Cafe': 'קפה', 'Food': 'אוכל', 'Beach': 'חוף', 'Sport': 'ספורט', 'Other': 'אחר',
  'AI suggestions': 'הצעות AI', 'Tailored to your day & pace': 'מותאם ליום ולקצב שלך',
  'Add to day': 'הוסף ליום', 'Dismiss': 'דחה',
  'Create a new trip': 'צור טיול חדש', 'Pick a vibe, name it, share the link': 'בחר אווירה, תן שם, שתף קישור',
  'Background': 'רקע', 'Trip name': 'שם הטיול', 'Your nickname': 'הכינוי שלך', 'Create trip': 'צור טיול',
  'Desert': 'מדבר', 'Nature': 'טבע', 'City': 'עיר',
  // map
  'Search your trip': 'חפש בטיול', 'Explore': 'גלה', 'Route': 'מסלול', 'Open': 'פתוח',
  '8 min walk from hotel': '8 דק\u2019 הליכה מהמלון',
  // pack
  'Adventure prep': 'הכנות לטיול', 'Packing': 'אריזה', 'Almost there': 'כמעט שם',
  'packed · shared with crew': 'ארוז · משותף עם הצוות', 'All': 'הכל',
  'Documents': 'מסמכים', 'Gear': 'ציוד', 'Health': 'בריאות',
  'Passports + ESTA': 'דרכונים + ESTA', 'Camera & batteries': 'מצלמה + סוללות',
  'USD cash float': 'מזומן בדולרים', 'Sunscreen SPF 50': 'קרם הגנה SPF 50',
  'Day pack': 'תיק יום', 'Snacks for the flight': 'חטיפים לטיסה',
  // crew
  'Gather the tribe': 'אספו את החבורה',
  'Add friends to sync itineraries and share memories in real time.':
    'הוסיפו חברים לסנכרון מסלולים ושיתוף זיכרונות בזמן אמת.',
  'Invite by email': 'הזמן באימייל', 'Send invites': 'שלח הזמנות', 'or magic link': 'או קישור קסם',
  'Current crew': 'הצוות הנוכחי', 'Organizer': 'מארגן', 'Member': 'חבר', 'you': 'אתה',
  // settings
  'Trip & preferences': 'טיול והעדפות', 'Appearance': 'מראה', 'Light': 'בהיר', 'Dark': 'כהה', 'System': 'מערכת',
  'High contrast': 'ניגודיות גבוהה', 'WCAG AA boosted': 'תקן WCAG AA', 'Reduce motion': 'הפחתת תנועה',
  'Calm transitions': 'מעברים רגועים', 'Currency': 'מטבע', 'USD — US Dollar': 'USD — דולר אמריקאי',
  'Language': 'שפה', 'Export as PDF': 'ייצוא כ-PDF', 'Printable itinerary': 'מסלול להדפסה',
  'Delete trip': 'מחק טיול', 'English / עברית': 'עברית / English',
};

function t(s) { return (window.LANG === 'he' && HE[s]) ? HE[s] : s; }
window.t = t;
window.dir = () => (window.LANG === 'he' ? 'rtl' : 'ltr');
