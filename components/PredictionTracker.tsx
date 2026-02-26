"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, MessageCircle, ExternalLink } from 'lucide-react';
import predictionsData from '../data/predictions.json';

type Evidence = {
  title: string;
  url: string;
  date: string;
}

type Prediction = {
  title: string;
  description: string;
  progress: number;
  evidence: Evidence[];
}

type Section = {
  title: string;
  description: string;
  predictions: Prediction[];
}

type PredictionsData = {
  lastUpdated: string;
  [key: string]: Section | string;
}

export default function PredictionTracker() {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const data = predictionsData as PredictionsData;
  const { lastUpdated, ...sections } = data;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text leading-relaxed">
          Machines of Loving Grace
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          Tracking the predictions from Dario Amodei&apos;s vision of how AI could transform the world for the better. Based on the timeline of 5-10 years after the development of powerful AI.
        </p>
        <p className="text-sm text-gray-400 mb-10">
          Last updated: {formatDate(lastUpdated as string)}
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <a
            href="https://darioamodei.com/machines-of-loving-grace"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5 mr-2" aria-hidden="true" />
            Read the Essay
          </a>
          <a
            href="https://www.reddit.com/r/MachinesofLovingGrace/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5 mr-2" aria-hidden="true" />
            Discuss &amp; Update
          </a>
        </div>
      </div>

      {/* Predictions Section */}
      <div className="max-w-4xl mx-auto pb-24 px-6">
        {Object.entries(sections).map(([key, section]) => {
          const s = section as Section;
          return (
            <div key={key} className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={() => toggleSection(key)}
                aria-expanded={!!expandedSections[key]}
                className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div className="text-left">
                  <h2 className="text-2xl font-semibold text-gray-800">{s.title}</h2>
                  <p className="text-gray-600 mt-2">{s.description}</p>
                </div>
                {expandedSections[key] ? (
                  <ChevronUp className="text-gray-400" aria-hidden="true" />
                ) : (
                  <ChevronDown className="text-gray-400" aria-hidden="true" />
                )}
              </button>

              {expandedSections[key] && (
                <div className="px-6 pb-6">
                  {s.predictions.map((prediction: Prediction, index: number) => (
                    <div key={index} className="mb-6 last:mb-0">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium text-gray-800">{prediction.title}</h3>
                        <span className="text-gray-600">{prediction.progress}%</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{prediction.description}</p>
                      <div
                        role="progressbar"
                        aria-valuenow={prediction.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${prediction.title}: ${prediction.progress}% progress`}
                        className="h-2 bg-gray-100 rounded-full overflow-hidden"
                      >
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${prediction.progress}%` }}
                        ></div>
                      </div>
                      {prediction.evidence.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {prediction.evidence.map((item: Evidence, i: number) => (
                            <a
                              key={i}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                              <span>{item.title}</span>
                              <span className="text-gray-400">({item.date})</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
