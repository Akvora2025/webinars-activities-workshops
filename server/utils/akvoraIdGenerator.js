import Counter from '../models/Counter.js';

/**
 * Generates a unique AKVORA ID in the format: AKVORA:YEAR:NUMBER
 * Uses an atomic counter that increments continuously across years
 */
export async function generateAkvoraId() {
  const currentYear = new Date().getFullYear();
  
  // Atomically increment the counter
  const counter = await Counter.findOneAndUpdate(
    { name: 'akvoraIdCounter' },
    { $inc: { currentCount: 1 } },
    { 
      upsert: true, 
      new: true,
      setDefaultsOnInsert: true
    }
  );

  const paddedNumber = String(counter.currentCount).padStart(3, '0');
  const akvoraId = `AKVORA:${currentYear}:${paddedNumber}`;

  return {
    akvoraId,
    year: currentYear,
    counter: counter.currentCount
  };
}





