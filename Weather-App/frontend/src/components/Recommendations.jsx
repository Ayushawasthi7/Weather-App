import React, { useEffect, useState } from 'react';
import { Shirt, Plane, Leaf, HelpCircle } from 'lucide-react';
import { getTranslation } from '../utils/translations';

export const Recommendations = ({ currentData, lang }) => {
  const [advice, setAdvice] = useState({ clothing: '', travel: '', farming: '' });

  useEffect(() => {
    if (!currentData) return;

    const { temp, windSpeed, rainProbability, visibility } = currentData;
    let clothingText = "";
    let travelText = "";
    let farmingText = "";

    // 1. Clothing Advice
    if (temp < 12) {
      clothingText = lang === 'hi'
        ? "अत्यधिक ठंड है! गर्म ऊनी कपड़े, जैकेट, मफलर और थर्मल इनर वियर पहनें। पैरों और हाथों को गर्म रखें।"
        : "It's cold out! Put on heavy woolens, thermal layers, jackets, and gloves. Keep extremities warm.";
    } else if (temp < 22) {
      clothingText = lang === 'hi'
        ? "हल्की ठंड है। एक हल्का स्वेटर, हुडी या कार्डिगन पहनने की सलाह दी जाती है।"
        : "Mild conditions. A light jacket, hoodie, or cardigan will keep you comfortable.";
    } else if (temp >= 32) {
      clothingText = lang === 'hi'
        ? "काफी गर्मी है! सूती और हल्के कपड़े पहनें। धूप का चश्मा लगाएं, सनस्क्रीन लगाएं और टोपी पहनें।"
        : "Hot temperatures. Wear breathable, light-colored cotton clothes. Carry sunglasses, sunscreen, and a cap.";
    } else {
      clothingText = lang === 'hi'
        ? "मौसम सामान्य है। नियमित आरामदायक कपड़े या कैजुअल परिधान पहनें।"
        : "Pleasant weather. Standard comfortable clothing, shirts, or casual wear is ideal.";
    }

    if (rainProbability > 50) {
      clothingText += lang === 'hi'
        ? " साथ ही, बारिश की पूरी संभावना है, बाहर जाते समय छाता या रेनकोट अवश्य साथ रखें।"
        : " Additionally, rain is likely; do not forget to carry an umbrella or a rain jacket.";
    }

    // 2. Travel Advice
    if (visibility < 3 || windSpeed > 45) {
      travelText = lang === 'hi'
        ? "खराब दृश्यता या तेज हवाओं के कारण यात्रा की स्थिति जोखिम भरी है। यदि आवश्यक न हो तो ड्राइविंग से बचें और उड़ानों की स्थिति की जांच करें।"
        : "Hazardous travel conditions. Low visibility or extreme winds might cause flight delays. Drive with extra caution.";
    } else if (rainProbability > 70) {
      travelText = lang === 'hi'
        ? "भारी बारिश के आसार हैं। जलजमाव वाले क्षेत्रों और पहाड़ी मार्गों पर यात्रा करने से बचें।"
        : "Expect wet roads and potential water-logging. Avoid mountain passes or low-lying routes if driving.";
    } else if (temp > 38) {
      travelText = lang === 'hi'
        ? "तेज लू चल रही है। दोपहर के समय लंबी यात्रा करने से बचें। यदि आवश्यक हो, तो वाहन का एसी चालू रखें।"
        : "Severe heatwave. Avoid traveling during peak afternoon hours. Keep vehicle ventilation and hydration ready.";
    } else {
      travelText = lang === 'hi'
        ? "यात्रा के लिए अनुकूल दिन है! सुहावना मौसम आउटडोर गतिविधियों या लंबी सैर के लिए बिल्कुल सही है।"
        : "Excellent conditions for travel! Clear skies and normal winds make it a perfect day for a trip.";
    }

    // 3. Farming/Agricultural Advice
    if (rainProbability > 65) {
      farmingText = lang === 'hi'
        ? "निकट भविष्य में बारिश की उम्मीद है। फसलों की सिंचाई रोक दें और खेतों में जल निकासी की व्यवस्था सुनिश्चित करें।"
        : "Rainfall expected. Postpone irrigation activities and ensure proper drainage channels in your fields.";
    } else if (windSpeed > 24) {
      farmingText = lang === 'hi'
        ? "हवा की गति तेज है। कीटनाशकों या उर्वरक का छिड़काव करने से बचें, क्योंकि हवा के साथ इनके बह जाने का खतरा है।"
        : "Wind gusts are strong. Suspend pesticide or chemical spraying as chemical drift risk is high.";
    } else if (temp > 36) {
      farmingText = lang === 'hi'
        ? "वाष्पीकरण की दर अधिक है। सुबह या शाम के समय फसलों को अतिरिक्त पानी दें। नाजुक पौधों को शेड नेट से ढकें।"
        : "High evapotranspiration rate. Increase watering frequency in early morning/evening. Shield young crops from heat stress.";
    } else {
      farmingText = lang === 'hi'
        ? "मौसम कृषि कार्यों के लिए उपयुक्त है। कीटनाशकों का छिड़काव करने, निराई-गुड़ाई करने और फसल की कटाई के लिए उत्तम दिन है।"
        : "Weather is highly favorable for farming. Perfect day for weeding, fertilizer application, or harvesting activities.";
    }

    setAdvice({ clothing: clothingText, travel: travelText, farming: farmingText });
  }, [currentData, lang]);

  return (
    <div className="glass-panel rounded-3xl p-5 border border-white/5 flex flex-col gap-4">
      <div>
        <h3 className="text-white font-extrabold text-base sm:text-lg">
          {getTranslation(lang, 'recommendations')}
        </h3>
        <p className="text-slate-400 text-xs mt-0.5">
          {lang === 'hi' ? 'मौसम के आधार पर विशेष सलाह' : 'Smart insights tailored to current conditions'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        {/* Clothing Card */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center gap-2.5 text-amber-300">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/20">
              <Shirt className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">{getTranslation(lang, 'clothing')}</h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            {advice.clothing}
          </p>
        </div>

        {/* Travel Card */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center gap-2.5 text-sky-300">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-400/20">
              <Plane className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">{getTranslation(lang, 'travel')}</h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            {advice.travel}
          </p>
        </div>

        {/* Farming Card */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center gap-2.5 text-emerald-300">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
              <Leaf className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">{getTranslation(lang, 'farming')}</h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            {advice.farming}
          </p>
        </div>
      </div>
    </div>
  );
};
export default Recommendations;
