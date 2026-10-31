import {
  JournalNote,
  SkinExperiment,
  EnvironmentalData,
  SkinTriggerPattern,
  TriggerEvidenceItem,
  UserProfile,
  RoutineStep,
} from '../types';

export class TriggerDetectiveService {
  /**
   * Convenience overload accepting individual parameters
   */
  public static detectPatterns(
    diaryEntries: any[],
    experiments: SkinExperiment[],
    routineItems: any[],
    userProfile: UserProfile,
    envData?: EnvironmentalData | null
  ): SkinTriggerPattern[] {
    const journalNotes: JournalNote[] = (diaryEntries || []).map((e, idx) => ({
      id: e.id || `jn-${idx}`,
      date: e.date || new Date().toISOString(),
      skinFeeling: e.skinFeeling || (e.skinConditions?.includes('dryness') ? 'Dry & Tight' : 'Balanced & Calm'),
      routineCompletedPct: e.routineCompletedPct ?? (e.isCompleted ? 100 : 0),
      notes: e.notes || (Array.isArray(e.skinConditions) ? e.skinConditions.join(', ') : ''),
      factors: e.skinConditions || [],
      photoUrl: e.photoUrl,
    }));

    return this.analyzeTriggers({
      journalNotes,
      experiments,
      environmentalData: envData,
      profile: userProfile,
      routine: (routineItems || []) as any,
    });
  }

