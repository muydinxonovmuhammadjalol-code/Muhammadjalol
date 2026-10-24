import React from 'react';
import { X, CheckCircle, AlertTriangle, Clock, Dumbbell, ShieldAlert, Award } from 'lucide-react';
import { TrainingExercise } from '../types';
import { Language, translations } from '../i18n/translations';

interface TrainingModalProps {
  exercise: TrainingExercise | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  isCompleted: boolean;
  onToggleComplete: (id: string) => void;
}

export const TrainingModal: React.FC<TrainingModalProps> = ({
  exercise,
  isOpen,
  onClose,
  lang,
  isCompleted,
  onToggleComplete,
}) => {
  const t = translations[lang];

  if (!isOpen || !exercise) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0D0F14] border border-[#252A36] rounded-xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E232E] bg-[#12151D]">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-[#D4AF37] font-semibold">
              {exercise.category}
            </span>
            <span className="text-[#505768]">·</span>
            <span className="text-xs text-[#8E95A5]">Level: {exercise.difficulty}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8E95A5] hover:text-white hover:bg-[#1E232E] rounded transition-colors"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-display uppercase tracking-wide text-white">
              {exercise.title}
            </h2>
            <p className="text-sm text-[#A1A7B5] mt-1.5 leading-relaxed">
              {exercise.description}
            </p>
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#13161F] p-4 rounded-xl border border-[#202532] text-xs">
            <div>
              <span className="text-[#8E95A5] block">Duration</span>
              <span className="font-semibold text-white font-mono-numbers mt-0.5 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> {exercise.duration}
              </span>
            </div>
            <div>
              <span className="text-[#8E95A5] block">Equipment</span>
              <span className="font-semibold text-white mt-0.5 block truncate">
                {exercise.equipment}
              </span>
            </div>
            <div>
              <span className="text-[#8E95A5] block">Difficulty</span>
              <span className="font-semibold text-[#D4AF37] mt-0.5 block">
                {exercise.difficulty}
              </span>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Execution Protocol
            </h3>
            <ol className="space-y-2.5">
              {exercise.instructions.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-[#12151D] border border-[#1E232E] rounded-lg text-xs sm:text-sm text-[#C5CAD5]"
                >
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Safety & Medical Warning */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider block text-amber-300">
                Safety & Technique Precaution
              </span>
              <p className="mt-1 leading-relaxed">{exercise.safetyNotes}</p>
            </div>
          </div>

          {/* Target muscle groups */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8E95A5] block mb-2">
              Primary Kinetic Chain Focus
            </span>
            <div className="flex flex-wrap gap-2">
              {exercise.targetMuscles.map((muscle, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-[#1A1F2B] text-[#D4AF37] px-2.5 py-1 rounded border border-[#2B3344]"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Complete toggle */}
        <div className="p-4 bg-[#12151D] border-t border-[#1E232E] flex items-center justify-between">
          <span className="text-xs text-[#8E95A5]">
            Progress is automatically saved to your fan hub.
          </span>
          <button
            onClick={() => onToggleComplete(exercise.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-[#D4AF37] hover:bg-[#E5C158] text-black'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {isCompleted ? t.completed : t.markCompleted}
          </button>
        </div>
      </div>
    </div>
  );
};
