import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, MessageCircle } from 'lucide-react';

type Prediction = {
  title: string;
  description: string;
  progress: number;
}

type Section = {
  title: string;
  description: string;
  predictions: Prediction[];
}

type Predictions = {
  [key: string]: Section;
}

export default function PredictionTracker() {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const predictions: Predictions = {
    biology: {
      title: "Biology and Physical Health",
      description: "Timeline: 5-10 years after powerful AI development to achieve '50-100 years of progress'",
      predictions: [
        {
          title: "Infectious Disease Prevention",
          description: "Reliable prevention and treatment of nearly all natural infectious disease",
          progress: 35,
        },
        {
          title: "Cancer Treatment",
          description: "95%+ reduction in cancer mortality and incidence",
          progress: 20,
        },
        {
          title: "Genetic Disease",
          description: "Prevention and cures for most genetic diseases through improved screening and CRISPR advances",
          progress: 30,
        },
        {
          title: "Alzheimer's Prevention",
          description: "Understanding and prevention of Alzheimer's disease",
          progress: 15,
        },
        {
          title: "Biological Freedom",
          description: "Enhanced control over weight, appearance, reproduction, and other biological processes",
          progress: 25,
        },
        {
          title: "Lifespan Extension",
          description: "Doubling of human lifespan to ~150 years",
          progress: 10,
        }
      ]
    },
    // ... rest of the predictions object stays the same
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Rest of the component stays the same */}
    </div>
  );
}