  /**
   * Evaluates all historical user data to discover observational co-occurrences.
   * Strictly adheres to non-causal statistical correlation principles.
   */
  public static analyzeTriggers(context: {
    journalNotes: JournalNote[];
    experiments: SkinExperiment[];
    environmentalData?: EnvironmentalData | null;
    profile: UserProfile;
    routine: RoutineStep[];
  }): SkinTriggerPattern[] {
    const { journalNotes, experiments, environmentalData, profile } = context;
    const patterns: SkinTriggerPattern[] = [];

    // Aggregate all daily observations across journals and experiments
    const allDailyRecords: Array<{
      date: string;
      source: 'journal' | 'experiment';
      dryness: number; // 1-5
      redness: number; // 1-5
      oiliness: number; // 1-5
      irritation: number; // 1-5
      breakouts: number; // 1-5
      comfort: number; // 1-5
      missedRoutine: boolean;
      notes: string;
      refId: string;
    }> = [];

    // Parse journal notes
    for (const jn of journalNotes) {
      if (!jn.date) continue;
      const lowerNotes = (jn.notes || '').toLowerCase();
      const isDry = jn.skinFeeling === 'Dry & Tight' || lowerNotes.includes('dry') || lowerNotes.includes('tight') || lowerNotes.includes('flak');
      const isOily = jn.skinFeeling === 'Oily & Shiny' || lowerNotes.includes('oily') || lowerNotes.includes('greas');
      const isFlushed = jn.skinFeeling === 'Sensitive & Flushed' || lowerNotes.includes('red') || lowerNotes.includes('burn') || lowerNotes.includes('sting');
      const hasBreakouts = lowerNotes.includes('pimple') || lowerNotes.includes('breakout') || lowerNotes.includes('acne') || lowerNotes.includes('congestion');

      allDailyRecords.push({
        date: jn.date.split('T')[0],
        source: 'journal',
        dryness: isDry ? 4 : 1,
        redness: isFlushed ? 4 : 1,
        oiliness: isOily ? 4 : 1,
        irritation: isFlushed ? 3 : 1,
        breakouts: hasBreakouts ? 4 : 1,
        comfort: isDry || isFlushed ? 2 : 4,
        missedRoutine: jn.routineCompletedPct < 50,
        notes: jn.notes,
        refId: jn.id,
      });
    }

    // Parse experiment daily logs
    for (const exp of experiments) {
      const logs = exp.dailyLogs || (exp as any).logs || [];
      for (const log of logs) {
        if (!log.date) continue;
        const obs = log.observations || (log as any).observation || {};
        allDailyRecords.push({
          date: log.date.split('T')[0],
          source: 'experiment',
          dryness: obs.dryness ?? 1,
          redness: obs.redness ?? 1,
          oiliness: obs.oiliness ?? 1,
          irritation: obs.irritation ?? 1,
          breakouts: obs.breakouts ?? 1,
          comfort: obs.comfort ?? 3,
          missedRoutine: Boolean(log.missedRoutine ?? (log as any).missedRoutineDay),
          notes: `${exp.variableName || (exp as any).variableTested ? `[${exp.variableName || (exp as any).variableTested}] ` : ''}${log.notes || ''}`.trim(),
          refId: `${exp.id}-day-${log.dayNumber}`,
        });
      }
    }

    const totalRecords = allDailyRecords.length;

    // PATTERN 1: Low Humidity & Surface Dryness Association
    const dryRecords = allDailyRecords.filter((r) => r.dryness >= 3);
    const humidityVal = environmentalData?.humidityPct ?? 35; // Use ambient humidity if present

    if (dryRecords.length >= 1) {
      const evidence: TriggerEvidenceItem[] = dryRecords.slice(0, 5).map((r) => ({
        date: r.date,
        source: r.source,
        observedSymptom: `Elevated Dryness Level (${r.dryness}/5)`,
        environmentalMetric: `Ambient Relative Humidity: ${humidityVal}% (${humidityVal < 40 ? 'Dry Atmosphere' : 'Moderate Humidity'})`,
        noteSnippet: r.notes || 'User noted skin tightness or dry texture.',
      }));

      const confidence = dryRecords.length >= 4 ? 'High Association' : dryRecords.length >= 2 ? 'Moderate Co-occurrence' : 'Tentative Signal';

      patterns.push({
        id: 'trigger-pat-humidity-dryness',
        title: 'Low Ambient Humidity & Transepidermal Water Loss',
        factorType: 'atmospheric',
        category: 'weather',
        symptomAffected: 'Dryness',
        affectedMetric: 'dryness',
        patternStatement: `Dryness and tightness symptoms appeared in ${dryRecords.length} recorded log${dryRecords.length > 1 ? 's' : ''}, coinciding with periods of lower ambient relative humidity (${humidityVal}%).`,
        description: `Dryness and tightness symptoms appeared in ${dryRecords.length} recorded log${dryRecords.length > 1 ? 's' : ''}, coinciding with periods of lower ambient relative humidity (${humidityVal}%).`,
        confidence,
        sampleSizeRecords: totalRecords,
        observationCount: dryRecords.length,
        coOccurrenceRate: Math.round((dryRecords.length / Math.max(1, totalRecords)) * 100),
        lastDetected: new Date().toISOString(),
        datesObserved: dryRecords.map((r) => r.date),
        evidence,
        confoundingFactors: [
          'Indoor air-conditioning or heating moisture levels not directly measured on-device.',
          'Daily oral water intake and dietary hydration variations.',
          'Cleanser foaming strength and hot water tap temperature during washing.',
        ],
        recommendedAdjustment:
          'Apply humectant hydration serums (Hyaluronic B5, Glycerin) immediately onto damp skin after cleansing and seal promptly with an occlusive ceramide cushion cream.',
        recommendation:
          'Apply humectant hydration serums (Hyaluronic B5, Glycerin) immediately onto damp skin after cleansing and seal promptly with an occlusive ceramide cushion cream.',
        scientificDisclaimer:
          'Statistical observation only. Atmospheric humidity is a known physical factor in transepidermal water loss, but individual barrier lipid variations and indoor heating significantly influence hydration.',
      });
    }

    // PATTERN 2: Routine Disruption & Skin Irritation / Barrier Flare
    const missedRoutineRecords = allDailyRecords.filter((r) => r.missedRoutine && (r.irritation >= 2 || r.dryness >= 3 || r.redness >= 2));
    if (missedRoutineRecords.length >= 1) {
      const evidence: TriggerEvidenceItem[] = missedRoutineRecords.slice(0, 5).map((r) => ({
        date: r.date,
        source: r.source,
        observedSymptom: `Elevated Irritation/Dryness (${Math.max(r.irritation, r.dryness)}/5)`,
        routineState: 'Incomplete or Skipped Daily Skincare Routine',
        noteSnippet: r.notes || 'Routine skipped or incomplete for this date.',
      }));

      const confidence = missedRoutineRecords.length >= 3 ? 'High Association' : 'Moderate Co-occurrence';

      patterns.push({
        id: 'trigger-pat-routine-consistency',
        title: 'Routine Skipping & Barrier Resilience Fluctuation',
        factorType: 'routine_product',
        category: 'routine',
        symptomAffected: 'Sensitized Barrier',
        affectedMetric: 'barrier',
        patternStatement: `Skin sensitivity and dryness spikes co-occurred on ${missedRoutineRecords.length} day${missedRoutineRecords.length > 1 ? 's' : ''} where scheduled morning or evening barrier routines were skipped or partially completed.`,
        description: `Skin sensitivity and dryness spikes co-occurred on ${missedRoutineRecords.length} day${missedRoutineRecords.length > 1 ? 's' : ''} where scheduled morning or evening barrier routines were skipped or partially completed.`,
        confidence,
        sampleSizeRecords: totalRecords,
        observationCount: missedRoutineRecords.length,
        coOccurrenceRate: Math.round((missedRoutineRecords.length / Math.max(1, totalRecords)) * 100),
        lastDetected: new Date().toISOString(),
        datesObserved: missedRoutineRecords.map((r) => r.date),
        evidence,
        confoundingFactors: [
          'Schedule stress or disrupted sleep patterns may have independently driven both skipped routines and skin reactivity.',
          'Sunscreen omission on skipped morning routine days may have increased ambient UV exposure.',
        ],
        recommendedAdjustment:
          'When short on time, prioritize a 2-step minimalist reset: gentle wash followed by daily SPF (AM) or ceramide barrier cream (PM).',
        recommendation:
          'When short on time, prioritize a 2-step minimalist reset: gentle wash followed by daily SPF (AM) or ceramide barrier cream (PM).',
        scientificDisclaimer:
          'Observed association. Consistency helps maintain skin acid mantle stability, but missed routine days frequently correlate with travel, fatigue, and environmental shifts.',
      });
    }

    // PATTERN 3: High UV Index & Redness / Flushed Reactivity
    const flushedRecords = allDailyRecords.filter((r) => r.redness >= 3 || r.irritation >= 3);
    const uvVal = environmentalData?.uvIndex ?? 6.5;

    if (flushedRecords.length >= 1) {
      const evidence: TriggerEvidenceItem[] = flushedRecords.slice(0, 5).map((r) => ({
        date: r.date,
        source: r.source,
        observedSymptom: `Flushed / Redness Level (${r.redness}/5)`,
        environmentalMetric: `UV Radiation Index: ${uvVal} (${uvVal >= 6 ? 'High Ambient Solar Radiation' : 'Moderate UV'})`,
        noteSnippet: r.notes || 'Skin noted as warm, flushed, or sensitive.',
      }));

      patterns.push({
        id: 'trigger-pat-uv-redness',
        title: 'UV Radiation & Cutaneous Micro-Vascular Flushing',
        factorType: 'atmospheric',
        category: 'weather',
        symptomAffected: 'Redness & Irritation',
        affectedMetric: 'redness',
        patternStatement: `Redness and flushed sensitivity were logged in ${flushedRecords.length} observation${flushedRecords.length > 1 ? 's' : ''}, coinciding with elevated daytime solar exposure periods.`,
        description: `Redness and flushed sensitivity were logged in ${flushedRecords.length} observation${flushedRecords.length > 1 ? 's' : ''}, coinciding with elevated daytime solar exposure periods.`,
        confidence: flushedRecords.length >= 3 ? 'High Association' : 'Moderate Co-occurrence',
        sampleSizeRecords: totalRecords,
        observationCount: flushedRecords.length,
        coOccurrenceRate: Math.round((flushedRecords.length / Math.max(1, totalRecords)) * 100),
        lastDetected: new Date().toISOString(),
        datesObserved: flushedRecords.map((r) => r.date),
        evidence,
        confoundingFactors: [
          'Spicy diet, hot beverages, or vigorous cardiovascular workouts.',
          'Fragrance or volatile botanical oils in newly applied cosmetics.',
          'Physical friction from towel drying or harsh exfoliating pads.',
        ],
        recommendedAdjustment:
          'Reinforce daily broad-spectrum SPF 50+ reapplication every 2 to 3 hours when outdoors, and incorporate calming Centella Asiatica or Panthenol.',
        recommendation:
          'Reinforce daily broad-spectrum SPF 50+ reapplication every 2 to 3 hours when outdoors, and incorporate calming Centella Asiatica or Panthenol.',
        scientificDisclaimer:
          'Co-occurrence analysis. UV radiation generates dermal reactive oxygen species and vasodilation, but internal emotional and dietary factors also induce cutaneous flushing.',
      });
    }

    // PATTERN 4: Active Experiment Variable Progression
    for (const exp of experiments) {
      const logs = (exp as any).logs || (exp as any).dailyLogs || [];
      if (logs.length >= 3) {
        const initialComfort = (exp as any).baselineObservation?.comfort ?? (exp as any).baselineObservations?.comfort ?? 3;
        const recentLogs = logs.slice(-3);
        const avgRecentComfort = recentLogs.reduce((acc: number, curr: any) => acc + (curr.observation?.comfort ?? curr.observations?.comfort ?? 3), 0) / recentLogs.length;
        const avgRecentIrritation = recentLogs.reduce((acc: number, curr: any) => acc + (curr.observation?.irritation ?? curr.observations?.irritation ?? 1), 0) / recentLogs.length;

        const isImproving = avgRecentComfort > initialComfort && avgRecentIrritation <= 2;
        const isReacting = avgRecentIrritation >= 3;

        if (isImproving || isReacting) {
          const varName = (exp as any).targetName || (exp as any).variableName || (exp as any).variableTested || 'Skincare Variable';
          const duration = (exp as any).durationDays || (exp as any).targetDurationDays || 14;
          const evidence: TriggerEvidenceItem[] = recentLogs.map((l: any) => ({
            date: l.date,
            source: 'experiment',
            observedSymptom: `Comfort ${l.observation?.comfort ?? l.observations?.comfort ?? 3}/5 · Irritation ${l.observation?.irritation ?? l.observations?.irritation ?? 1}/5`,
            routineState: `Testing Variable: ${varName} (Day ${l.dayNumber}/${duration})`,
            noteSnippet: l.notes || `Log for day ${l.dayNumber}`,
          }));

          patterns.push({
            id: `trigger-pat-exp-${exp.id}`,
            title: isImproving
              ? `Positive Tolerance Trajectory: ${varName}`
              : `Sensitivity Alert Observed: ${varName}`,
            factorType: 'routine_product',
            category: 'product',
            symptomAffected: isImproving ? 'Sensitized Barrier' : 'Redness & Irritation',
            affectedMetric: isImproving ? 'comfort' : 'irritation',
            patternStatement: isImproving
              ? `Comfort scores increased from ${initialComfort}/5 baseline to an average of ${avgRecentComfort.toFixed(1)}/5 across recent logs during the systematic evaluation of ${varName}.`
              : `Irritation scores averaged ${avgRecentIrritation.toFixed(1)}/5 during the ongoing trial of ${varName}. Monitor closely for potential contact sensitivity.`,
            description: isImproving
              ? `Comfort scores increased from ${initialComfort}/5 baseline to an average of ${avgRecentComfort.toFixed(1)}/5 across recent logs during the systematic evaluation of ${varName}.`
              : `Irritation scores averaged ${avgRecentIrritation.toFixed(1)}/5 during the ongoing trial of ${varName}. Monitor closely for potential contact sensitivity.`,
            confidence: logs.length >= 7 ? 'High Association' : 'Moderate Co-occurrence',
            sampleSizeRecords: logs.length,
            observationCount: logs.length,
            coOccurrenceRate: Math.round((recentLogs.length / Math.max(1, logs.length)) * 100),
            lastDetected: new Date().toISOString(),
            datesObserved: recentLogs.map((l: any) => l.date),
            evidence,
            confoundingFactors: [
              'Concurrently applied cleansers, moisturizers, and makeup products.',
              'Natural skin epidermal turnover cycle length (28 days on average).',
            ],
            recommendedAdjustment: isImproving
              ? 'Maintain current single-variable routine discipline until the full experiment period concludes.'
              : 'Consider pausing this product for 3 to 5 days to observe if skin sensitivity subsides.',
            recommendation: isImproving
              ? 'Maintain current single-variable routine discipline until the full experiment period concludes.'
              : 'Consider pausing this product for 3 to 5 days to observe if skin sensitivity subsides.',
            scientificDisclaimer:
              'Observational experiment log. Skin barrier changes are multi-factorial and individual response curves depend on skin barrier permeability and concurrent formulas.',
          });
        }
      }
    }

    // PATTERN 5: Sleep & Lifestyle Log Mentions
    const sleepMentions = allDailyRecords.filter((r) => {
      const txt = r.notes.toLowerCase();
      return txt.includes('sleep') || txt.includes('tired') || txt.includes('late night') || txt.includes('insomnia');
    });

    if (sleepMentions.length >= 1) {
      const evidence: TriggerEvidenceItem[] = sleepMentions.map((r) => ({
        date: r.date,
        source: r.source,
        observedSymptom: `Skin Feeling Rating: ${r.comfort}/5 comfort · Dryness: ${r.dryness}/5`,
        routineState: 'Sleep & Rest Note Recorded in Journal',
        noteSnippet: r.notes,
      }));

      patterns.push({
        id: 'trigger-pat-lifestyle-sleep',
        title: 'Sleep Duration & Cutaneous Recovery Signals',
        factorType: 'lifestyle_sleep',
        category: 'sleep',
        symptomAffected: 'Dryness',
        affectedMetric: 'comfort',
        patternStatement: `User diary entries recorded rest or sleep disruption on ${sleepMentions.length} date${sleepMentions.length > 1 ? 's' : ''}, co-occurring with lower subjective comfort or increased dullness.`,
        description: `User diary entries recorded rest or sleep disruption on ${sleepMentions.length} date${sleepMentions.length > 1 ? 's' : ''}, co-occurring with lower subjective comfort or increased dullness.`,
        confidence: sleepMentions.length >= 3 ? 'Moderate Co-occurrence' : 'Tentative Signal',
        sampleSizeRecords: totalRecords,
        observationCount: sleepMentions.length,
        coOccurrenceRate: Math.round((sleepMentions.length / Math.max(1, totalRecords)) * 100),
        lastDetected: new Date().toISOString(),
        datesObserved: sleepMentions.map((r) => r.date),
        evidence,
        confoundingFactors: [
          'Sleep data is based strictly on self-reported diary notes rather than polysomnography or biometric sensor tracking.',
          'Late nights often involve artificial indoor lighting and irregular meal times.',
        ],
        recommendedAdjustment:
          'On days following disrupted rest, apply a nourishing antioxidant serum and rich ceramide lipid cream to protect against morning transepidermal water loss.',
        recommendation:
          'On days following disrupted rest, apply a nourishing antioxidant serum and rich ceramide lipid cream to protect against morning transepidermal water loss.',
        scientificDisclaimer:
          'Correlational insight based strictly on user-provided notes. Sleep is essential for nocturnal cellular regeneration, but exact biological causality cannot be inferred from self-logs alone.',
      });
    }

    return patterns;
  }
}
