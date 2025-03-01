
export type Carrier = {
  id: string;
  name: string;
  // Περιορισμοί
  maxLength: number;
  maxWidth: number;
  maxHeight: number;
  maxWeight: number;
  maxCubic: number;
  // Τύπος προσφορών
  offersByWeight: boolean;
  offersByCubic: boolean;
  // Περιοχές εξυπηρέτησης
  servicedPostalCodes: string[];
  remotePostalCodes: string[];
  noAntiCashPostalCodes: string[];
  // Ζώνες εξυπηρέτησης
  serviceZones: string[];
};
