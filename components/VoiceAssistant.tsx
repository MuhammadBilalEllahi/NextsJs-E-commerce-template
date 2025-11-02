"use client";

/**
 * Voice + Chat Shopping Assistant
 * Integrates speech recognition with AI assistant
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";

// Note: Install with: npm install react-speech-recognition
// For now, using browser's native SpeechRecognition API

interface VoiceAssistantProps {
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
}

export default function VoiceAssistant({
  onTranscript,
  onResponse,
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check browser support
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
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
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      setIsListening(false);
      
      if (onTranscript) {
        onTranscript(transcript);
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
          messages: [{ role: "user", content: text }],
          userId: "voice-user",
        }),
      });

      const data = await response.json();
      const responseText = data.message || "I didn't understand that.";
      
      setResponse(responseText);
      
      if (onResponse) {
        onResponse(responseText);
      }

      // Speak the response
      speakResponse(responseText);
    } catch (error) {
      console.error("Error processing voice command:", error);
      setResponse("Sorry, I encountered an error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    if (typeof window === "undefined") return;

    const synthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    synthesis.speak(utterance);
  };

  if (!isSupported) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-800">
            Voice assistant not supported in this browser. Try Chrome or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Voice Shopping Assistant
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
              ? "🎤 Listening... Speak now"
              : isProcessing
              ? "🤔 Processing..."
              : "Click to speak"}
          </p>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              You said:
            </p>
            <p className="text-gray-700">{transcript}</p>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-semibold text-green-900 mb-1">
              Assistant:
            </p>
            <p className="text-gray-700">{response}</p>
          </div>
        )}

        {/* Suggestions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-semibold">Try saying:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>&quot;Show me red chili powder&quot;</li>
            <li>&quot;Add garam masala to cart&quot;</li>
            <li>&quot;What&apos;s my order status?&quot;</li>
            <li>&quot;Recommend spicy products&quot;</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

