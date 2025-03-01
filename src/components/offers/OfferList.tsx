import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Carrier } from "@/types/Carrier";
import { Offer, WeightOffer, ZoneCubicOffer } from "@/types/Offer";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/context/AppContext";

interface OfferListProps {
  offers: Offer[];
  carriers: Carrier[];
  onEdit: (offer: Offer) => void;
  onDelete: (id: string) => void;
}

const OfferList = ({ offers, carriers, onEdit, onDelete }: OfferListProps) => {
  const { state } = useAppContext();
  
  const getCarrierName = (carrierId: string) => {
    const carrier = carriers.find(c => c.id === carrierId);
    return carrier ? carrier.name : "Άγνωστη Μεταφορική";
  };

  const renderOfferDetails = (offer: Offer) => {
    if (offer.type === "weight") {
      const weightOffer = offer as WeightOffer;
      return (
        <>
          <div className="font-medium">Όρια βάρους: {weightOffer.minWeight} - {weightOffer.maxWeight} kg</div>
          <div>Βασικό κόστος: {weightOffer.baseCost.toFixed(2)}€</div>
          {weightOffer.extraCostPerKg !== undefined && (
            <div>Επιπλέον κόστος ανά kg: {weightOffer.extraCostPerKg.toFixed(2)}€</div>
          )}
          {weightOffer.extraCostRemote !== undefined && (
            <div>Επιπλέον κόστος δυσπρόσιτο: {weightOffer.extraCostRemote.toFixed(2)}€</div>
          )}
          <div className="mt-2">
            <span className="font-medium">Ζώνες: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {weightOffer.zoneNames && weightOffer.zoneNames.length > 0 ? (
                weightOffer.zoneNames.map(zone => (
                  <Badge key={zone} variant="outline" className="text-xs">{zone}</Badge>
                ))
              ) : (
                <span className="text-gray-500 text-xs">Δεν έχουν οριστεί ζώνες</span>
              )}
            </div>
          </div>
        </>
      );
    } else if (offer.type === "zoneCubic") {
      const zoneCubicOffer = offer as ZoneCubicOffer;
      return (
        <>
          <div className="font-medium">Ζώνη: {zoneCubicOffer.zoneName}</div>
          <div>Κόστος ανά κυβικό: {zoneCubicOffer.cubicRate.toFixed(2)}€/m³</div>
          <div>Ελάχιστη χρέωση: {zoneCubicOffer.minCharge.toFixed(2)}€</div>
          <div>Χρόνος παράδοσης: {zoneCubicOffer.deliveryTime}</div>
          {zoneCubicOffer.minCubicVolume && (
            <div>Ελάχιστος όγκος: {zoneCubicOffer.minCubicVolume.toFixed(2)}m³</div>
          )}
          <div className="mt-2">
            <span className="font-medium">Ζώνες εξυπηρέτησης: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {zoneCubicOffer.zoneNames && zoneCubicOffer.zoneNames.length > 0 ? (
                zoneCubicOffer.zoneNames.map(zone => (
                  <Badge key={zone} variant="outline" className="text-xs">{zone}</Badge>
                ))
              ) : (
                <span className="text-gray-500 text-xs">Δεν έχουν οριστεί ζώνες</span>
              )}
            </div>
          </div>
        </>
      );
    }
    
    return <div>Άγνωστος τύπος προσφοράς</div>;
  };

  const getOfferTypeTitle = (type: string) => {
    switch (type) {
      case "weight":
        return "Προσφορά με Βάρος";
      case "zoneCubic":
        return "Ζώνες με Κυβικό";
      default:
        return "Άγνωστος Τύπος";
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Λίστα Προσφορών ({offers.length})</h3>
      
      {offers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Δεν υπάρχουν καταχωρημένες προσφορές.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Μεταφορική</TableHead>
              <TableHead>Τύπος Προσφοράς</TableHead>
              <TableHead>Λεπτομέρειες</TableHead>
              <TableHead className="text-right">Ενέργειες</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell className="font-medium">{getCarrierName(offer.carrierId)}</TableCell>
                <TableCell>{getOfferTypeTitle(offer.type)}</TableCell>
                <TableCell className="max-w-[400px]">{renderOfferDetails(offer)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(offer)}
                    >
                      Επεξεργασία
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(offer.id)}
                    >
                      Διαγραφή
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default OfferList;
