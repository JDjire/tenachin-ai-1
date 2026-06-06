'use client';

import React, { Suspense } from 'react';
import ChatbotContent from './chatbot-content';

export default function ChatbotPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background">Loading chatbot...</div>}>
      <ChatbotContent />
    </Suspense>
  );
}

