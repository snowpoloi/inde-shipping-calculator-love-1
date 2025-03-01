
export type CalculationResult = {
  carrierId: string;
  carrierName: string;
  cost: number;
  costWithVAT: number;
  suggestedPrice: number;
  actualWeight: number;
  volumetricWeight: number;
  allowsCashOnDelivery: boolean;
  isOptimal: boolean;
  offerType?: 'weight' | 'cubic' | 'zoneCubic';
  isRemote?: boolean;
  offerId?: string;
  zoneName?: string;
  deliveryTime?: string;
  volume?: number;
  chargedVolume?: number; // Τιμολογηθέν όγκος (μπορεί να διαφέρει από το πραγματικό λόγω ελάχιστου όγκου)
  packages?: number; // Αριθμός δεμάτων
  totalCost?: number; // Συνολικό κόστος (κόστος × αριθμός δεμάτων)
  totalCostWithVAT?: number; // Συνολικό κόστος με ΦΠΑ
};
