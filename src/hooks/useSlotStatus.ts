// src/hooks/useSlotStatus.ts
// Determines current slot and whether ordering is open

export type Slot = "morning" | "evening";

export interface SlotInfo {
  slot: Slot;
  isOpen: boolean;
  label: string;
  dispatchTime: string;
  cutoffTime: string;
  nextSlot: Slot;
  nextSlotLabel: string;
}

export function getSlotStatus(): SlotInfo {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMins = h * 60 + m;

  // Morning: 6:00 AM (360) – 10:30 AM (630), dispatch 11:00 AM
  // Cutoff: 10:30 AM = 630 mins
  // Evening: 12:00 PM (720) – 4:30 PM (990), dispatch 5:00 PM
  // Cutoff: 4:30 PM = 990 mins

  const morningOpen  = 360;   // 6:00 AM
  const morningCutoff = 630;  // 10:30 AM
  const eveningOpen  = 720;   // 12:00 PM
  const eveningCutoff = 990;  // 4:30 PM

  if (totalMins >= morningOpen && totalMins < morningCutoff) {
    return {
      slot: "morning",
      isOpen: true,
      label: "☀️ Morning Slot",
      dispatchTime: "11:00 AM",
      cutoffTime: "10:30 AM",
      nextSlot: "evening",
      nextSlotLabel: "🌙 Evening Slot opens at 12:00 PM",
    };
  }

  if (totalMins >= eveningOpen && totalMins < eveningCutoff) {
    return {
      slot: "evening",
      isOpen: true,
      label: "🌙 Evening Slot",
      dispatchTime: "5:00 PM",
      cutoffTime: "4:30 PM",
      nextSlot: "morning",
      nextSlotLabel: "☀️ Morning Slot opens at 6:00 AM tomorrow",
    };
  }

  // Determine which slot is "next"
  if (totalMins < morningOpen) {
    return {
      slot: "morning",
      isOpen: false,
      label: "☀️ Morning Slot",
      dispatchTime: "11:00 AM",
      cutoffTime: "10:30 AM",
      nextSlot: "morning",
      nextSlotLabel: `☀️ Morning Slot opens at 6:00 AM`,
    };
  }

  if (totalMins >= morningCutoff && totalMins < eveningOpen) {
    return {
      slot: "evening",
      isOpen: false,
      label: "🌙 Evening Slot",
      dispatchTime: "5:00 PM",
      cutoffTime: "4:30 PM",
      nextSlot: "evening",
      nextSlotLabel: "🌙 Evening Slot opens at 12:00 PM",
    };
  }

  // After 4:30 PM — all slots closed for today
  return {
    slot: "morning",
    isOpen: false,
    label: "☀️ Morning Slot",
    dispatchTime: "11:00 AM",
    cutoffTime: "10:30 AM",
    nextSlot: "morning",
    nextSlotLabel: "☀️ Morning Slot opens tomorrow at 6:00 AM",
  };
}

export function useSlotStatus(): SlotInfo {
  return getSlotStatus();
}