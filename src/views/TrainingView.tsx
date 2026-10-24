import React, { useState } from 'react';
import {
  Dumbbell,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { TrainingExercise, TrainingCategory } from '../types';
import { Language, translations } from '../i18n/translations';

interface TrainingViewProps {
  training: TrainingExercise[];
  lang: Language;
  onOpenTraining: (id: string) => void;
  completedTrainingIds: string[];
  onToggleCompleteTraining: (id: string) => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({
  training,
  lang,
  onOpenTraining,
  completedTrainingIds,
  onToggleCompleteTraining,
}) => {
  const t = translations[lang];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const categories = [
    'all',
    'Warm-up',
    'Footwork',
    'Balance',
    'Coordination',
    'Fitness',
    'Rest & Sleep',
  ];

  const filteredTraining = training.filter((tr) => {
    if (selectedCategory !== 'all' && tr.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && tr.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const completionPercent =
    training.length > 0 ? Math.round((completedTrainingIds.length / training.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#1A1D27] pb-6">
        <span className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-semibold">
          Athletic Conditioning & Biomechanics
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-display tracking-wide text-white mt-1">
          {t.trainingTitle}
        </h1>
        <p className="text-sm text-[#8E95A5] mt-1">{t.trainingSub}</p>
      </div>

      {/* Progress & Safety Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Tracker Card */}
        <div className="bg-[#0E1117] border border-[#1E232E] p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-[#8E95A5] block">
              Curriculum Completion
            </span>
            <span className="text-xs font-mono font-bold text-[#D4AF37]">
              {completedTrainingIds.length} / {training.length} Completed
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-mono-numbers text-white">
                {completionPercent}%
              </span>
              <span className="text-xs text-[#8E95A5]">Tracked locally</span>
            </div>
            <div className="w-full bg-[#181C26] rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#D4AF37] h-full rounded-full transition-all duration-700"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Medical & Coach Guidance Notice */}
        <div className="lg:col-span-2 bg-[#12141C] border border-[#232938] p-6 rounded-xl flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-[#D4AF37] shrink-0 mt-1" />
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold uppercase font-display tracking-wide text-white">
              Essential Safety & Coaching Oversight Notice
            </h3>
            <p className="text-xs text-[#A1A7B5] leading-relaxed">
              {t.safetyDisclaimer} These modules focus exclusively on solo conditioning, footwork coordination, and physical health. Never engage in sparring without certified headgear, custom mouthguards, and a qualified USA/National Boxing certified trainer.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Category selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider font-display rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'bg-[#141720] text-[#A1A7B5] hover:text-white border border-[#242936]'
              }`}
            >
              {cat === 'all' ? 'All Drills' : cat}
            </button>
          ))}
        </div>

        {/* Difficulty select */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8E95A5] uppercase font-mono">Level:</span>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-[#141720] border border-[#252A38] text-white text-xs rounded-lg px-3 py-1.5 focus:border-[#D4AF37] focus:outline-none"
          >
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Training Drills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTraining.map((exercise) => {
          const isDone = completedTrainingIds.includes(exercise.id);
          return (
            <div
              key={exercise.id}
              onClick={() => onOpenTraining(exercise.id)}
              className="group bg-[#0E1117] border border-[#1E232E] hover:border-[#2D3344] rounded-xl p-5 flex flex-col justify-between cursor-pointer transition-all shadow-md space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-[#D4AF37] font-semibold">
                    {exercise.category}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      exercise.difficulty === 'Beginner'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : exercise.difficulty === 'Intermediate'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {exercise.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold font-display uppercase tracking-wide text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                  {exercise.title}
                </h3>

                <p className="text-xs text-[#8E95A5] leading-relaxed line-clamp-3">
                  {exercise.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1C202B] space-y-3">
                <div className="flex items-center justify-between text-xs text-[#8E95A5]">
                  <span className="flex items-center gap-1 font-mono-numbers">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {exercise.duration}
                  </span>
                  <span className="truncate max-w-[130px]">{exercise.equipment}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCompleteTraining(exercise.id);
                    }}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#161922] text-[#A1A7B5] hover:text-white border border-[#252A38]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isDone ? t.completed : t.markCompleted}</span>
                  </button>

                  <span className="text-xs font-bold text-[#D4AF37] font-display uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                    View Protocol →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
