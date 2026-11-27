import React, { createContext, useContext } from 'react';
import type { LanguageContextValue } from '../types';
import { en } from '../locales/en';

export const LanguageContext = createContext<LanguageContextValue>({
  lang: 'EN',
  t: (key: string) => key,
});

export const translations = {
  EN: {
    ...en,
    lang_en: 'English',
    'nav.weather': 'Weather',
    'nav.soil_report': 'Soil Report',
    'nav.markets': 'Market Prices',
    'markets.badge': 'Nigerian Market Prices',
    'markets.title1': 'Know the price',
    'markets.title2': 'before you sell',
    'markets.desc': 'Live Nigerian commodity and food prices from Opaindex, with a Firestore fallback and a personal watchlist.',
    'markets.attribution': 'Data: Opaindex',
    'markets.searchPlaceholder': 'Search crops, commodities, or markets...',
    'markets.allCategories': 'All categories',
    'markets.allMarkets': 'All markets',
    'markets.watchOnly': 'Watchlist only',
    'markets.refresh': 'Refresh',
    'markets.live': 'Live Opaindex',
    'markets.fallback': 'Firestore fallback',
    'markets.noResults': 'No prices match these filters.',
    'markets.clearFilters': 'Clear filters',
    'markets.showing': 'Showing',
    
    'detect.tag': 'AI-Powered Intelligence',
    'detect.title1': 'Detect Crop Disease ',
    'detect.title2': 'Instantly',
    'detect.desc': 'Upload a clear photo of your affected plant. Our localized AI engine will instantly identify diseases and provide a personalized, actionable treatment plan.',
    'detect.stats': ['✅ High Precision Models', '🌿 Offline Capable Engine', '⚡ Lightning Fast Output'],

    'upload.drop': 'Drop crop photo here',
    'upload.or_select': 'or select using the buttons below',
    'upload.take_photo': 'Take a Photo',
    'upload.upload_gallery': 'Upload Gallery',
    'upload.supports': 'Supports JPG, PNG, WEBP · Max 10MB',
    'upload.tips_title': 'Tips for best results',
    'upload.tip1': 'Good lighting',
    'upload.tip2': 'Close-up of area',
    'upload.tip3': 'Keep camera steady',
    'upload.tip4': 'Include leaves clearly',
    'history.title': 'Your Recent Scans',
    'history.view_all': 'View All',
    'history.no_scans': 'No scans yet — scan your first crop above!',
    'history.healthy': 'Healthy Plant',
    'history.unknown_disease': 'Unknown Disease',
    'history.unknown_crop': 'Unknown Crop',

    'hero.title1': 'Meet Your',
    'hero.title2': 'Digital Farming Companion!',
    'hero.subtitle': 'Empowering Farmers',
    'hero.desc': 'Advanced AI to detect crop diseases in seconds. Reliable, simple, and works right in your palm.',
    'hero.downloadBtn': 'Download Now',
    'hero.scanningActive': 'SCANNING ACTIVE IN',
    'hero.districts': '200+ DISTRICTS',

    'stats.tag': 'Trust Metrics',
    'stats.title': 'Growing Together',
    'stats.items': [
      { number: '10K+', label: 'Active Farmers', value: '10,000+', sublabel: 'Across India' },
      { number: '50K+', label: 'Detections Done', value: '50,000+', sublabel: 'Successful scans' },
      { number: '98%',  label: 'AI Accuracy',     value: '98%',     sublabel: 'Clinically verified' },
      { number: '24/7', label: 'Farmer Support',  value: '24/7',    sublabel: 'Always with you' }
    ],

    'features.tag': 'Key Features',
    'features.title': 'Everything you need',
    'features.desc': 'FasalRakshak brings powerful agricultural AI technology directly to your hands.',
    'features.items': [
      { title: 'Offline Mode', desc: 'No internet? No problem. The app works offline in your fields!' },
      { title: 'Local Languages', desc: 'Get results in your language — Hindi, Gujarati, or English!' },
      { title: '2-Second AI', desc: 'Our AI model identifies diseases in just 2 seconds.' },
      { title: 'Treatment Guide', desc: 'Get clear medicine names, dosage, and application tips.' },
      { title: 'Scan History', desc: 'Review all your past scans and crop health records.' },
      { title: 'Weather Risk', desc: 'Stay updated with local weather risks to your crops.' }
    ],

    'testimonials.tag': 'Farmer Stories',
    'testimonials.title': 'Loved by Farmers',
    'testimonials.desc': 'See how FasalRakshak is changing lives across India.',
    'testimonials.testimonials': [
      {
        name: "Rameshbhai Patel", location: "Anand, Gujarat",
        quote: "My groundnut crop was getting destroyed. FasalRakshak identified the disease in just 2 seconds. My crop is saved and I saved a lot of money!",
        cropLabel: "🥜 Groundnut (Mungfali) Farmer"
      },
      {
        name: "Sureshbhai Chauhan", location: "Rajkot, Gujarat",
        quote: "Results in Gujarati — very easy to understand. Medicine name and dosage are all written in the app. Thank you FasalRakshak!",
        cropLabel: "🌿 Cotton (Kapas) Farmer"
      },
      {
        name: "Dineshbhai Desai", location: "Saurashtra, Gujarat",
        quote: "Earlier I had to visit the agriculture center. Now my phone is my crop expert. Very fast and useful app for wheat farmers!",
        cropLabel: "🌾 Wheat (Gehu) Farmer"
      }
    ],

    'how.tag': 'Simple Steps',
    'how.title': 'How to Use FasalRakshak',
    'how.steps': [
      { title: 'Open App', desc: 'Launch the FasalRakshak app on your smartphone.' },
      { title: 'Snap Photo', desc: 'Take a clear picture of the affected crop leaf.' },
      { title: 'Get Results', desc: 'Instantly view disease details and treatment guide.' }
    ],
    'how.supportTag': 'SUPPORTED CROPS',
    'how.supportTitle': 'Crops we currently support',
    'how.crops': [
      { name: '🥜 Groundnut', desc: 'Full lifecycle disease support' },
      { name: '🌾 Wheat', desc: 'Accurate pest & nutrient detection' },
      { name: '☁️ Cotton', desc: 'Early pest attack & disease alerts' }
    ],

    'cta.tag': 'Get Started Free',
    'cta.title': 'Protect Your Harvest Today',
    'cta.desc': 'Join 10,000+ farmers already using FasalRakshak. Free forever, works everywhere.',
    'cta.btn': 'Scan Your Crop Now',
    'cta.comingSoon': 'Coming Soon',

    'footer.subscribeTitle1': 'Track prices with the ',
    'footer.subscribeTitle2': 'Watchlist',
    'footer.subscribeDesc': 'Save the commodities you grow and check live Nigerian market prices whenever you need them.',
    'footer.emailPlaceholder': 'Enter your email address',
    'footer.subscribeBtn': 'Join Now',
    'footer.brandDesc': 'FasalRakshak is an AI-powered agriculture companion protecting crops and empowering farmers across India with organic disease detection.',
    'footer.company': 'Company',
    'footer.companyLinks': ['About Us', 'Contact', 'Blog', 'Ecosystem'],
    'footer.solutions': 'Solutions',
    'footer.solutionLinks': ['Disease Detection', 'Weather AI', 'Mandi Prices', 'Soil Health'],
    'footer.contact': 'Contact Us',
    'footer.emailUs': 'Email Support',
    'footer.helpline': 'Helpline Number',
    'footer.tollFree': 'TOLL FREE',
    'footer.headOffice': 'Head Office',
    'footer.address': 'AgriTech Hub, Sector 4, <br/>Gandhinagar, India',
    'footer.copyright': '© {year} FasalRakshak App.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms & Conditions',
    'footer.systemOp': 'SYSTEM ONLINE',

    'soil.manual': '✍️ Manual Entry',
    'soil.upload': '📄 Upload PDF',
    'soil.scan': '📸 Scan Image',
    'login.slogan': 'Your Digital Companion for Better Farming.',
    'login.googleBtn': 'Continue with Google',
    'login.secure': 'SECURE LOGIN',
    'login.free': 'FREE ACCESS',
    'login.trusted': 'TRUSTED BY 10K+ FARMERS',
    'login.designed': 'Designed with ❤️ for the Indian Farmer',
    'login.back': 'Back to Home',

    'organic.hero.tag': 'AI-POWERED AGRICULTURAL INTELLIGENCE',
    'organic.hero.title1': 'Grow ',
    'organic.hero.title2': 'Smarter.',
    'organic.hero.title3': 'Grow ',
    'organic.hero.title4': 'Organic.',
    'organic.hero.desc': 'Transform your farm with a complete smart farming ecosystem. Combine deep AI insights, Indian government support, and futuristic greenhouse logic in one click.',
    'organic.hero.btn1': 'Make My Farm Organic',
    'organic.hero.btn2': 'Explore Organic HUB',

    'disease.severe': 'Severe',
    'disease.moderate': 'Moderate',
    'disease.mild': 'Mild',
    'disease.fungal': 'Fungal',
    'disease.bacterial': 'Bacterial',
    'disease.viral': 'Viral',
    'disease.pest': 'Pest',
    'disease.nutrient': 'Nutrient',
    'disease.spreads_fast': 'Spreads Fast',
    'disease.gujarat': 'Gujarat',
    'disease.aka': 'aka',
    'disease.more_symptoms': 'more symptoms',
    'disease.view_details': 'View Details',
    'disease.search_placeholder': 'Search crop diseases, symptoms, or local names...',
    'disease.all_crops': 'All Crops',
    'disease.clear_filters': 'Clear All Filters',
    'disease.active_filters': 'Active',
    'disease.symptoms': 'Symptoms',
    'disease.causes': 'What Causes This Disease?',
    'disease.weather_conditions': 'Weather Conditions',
    'disease.treatment_plan': 'Treatment Plan',
    'disease.organic_alternative': 'Organic / Natural Alternative',
    'disease.how_to_prevent': 'How to Prevent',
    'disease.first_aid_tip': 'First Aid Tip',
    'disease.affected_states': 'Most Affected States',
    'disease.quick_actions': 'Quick Actions',
    'disease.scan_my_crop': 'Scan My Crop',
    'disease.share': 'Share',
    'disease.copy_treatment': 'Copy Treatment Steps',
    'disease.at_a_glance': 'At a Glance',
    'disease.crop': 'Crop',
    'disease.type': 'Type',
    'disease.severity': 'Severity',
    'disease.spreads': 'Spreads',
    'disease.season': 'Season',
    'disease.yield_loss': 'Yield Loss',
    'disease.contagious': 'Contagious',
    'disease.similar_diseases': 'Similar Diseases',
    'disease.other_diseases': 'Other Diseases',
    'disease.no_diseases': 'No diseases found',
    'disease.try_different': 'Try searching with different keywords or clear your filters',
    'disease.affected_parts': 'Affected Parts',
    'disease.leaf': 'Leaf',
    'disease.stem': 'Stem',
    'disease.root': 'Root',
    'disease.fruit': 'Fruit',
    'disease.flower': 'Flower',
    'weather.title': 'Agri-Weather Center',
    'weather.locating': 'Locating field...',
    'weather.search_placeholder': 'Search village or city...',
    'weather.detect_location': 'Detect Live Location',
    'weather.syncing': 'Syncing with Weather Satellites...',
    'weather.current_temp': 'Current Temp',
    'weather.soil_humidity': 'Soil Humidity',
    'weather.wind_speed': 'Wind Speed',
    'weather.rain_prob': 'Rain Probability',
    'weather.air_soil_sat': 'Air-Soil Saturation',
    'weather.avg_wind': 'Avg Current Speed',
    'weather.precip_risk': 'Precipitation Risk',
    'weather.radar_title': 'Interactive Agricultural Radar',
    'weather.windy_title': 'Windy Global Visualization',
    'weather.satellite_mode': 'Satellite (Interactive)',
    'weather.windy_mode': 'Windy (Visuals)',
    'weather.wind_animation_note': 'Wind Animation Mode (Non-interactive)',
    'weather.ai_advice_title': 'AI Intelligence Advice',
    'weather.irrigation_log': 'Irrigation Log',
    'weather.climate_trends': 'Climate Trends (7-Day)',
    'weather.temp_unit': 'Temperature (°C)',
    'weather.rain_unit': 'Rain Prob (%)',
    'weather.clear': 'Clear sky',
    'weather.sunny': 'Sunny',
    'weather.p_cloudy': 'Partly cloudy',
    'weather.cloudy': 'Cloudy',
    'weather.foggy': 'Foggy',
    'weather.rainy': 'Rainy',
    'weather.showers': 'Showers',
    'weather.storm': 'Thunderstorm',
    'weather.advice_humidity': 'Very high humidity. Risk of Leaf Rust disease.',
    'weather.advice_rain': 'High rain probability. Do not apply solid fertilizers.',
    'weather.advice_heat': 'Critical heatwave warning. Double irrigation immediately.',
    'weather.advice_wind': 'Strong winds detected. Secure tall plants.',
    'weather.advice_optimal': 'Optimal agricultural conditions today.',
    'weather.irrigation_heavy_rain': '⚠️ Heavy rain detected. Pause irrigation for next 24 hours to prevent soil erosion.',
    'weather.irrigation_clear': '✅ Clear skies. Proceed with standard irrigation cycles between 6:00 AM - 9:00 AM.',
    'weather.location_verified': 'Location Verified',
    'weather.current_selection': 'Current Selection',
    'weather.fetch_failed': 'Failed to fetch weather for this location.'
  },
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const t = (key: string): any => {
    const result = translations.EN;

    if (result && result[key] !== undefined) {
      return result[key];
    }

    const keys = key.split('.');
    let current: any = result;
    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        if (key.includes('Links') || key.includes('items') || key.includes('steps') || key.includes('stats') || key.includes('crops') || key.includes('testimonials')) {
          return [];
        }
        return key;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ lang: 'EN', t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
