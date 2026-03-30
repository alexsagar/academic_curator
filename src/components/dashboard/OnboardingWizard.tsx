"use client";

import { useEffect, useState } from "react";
import { Joyride, STATUS } from "react-joyride";


const steps = [
  {
    target: ".tour-step-1",
    content: "Welcome to your Academic Curator dashboard! Here you can see an overview of your activity.",
    disableBeacon: true,
  },
  {
    target: ".tour-step-2",
    content: "Click here to start editing a new or existing academic portfolio.",
  },
  {
    target: ".tour-step-3",
    content: "Manage your settings, billing, and connected integrations such as GitHub or LinkedIn.",
  },
] satisfies Array<{ target: string; content: string; disableBeacon?: boolean }>;

export default function OnboardingWizard() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem("onboarding_completed");
    if (!hasCompleted) {
      const timer = window.setTimeout(() => setRun(true), 1000);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const handleJoyrideEvent = ({ status }: { status?: string }) => {
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem("onboarding_completed", "true");
    }
  };

  return (
    <Joyride
      onEvent={handleJoyrideEvent}
      continuous
      run={run}
      scrollToFirstStep
      steps={steps}
      options={{
        primaryColor: "#0ea5e9",
        textColor: "#0f172a",
        backgroundColor: "#ffffff",
      }}
      styles={{
        floater: { zIndex: 10000 },
        tooltip: { borderRadius: 16 },
        tooltipContainer: { color: "#0f172a" },
      }}
    />
  );
}
