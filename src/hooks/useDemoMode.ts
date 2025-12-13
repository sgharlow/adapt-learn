'use client';

import { useEffect, useState } from 'react';
import { initDemoMode, checkDemoMode, type DemoScenario } from '@/lib/demoData';

/**
 * Hook to initialize and track demo mode
 * Usage: Add ?demo=fresh|progress|gaps|complete to URL
 */
export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [scenario, setScenario] = useState<DemoScenario | null>(null);

  useEffect(() => {
    const demoScenario = checkDemoMode();
    if (demoScenario) {
      initDemoMode();
      setIsDemoMode(true);
      setScenario(demoScenario);
    }
  }, []);

  return { isDemoMode, scenario };
}
