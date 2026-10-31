import { RoutineStep, ShelfProduct, SkinAnalysisRecord, JournalNote } from '../types';

export interface AchievementBadge {
  id: string;
  title: string;
  category: 'routine' | 'sunscreen' | 'inventory' | 'journal' | 'knowledge';
  description: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progressText: string;
  iconName: 'Sparkles' | 'Shield' | 'Calendar' | 'Sun' | 'Archive' | 'Search' | 'Camera' | 'PiggyBank';
}

export interface ConsistencySummary {
  currentStreakDays: number;
  longestStreakDays: number;
  weeklyCompletionRatePct: number;
  daysActiveThisWeek: number;
  dailyHistory: { date: string; dayName: string; completedPct: number }[];
}

export interface ReminderConfig {
  morningEnabled: boolean;
  morningTime: string; // e.g. "07:30"
  eveningEnabled: boolean;
  eveningTime: string; // e.g. "21:30"
  reapplicationTimerMinutes: number; // e.g. 120
  reapplicationActive: boolean;
  reapplicationStartTime?: number;
}

const STORAGE_KEYS = {
  BADGES: 'skinloop_achievement_badges',
  REMINDERS: 'skinloop_reminder_config',
  STREAK_META: 'skinloop_streak_meta',
};

export class GamificationService {
  public static calculateStreak(
    routine: RoutineStep[],
    journalNotes: JournalNote[]
  ): ConsistencySummary {
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyHistory: { date: string; dayName: string; completedPct: number }[] = [];

    // Check last 7 days
    let totalPct = 0;
    let daysActive = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];

      let pct = 0;
      if (i === 0) {
        // Today's routine
        const done = routine.filter((s) => s.completedToday).length;
        pct = routine.length > 0 ? Math.round((done / routine.length) * 100) : 0;
      } else {
        // Check journal for historical day
        const entry = journalNotes.find((n) => n.date === dateStr);
        if (entry) {
          pct = entry.routineCompletedPct;
        } else {
          // If no note, check if user logged anything
          pct = 0;
        }
      }

