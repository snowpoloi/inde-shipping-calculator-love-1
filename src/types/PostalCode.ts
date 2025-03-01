
export type PostalCode = {
  id: string;
  code: string;
  county: string;
  city: string;
  area: string;
  zone: string; // Η ζώνη στην οποία ανήκει (π.χ. "ΑΘΗΝΑ", "ΘΕΣΣΑΛΟΝΙΚΗ", κλπ.)
  zoneCategory?: string; // Optional zone category
  isRemote?: boolean; // Αν είναι δυσπρόσιτη περιοχή
};
