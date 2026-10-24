export type WeightDivision =
  | 'Pound-for-Pound'
  | 'Heavyweight'
  | 'Cruiserweight'
  | 'Light Heavyweight'
  | 'Super Middleweight'
  | 'Middleweight'
  | 'Super Welterweight'
  | 'Welterweight'
  | 'Super Lightweight'
  | 'Lightweight'
  | 'Super Featherweight'
  | 'Featherweight';

export type Stance = 'Orthodox' | 'Southpaw';

export type FighterStatus = 'Active' | 'Champion' | 'Contender' | 'Retired';

export interface FightHistoryItem {
  id: string;
  date: string;
  opponent: string;
  result: 'W' | 'L' | 'D';
  method: 'KO' | 'TKO' | 'UD' | 'SD' | 'MD';
  round: number;
  eventTitle: string;
  notes?: string;
}

export interface Fighter {
  id: string;
  slug: string;
  name: string;
  nickname?: string;
  nationality: string;
  countryCode: string;
  division: WeightDivision;
  stance: Stance;
  height: string; // e.g. "6' 3\" (191 cm)"
  reach: string; // e.g. "78\" (198 cm)"
  birthDate: string;
  age: number;
  wins: number;
  losses: number;
  draws: number;
  knockouts: number;
  ranking: number;
  status: FighterStatus;
  titles: string[];
  biography: string;
  portraitUrl: string;
  recentFights: FightHistoryItem[];
  physicalStats: {
    power: number; // 1-100
    speed: number;
    defense: number;
    stamina: number;
    ringIq: number;
    chin: number;
  };
  isDemoData: boolean;
}

export interface UndercardBout {
  id: string;
  fighter1Id: string;
  fighter2Id: string;
  division: WeightDivision;
  scheduledRounds: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  result?: string;
  winnerId?: string;
}

export interface BoxingEvent {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  date: string; // ISO 8601 string or YYYY-MM-DDTHH:mm:ss
  venue: string;
  city: string;
  country: string;
  status: 'upcoming' | 'live' | 'completed';
  weightDivision: WeightDivision;
  mainEvent: {
    fighter1Id: string;
    fighter2Id: string;
    isTitleFight: boolean;
    beltName?: string;
    scheduledRounds: number;
    result?: string;
    winnerId?: string;
  };
  undercard: UndercardBout[];
  posterUrl: string;
  broadcastChannel: string;
  ticketStatus: 'Available' | 'Selling Fast' | 'Sold Out' | 'Concluded';
  officialSource: string;
  description: string;
  isDemoData: boolean;
}

export interface RankingEntry {
  id: string;
  division: WeightDivision;
  fighterId: string;
  position: number;
  previousPosition: number;
  rankingDate: string;
  movement: 'up' | 'down' | 'same' | 'new';
  points?: number;
  source: string;
  isDemoData: boolean;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  body: string;
  author: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  category:
    | 'Breaking'
    | 'Championship'
    | 'Interviews'
    | 'Previews'
    | 'Results'
    | 'Training'
    | 'History';
  publishedAt: string;
  readingTimeMinutes: number;
  imageUrl: string;
  tags: string[];
  publicationStatus: 'published' | 'draft';
  isDemoData: boolean;
}

export type TrainingCategory =
  | 'Warm-up'
  | 'Footwork'
  | 'Balance'
  | 'Coordination'
  | 'Fitness'
  | 'Mobility'
  | 'Recovery'
  | 'Rest & Sleep';

export interface TrainingExercise {
  id: string;
  title: string;
  category: TrainingCategory;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  repetitions?: string;
  description: string;
  instructions: string[];
  safetyNotes: string;
  equipment: string;
  demonstrationUrl?: string;
  targetMuscles: string[];
}

export interface UserPreferences {
  language: 'en' | 'uz';
  favoriteFighterIds: string[];
  favoriteEventIds: string[];
  savedArticleIds: string[];
  completedTrainingIds: string[];
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESET';
  entity: 'FIGHTER' | 'EVENT' | 'RANKING' | 'ARTICLE' | 'TRAINING';
  details: string;
}