      if (pct > 0) daysActive++;
      totalPct += pct;
      dailyHistory.push({ date: dateStr, dayName, completedPct: pct });
    }

    const weeklyRate = Math.round(totalPct / 7);

    // Collect all unique completed dates from journal notes (routine completed >= 50%)
    const completedDates = new Set<string>();
    for (const note of journalNotes) {
      if (note.date && note.routineCompletedPct >= 50) {
        completedDates.add(note.date.split('T')[0]);
      }
    }

    const todayStr = today.toISOString().split('T')[0];
    const todayDone = routine.filter((s) => s.completedToday).length;
    const isTodayCompleted = routine.length > 0 ? (todayDone / routine.length) >= 0.5 : todayDone > 0;
    if (isTodayCompleted) {
      completedDates.add(todayStr);
    }

    // Calculate current unbroken streak
    let currentStreak = 0;
    if (isTodayCompleted) {
      currentStreak = 1;
      let dayOffset = 1;
      while (dayOffset <= 365) {
        const d = new Date(today);
        d.setDate(today.getDate() - dayOffset);
        const checkStr = d.toISOString().split('T')[0];
        if (completedDates.has(checkStr)) {
          currentStreak++;
          dayOffset++;
        } else {
          break;
        }
      }
    } else {
      // If today is not done yet, check if yesterday was completed
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (completedDates.has(yesterdayStr)) {
        currentStreak = 1;
        let dayOffset = 2;
        while (dayOffset <= 365) {
          const d = new Date(today);
          d.setDate(today.getDate() - dayOffset);
          const checkStr = d.toISOString().split('T')[0];
          if (completedDates.has(checkStr)) {
            currentStreak++;
            dayOffset++;
          } else {
            break;
          }
        }
      } else {
        currentStreak = 0;
      }
    }

    // Calculate longest consecutive streak from actual dated completion history
    const sortedDates = Array.from(completedDates).sort();
    let maxHistoricalStreak = 0;
    let runningStreak = 0;
    let prevDateTime: number | null = null;

    for (const dateStr of sortedDates) {
      const currentDateTime = new Date(`${dateStr}T00:00:00Z`).getTime();
      if (prevDateTime === null) {
        runningStreak = 1;
      } else {
        const diffDays = Math.round((currentDateTime - prevDateTime) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          runningStreak++;
        } else if (diffDays > 1) {
          runningStreak = 1;
        }
      }
      if (runningStreak > maxHistoricalStreak) {
        maxHistoricalStreak = runningStreak;
      }
      prevDateTime = currentDateTime;
    }

    const longestStreakDays = Math.max(maxHistoricalStreak, currentStreak);

    return {
      currentStreakDays: currentStreak,
      longestStreakDays,
      weeklyCompletionRatePct: weeklyRate,
      daysActiveThisWeek: daysActive,
      dailyHistory,
    };
  }

  public static evaluateBadges(context: {
    routine: RoutineStep[];
    shelf: ShelfProduct[];
    history: SkinAnalysisRecord[];
    journalNotes: JournalNote[];
    hasUsedIngredientChecker?: boolean;
    streakDays: number;
  }): AchievementBadge[] {
    const { routine, shelf, history, streakDays, hasUsedIngredientChecker } = context;

    const completedAnyToday = routine.some((s) => s.completedToday);
    const morningSpfDone = routine.some(
      (s) => s.routineType === 'morning' && s.completedToday && s.stepName.toLowerCase().includes('spf')
    );

    return [
      {
        id: 'badge-first-step',
        title: 'First Step Taken',
        category: 'routine',
        description: 'Complete your first morning or evening routine step.',
        isUnlocked: completedAnyToday || streakDays > 0,
        unlockedAt: completedAnyToday ? 'Active Today' : undefined,
        progressText: completedAnyToday ? 'Completed' : '0/1 steps',
        iconName: 'Sparkles',
      },
      {
        id: 'badge-barrier-hero',
        title: 'Barrier Protector',
        category: 'routine',
        description: 'Maintain a 3-day consecutive routine completion streak.',
        isUnlocked: streakDays >= 3,
        progressText: `${Math.min(streakDays, 3)}/3 days`,
        iconName: 'Calendar',
      },
      {
        id: 'badge-7day-consistency',
        title: '7-Day Regimen Master',
        category: 'routine',
        description: 'Achieve an unbroken 7-day skincare discipline streak.',
        isUnlocked: streakDays >= 7,
        progressText: `${Math.min(streakDays, 7)}/7 days`,
        iconName: 'Shield',
      },
      {
        id: 'badge-sun-shield',
        title: 'Sun Shield Advocate',
        category: 'sunscreen',
        description: 'Log broad-spectrum SPF 50+ application in your morning routine.',
        isUnlocked: morningSpfDone || routine.some((s) => s.completedToday && s.stepName.includes('SPF')),
        progressText: morningSpfDone ? 'Completed' : 'Check off morning SPF',
        iconName: 'Sun',
      },
      {
        id: 'badge-shelf-master',
        title: 'Conscious Shopper',
        category: 'inventory',
        description: 'Log 3 or more owned beauty products on My Shelf to prevent duplicates.',
        isUnlocked: shelf.length >= 3,
        progressText: `${Math.min(shelf.length, 3)}/3 products logged`,
        iconName: 'Archive',
      },
      {
        id: 'badge-ingredient-sleuth',
        title: 'Ingredient Sleuth',
        category: 'knowledge',
        description: 'Analyze cosmetic ingredients with the Conflict & Safety Checker.',
        isUnlocked: Boolean(hasUsedIngredientChecker),
        progressText: hasUsedIngredientChecker ? 'Unlocked' : 'Analyze 1 ingredient list',
        iconName: 'Search',
      },
      {
        id: 'badge-progress-tracker',
        title: 'Progress Documentarian',
        category: 'journal',
        description: 'Save 2 or more skin analysis scans to track barrier health over time.',
        isUnlocked: history.length >= 2,
        progressText: `${Math.min(history.length, 2)}/2 scans saved`,
        iconName: 'Camera',
      },
      {
        id: 'badge-budget-mindful',
        title: 'Mindful Beauty Spender',
        category: 'inventory',
        description: 'Utilize products already in My Shelf rather than rebuying duplicates.',
        isUnlocked: shelf.length > 0,
        progressText: `${shelf.length} shelf items utilized`,
        iconName: 'PiggyBank',
      },
    ];
  }

  public static getReminderConfig(): ReminderConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return {
      morningEnabled: true,
      morningTime: '07:30',
      eveningEnabled: true,
      eveningTime: '21:30',
      reapplicationTimerMinutes: 120,
      reapplicationActive: false,
    };
  }

  public static saveReminderConfig(config: ReminderConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving reminders', e);
    }
  }
}
