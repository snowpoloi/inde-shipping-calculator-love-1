
export type WeightOffer = {
  id: string;
  type: 'weight';
  carrierId: string;
  minWeight: number;
  maxWeight: number;
  baseCost: number;
  extraCostPerKg?: number;
  extraCostRemote?: number;
  zoneNames: string[]; // Ζώνες όπου ισχύει η προσφορά
};

export type ZoneCubicOffer = {
  id: string;
  type: 'zoneCubic';
  carrierId: string;
  zoneId: string;
  zoneName: string;
  minCharge: number;
  cubicRate: number;
  deliveryTime: string;
  minCubicVolume?: number;
  zoneNames: string[]; // Προσθήκη ζωνών εξυπηρέτησης
};

export type Offer = WeightOffer | ZoneCubicOffer;
