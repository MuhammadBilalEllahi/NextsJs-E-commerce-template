"use client";

/**
 * Multilingual Voice Assistant
 * Supports English and Urdu voice shopping
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Loader2, Globe } from "lucide-react";
import { t, Language, detectLanguage, getTextDirection } from "@/lib/i18n/translations";

interface VoiceAssistantMultilangProps {
  onTranscript?: (text: string, lang: Language) => void;
  onResponse?: (text: string, lang: Language) => void;
}

export default function VoiceAssistantMultilang({
  onTranscript,
  onResponse,
}: VoiceAssistantMultilangProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Check browser support
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      // Detect initial language
      const detectedLang = detectLanguage();
      setLanguage(detectedLang);
    }
  }, []);

  const startListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Set language for recognition
    recognition.lang = language === "ur" ? "ur-PK" : "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      setIsListening(false);
      
      if (onTranscript) {
        onTranscript(transcript, language);
      }

      // Process with AI assistant
      await processVoiceCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const processVoiceCommand = async (text: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{role: "user", content: text }],
          userId: "voice-user",
          language,
        }),
      });

      const data = await response.json();
      const responseText = data.message || t("common.error", language);
      
      setResponse(responseText);
      
      if (onResponse) {
        onResponse(responseText, language);
      }

      // Speak the response in the selected language
      speakResponse(responseText);
    } catch (error) {
      console.error("Error processing voice command:", error);
      setResponse(t("common.error", language));
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    if (typeof window === "undefined") return;

    const synthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on language
    const voices = synthesis.getVoices();
    const urduVoice = voices.find(v => v.lang === "ur-PK" || v.lang.startsWith("ur"));
    const englishVoice = voices.find(v => v.lang === "en-US" || v.lang.startsWith("en"));
    
    if (language === "ur" && urduVoice) {
      utterance.voice = urduVoice;
      utterance.lang = "ur-PK";
    } else if (englishVoice) {
      utterance.voice = englishVoice;
      utterance.lang = "en-US";
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    synthesis.speak(utterance);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "ur" : "en");
    setTranscript("");
    setResponse("");
  };

  const textDir = getTextDirection(language);

  if (!isSupported) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-800">
            {t("voice.voiceNotSupported", language)} {t("voice.tryChrome", language)}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card dir={textDir}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            {language === "en" ? "Voice Shopping Assistant" : "آواز سے خریداری"}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            {language === "en" ? "اردو" : "English"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Microphone Button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            size="lg"
            className={`w-20 h-20 rounded-full ${
              isListening
                ? "bg-red-600 hover:bg-red-700 animate-pulse"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isProcessing ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : isListening ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>
          <p className="text-sm text-gray-600 text-center">
            {isListening
              ? t("voice.listening", language)
              : isProcessing
              ? t("voice.processing", language)
              : t("voice.clickToSpeak", language)}
          </p>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              {t("voice.youSaid", language)}
            </p>
            <p className="text-gray-700" dir={textDir}>{transcript}</p>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-semibold text-green-900 mb-1">
              {t("voice.assistant", language)}
            </p>
            <p className="text-gray-700" dir={textDir}>{response}</p>
          </div>
        )}

        {/* Suggestions */}
        <div className="text-xs text-gray-500 space-y-1" dir={textDir}>
          <p className="font-semibold">
            {language === "en" ? "Try saying:" : "کہنے کی کوشش کریں:"}
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>{t("voice.examples.search", language)}</li>
            <li>{t("voice.examples.addCart", language)}</li>
            <li>{t("voice.examples.orderStatus", language)}</li>
            <li>{t("voice.examples.recommend", language)}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}


