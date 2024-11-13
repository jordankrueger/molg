"use client";

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
    neuroscience: {
      title: "Neuroscience and Mental Health",
      description: "Accelerated progress in understanding and treating mental health conditions",
      predictions: [
        {
          title: "Mental Illness Treatment",
          description: "Effective treatments for most mental illnesses including PTSD, depression, schizophrenia",
          progress: 20,
        },
        {
          title: "Structural Conditions",
          description: "Solutions for 'structural' conditions like psychopathy and some forms of autism",
          progress: 10,
        },
        {
          title: "Genetic Prevention",
          description: "Genetic screening to prevent mental illness while preserving positive traits",
          progress: 15,
        },
        {
          title: "Everyday Enhancement",
          description: "Solutions for common issues like focus, mood, and anxiety management",
          progress: 30,
        }
      ]
    },
    economics: {
      title: "Economic Development and Poverty",
      description: "Rapid economic growth and reduction in global inequality",
      predictions: [
        {
          title: "Health Distribution",
          description: "50% of AI-driven health benefits reaching poorest countries",
          progress: 10,
        },
        {
          title: "Economic Growth",
          description: "20% annual GDP growth in developing world",
          progress: 5,
        },
        {
          title: "Food Security",
          description: "Second Green Revolution through AI-driven agricultural advances",
          progress: 15,
        },
        {
          title: "Climate Change",
          description: "Major advances in carbon removal and clean energy technology",
          progress: 20,
        }
      ]
    },
    governance: {
      title: "Peace and Governance",
      description: "AI's impact on democracy, peace, and governance",
      predictions: [
        {
          title: "Democratic Advantage",
          description: "Democratic coalition gaining clear advantage in AI capabilities",
          progress: 25,
        },
        {
          title: "Information Environment",
          description: "Creation of globally free information environment",
          progress: 15,
        },
        {
          title: "Legal Systems",
          description: "AI improving impartiality and fairness in legal systems",
          progress: 10,
        },
        {
          title: "Government Services",
          description: "Enhanced provision and accessibility of government services",
          progress: 20,
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text leading-relaxed">
          Machines of Loving Grace
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Tracking the predictions from Dario Amodei's vision of how AI could transform the world for the better. Based on the timeline of 5-10 years after the development of powerful AI.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <a 
            href="https://darioamodei.com/machines-of-loving-grace" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5 mr-2" />
            Read the Essay
          </a>
          <a 
            href="https://www.reddit.com/r/MachinesofLovingGrace/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Discuss & Update
          </a>
        </div>
      </div>

      {/* Predictions Section */}
      <div className="max-w-4xl mx-auto pb-24 px-6">
        {Object.entries(predictions).map(([key, section]) => (
          <div key={key} className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={() => toggleSection(key)}
              className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <h2 className="text-2xl font-semibold text-gray-800">{section.title}</h2>
                <p className="text-gray-600 mt-2">{section.description}</p>
              </div>
              {expandedSections[key] ? (
                <ChevronUp className="text-gray-400" />
              ) : (
                <ChevronDown className="text-gray-400" />
              )}
            </button>

            {expandedSections[key] && (
              <div className="px-6 pb-6">
                {section.predictions.map((prediction, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium text-gray-800">{prediction.title}</h3>
                      <span className="text-gray-600">{prediction.progress}%</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{prediction.description}</p>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${prediction.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}