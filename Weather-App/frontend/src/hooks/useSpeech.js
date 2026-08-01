import { useState, useEffect, useRef } from 'react';

export const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const speechRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      recognitionRef.current = rec;
    }
  }, []);

  // Voice Search (Speech-To-Text)
  const startVoiceSearch = (lang = 'en', onResult, onError) => {
    if (!recognitionRef.current) {
      if (onError) onError("Speech recognition not supported in this browser.");
      return;
    }

    recognitionRef.current.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    setIsListening(true);

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // Remove punctuation that speech recognition might append
      const cleanTranscript = transcript.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim();
      if (onResult) onResult(cleanTranscript);
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event);
      if (onError) onError(event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn("Speech recognition already running", e);
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Text-To-Speech (Narrate Weather)
  const narrateWeather = (weatherData, lang = 'en') => {
    if (!window.speechSynthesis) {
      console.warn("Speech synthesis not supported in this browser.");
      return;
    }

    // If currently speaking, cancel it (toggle off behavior)
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const { city, temp, tempUnit, condition, humidity, windSpeed, windUnit } = weatherData;
    let text = "";

    if (lang === 'hi') {
      text = `वर्तमान में ${city} में तापमान ${temp} डिग्री ${tempUnit === '°C' ? 'सेल्सियस' : 'फॉरेनहाइट'} है। यहाँ मौसम ${condition} है। हवा की गति ${windSpeed} ${windUnit === 'km/h' ? 'किलोमीटर प्रति घंटा' : 'मील प्रति घंटा'} है, और हवा में नमी ${humidity} प्रतिशत है।`;
    } else {
      text = `Currently in ${city}, the temperature is ${temp} degrees ${tempUnit === '°C' ? 'Celsius' : 'Fahrenheit'}. The weather condition is ${condition}. Wind speed is ${windSpeed} ${windUnit}, and humidity is at ${humidity} percent.`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

    // Try to find a fitting voice (optional enhancement)
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(lang === 'hi' ? 'hi' : 'en'));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    startVoiceSearch,
    stopVoiceSearch,
    narrateWeather,
    stopSpeaking
  };
};
