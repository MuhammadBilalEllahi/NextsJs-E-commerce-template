"use client";

/**
 * Voice Shopping Experience Page
 * Complete voice-enabled shopping with AI assistant
 */

import { useState } from "react";
import VoiceAssistant from "@/components/VoiceAssistant";
import AIAssistant from "@/components/AIAssistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MessageSquare, Sparkles } from "lucide-react";

export default function VoiceShopPage() {
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");

  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-10 w-10 text-purple-600" />
          <h1 className="text-5xl font-bold">Voice Shopping</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Shop using your voice! Say what you want, and let our AI assistant help
          you find, compare, and buy products effortlessly.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Voice Assistant */}
        <div>
          <VoiceAssistant
            onTranscript={setTranscript}
            onResponse={setResponse}
          />
        </div>

        {/* Chat Assistant */}
        <div>
          <AIAssistant defaultMinimized={false} />
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-blue-600" />
              Hands-Free Shopping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Browse and buy products without touching your keyboard or mouse.
              Perfect for multitasking!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Natural Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Ask questions naturally like &quot;What&apos;s on sale?&quot; or
              &quot;Find spicy products under Rs. 300&quot;.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI-Powered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Smart recommendations, automatic coupon application, and
              personalized suggestions powered by AI.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>How Voice Shopping Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Click Microphone</h3>
              <p className="text-sm text-gray-600">
                Tap the mic button to start listening
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Speak Naturally</h3>
              <p className="text-sm text-gray-600">
                Say what you&apos;re looking for or ask a question
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">AI Processes</h3>
              <p className="text-sm text-gray-600">
                Our assistant understands and searches for you
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Get Results</h3>
              <p className="text-sm text-gray-600">
                See and hear the results instantly
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Commands */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Try These Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-blue-600">
                🔍 Search & Browse
              </h4>
              <ul className="space-y-1 text-sm">
                <li>• &quot;Show me red chili powder&quot;</li>
                <li>• &quot;Find organic spices under Rs. 500&quot;</li>
                <li>• &quot;What pickles do you have?&quot;</li>
                <li>• &quot;Search for garam masala&quot;</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-green-600">
                🛒 Shopping Actions
              </h4>
              <ul className="space-y-1 text-sm">
                <li>• &quot;Add this to my cart&quot;</li>
                <li>• &quot;Apply a coupon&quot;</li>
                <li>• &quot;Checkout now&quot;</li>
                <li>• &quot;Buy this for me&quot;</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-purple-600">
                💡 Recommendations
              </h4>
              <ul className="space-y-1 text-sm">
                <li>• &quot;Recommend spicy products&quot;</li>
                <li>• &quot;What goes well with turmeric?&quot;</li>
                <li>• &quot;Show me your bestsellers&quot;</li>
                <li>• &quot;Suggest products for me&quot;</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-orange-600">
                📦 Order & Help
              </h4>
              <ul className="space-y-1 text-sm">
                <li>• &quot;What&apos;s my order status?&quot;</li>
                <li>• &quot;How do I return an item?&quot;</li>
                <li>• &quot;What&apos;s your shipping policy?&quot;</li>
                <li>• &quot;Track my order&quot;</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

