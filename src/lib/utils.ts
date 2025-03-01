
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Βοηθητική συνάρτηση για να φιλτράρει μοναδικές ζώνες (αν χρειαστεί)
export function getUniqueZones(zones: string[]): string[] {
  return [...new Set(zones)];
}

// Κατηγοριοποίηση ζωνών (για χρήση αν χρειαστεί)
export const zoneCategories: Record<string, "ΑΘΗΝΑ" | "ΧΕΡΣΑΙΟΙ" | "ΝΗΣΙΩΤΙΚΟΙ"> = {
  "ΑΘΗΝΑ": "ΑΘΗΝΑ",
  "ΑΘΗΝΑ 2": "ΑΘΗΝΑ",
  "ΘΕΣΣΑΛΟΝΙΚΗ": "ΧΕΡΣΑΙΟΙ",
  "ΚΕΝΤΡΙΚΗ ΕΛΛΑΔΑ": "ΧΕΡΣΑΙΟΙ",
  "ΒΟΡΕΙΑ ΕΛΛΑΔΑ": "ΧΕΡΣΑΙΟΙ",
  "ΝΗΣΙΑ": "ΝΗΣΙΩΤΙΚΟΙ",
  "ΝΗΣΙΑ 2": "ΝΗΣΙΩΤΙΚΟΙ",
  "ΧΕΡΣΑΙΟΙ ΠΡΟΟΡΙΣΜΟΙ": "ΧΕΡΣΑΙΟΙ",
  "ΝΗΣΙΩΤΙΚΟΙ ΠΡΟΟΡΙΣΜΟΙ": "ΝΗΣΙΩΤΙΚΟΙ"
};
