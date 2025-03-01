import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Carrier } from "@/types/Carrier";
import { Offer, WeightOffer, ZoneCubicOffer } from "@/types/Offer";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";

interface OfferFormProps {
  initialData?: Offer;
  carriers: Carrier[];
  onSave: (offer: Offer) => void;
  onCancel: () => void;
}

const defaultWeightOffer: WeightOffer = {
  id: "",
  type: "weight",
  carrierId: "",
  minWeight: 0,
  maxWeight: 0,
  baseCost: 0,
  extraCostPerKg: undefined,
  extraCostRemote: undefined,
  zoneNames: []
};

const defaultZoneCubicOffer: ZoneCubicOffer = {
  id: "",
  type: "zoneCubic",
  carrierId: "",
  zoneId: "",
  zoneName: "",
  minCharge: 0,
  cubicRate: 0,
  deliveryTime: "",
  minCubicVolume: 0.12,
  zoneNames: []
};

const OfferForm = ({ initialData, carriers, onSave, onCancel }: OfferFormProps) => {
  const { state } = useAppContext();
  const [offerType, setOfferType] = useState<"weight" | "zoneCubic">(
    initialData ? (initialData as any).type : "weight"
  );
  
  const [weightOfferData, setWeightOfferData] = useState<WeightOffer>(
    initialData && (initialData as any).type === "weight" 
      ? initialData as WeightOffer 
      : defaultWeightOffer
  );
  
  const [zoneCubicOfferData, setZoneCubicOfferData] = useState<ZoneCubicOffer>(
    initialData && (initialData as any).type === "zoneCubic" 
      ? initialData as ZoneCubicOffer 
      : defaultZoneCubicOffer
  );
  
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>(
    initialData ? (initialData as any).carrierId : ""
  );
  
  const { toast } = useToast();

  const availableZones = state.zones || [];

  useEffect(() => {
    if (initialData) {
      setSelectedCarrierId((initialData as any).carrierId);
      
      if ((initialData as any).type === "weight") {
        setOfferType("weight");
        const weightOffer = initialData as WeightOffer;
        const updatedOffer: WeightOffer = {
          ...weightOffer,
          zoneNames: weightOffer.zoneNames || []
        };
        setWeightOfferData(updatedOffer);
      } else if ((initialData as any).type === "zoneCubic") {
        setOfferType("zoneCubic");
        const zoneCubicOffer = initialData as ZoneCubicOffer;
        setZoneCubicOfferData({
          ...zoneCubicOffer,
          zoneNames: zoneCubicOffer.zoneNames || []
        });
      }
    } else {
      setSelectedCarrierId("");
      setWeightOfferData(defaultWeightOffer);
      setZoneCubicOfferData(defaultZoneCubicOffer);
    }
  }, [initialData]);

  const selectedCarrier = carriers.find(c => c.id === selectedCarrierId);

  const handleCarrierChange = (carrierId: string) => {
    setSelectedCarrierId(carrierId);
    
    const carrier = carriers.find(c => c.id === carrierId);
    if (carrier) {
      if (offerType === "weight" && !carrier.offersByWeight) {
        if (carrier.offersByCubic) {
          setOfferType("zoneCubic");
        }
      } else if (offerType === "zoneCubic" && !carrier.offersByCubic) {
        if (carrier.offersByWeight) {
          setOfferType("weight");
        }
      }
    }
    
    setWeightOfferData({
      ...weightOfferData,
      carrierId
    });
    
    setZoneCubicOfferData({
      ...zoneCubicOfferData,
      carrierId
    });
  };

  const handleWeightOfferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    const processedValue = value === "" 
      ? undefined 
      : parseFloat(value) || 0;
    
    setWeightOfferData({
      ...weightOfferData,
      [name]: processedValue
    });
  };

  const handleZoneSelectionChange = (zone: string, checked: boolean) => {
    if (offerType === "weight") {
      setWeightOfferData(prev => {
        const prevZoneNames = prev.zoneNames || [];
        
        if (checked) {
          return {
            ...prev,
            zoneNames: [...prevZoneNames, zone]
          };
        } else {
          return {
            ...prev,
            zoneNames: prevZoneNames.filter(z => z !== zone)
          };
        }
      });
    } else if (offerType === "zoneCubic") {
      setZoneCubicOfferData(prev => {
        const prevZoneNames = prev.zoneNames || [];
        
        if (checked) {
          return {
            ...prev,
            zoneNames: [...prevZoneNames, zone]
          };
        } else {
          return {
            ...prev,
            zoneNames: prevZoneNames.filter(z => z !== zone)
          };
        }
      });
    }
  };
  
  const handleZoneCubicOfferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setZoneCubicOfferData({
      ...zoneCubicOfferData,
      [name]: name === 'zoneName' || name === 'deliveryTime' || name === 'zoneId' 
        ? value 
        : parseFloat(value) || 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCarrierId) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ επιλέξτε μεταφορική",
        variant: "destructive"
      });
      return;
    }

    if (offerType === "weight") {
      if (weightOfferData.minWeight >= weightOfferData.maxWeight) {
        toast({
          title: "Σφάλμα",
          description: "Το ελάχιστο βάρος πρέπει να είναι μικρότερο από το μέγιστο",
          variant: "destructive"
        });
        return;
      }
      
      if (weightOfferData.baseCost <= 0) {
        toast({
          title: "Σφάλμα",
          description: "Το βασικό κόστος πρέπει να είναι μεγαλύτερο από μηδέν",
          variant: "destructive"
        });
        return;
      }

      if (!weightOfferData.zoneNames || weightOfferData.zoneNames.length === 0) {
        toast({
          title: "Σφάλμα",
          description: "Παρακαλώ επιλέξτε τουλάχιστον μία ζώνη εξυπηρέτησης",
          variant: "destructive"
        });
        return;
      }
      
      const offerToSave: WeightOffer = {
        ...weightOfferData,
        id: initialData?.id || "",
        type: "weight",
        carrierId: selectedCarrierId,
        zoneNames: weightOfferData.zoneNames || []
      };
      
      onSave(offerToSave);
    } else if (offerType === "zoneCubic") {
      if (!zoneCubicOfferData.zoneName) {
        toast({
          title: "Σφάλμα",
          description: "Παρακαλώ συμπληρώστε το όνομα της ζώνης",
          variant: "destructive"
        });
        return;
      }
      
      if (zoneCubicOfferData.cubicRate <= 0) {
        toast({
          title: "Σφάλμα",
          description: "Το κόστος ανά κυβικό πρέπει να είναι μεγαλύτερο από μηδέν",
          variant: "destructive"
        });
        return;
      }
      
      if (zoneCubicOfferData.minCharge <= 0) {
        toast({
          title: "Σφάλμα",
          description: "Η ελάχιστη χρέωση πρέπει να είναι μεγαλύτερη από μηδέν",
          variant: "destructive"
        });
        return;
      }
      
      if (!zoneCubicOfferData.zoneNames || zoneCubicOfferData.zoneNames.length === 0) {
        toast({
          title: "Σφάλμα",
          description: "Παρακαλώ επιλέξτε τουλάχιστον μία ζώνη εξυπηρέτησης",
          variant: "destructive"
        });
        return;
      }
      
      const offerToSave: ZoneCubicOffer = {
        ...zoneCubicOfferData,
        id: initialData?.id || "",
        type: "zoneCubic",
        carrierId: selectedCarrierId,
        zoneId: zoneCubicOfferData.zoneId || Date.now().toString()
      };
      
      onSave(offerToSave);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {initialData ? "Επεξεργασία Προσφοράς" : "Προσθήκη Νέας Προσφοράς"}
        </h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="carrier-select">Μεταφορική</Label>
            <Select
              value={selectedCarrierId}
              onValueChange={handleCarrierChange}
            >
              <SelectTrigger id="carrier-select">
                <SelectValue placeholder="Επιλέξτε μεταφορική" />
              </SelectTrigger>
              <SelectContent>
                {carriers.map((carrier) => (
                  <SelectItem key={carrier.id} value={carrier.id}>
                    {carrier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedCarrier && (
            <div className="space-y-2">
              <Label>Τύπος Προσφοράς</Label>
              <Tabs
                value={offerType}
                onValueChange={(value) => setOfferType(value as "weight" | "zoneCubic")}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger 
                    value="weight" 
                    disabled={!selectedCarrier.offersByWeight}
                    className={!selectedCarrier.offersByWeight ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    Προσφορά με Βάρος
                  </TabsTrigger>
                  <TabsTrigger 
                    value="zoneCubic" 
                    disabled={!selectedCarrier.offersByCubic}
                    className={!selectedCarrier.offersByCubic ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    Ζώνες με Κυβικό
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="weight" className="border rounded-md p-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minWeight">Ελάχιστο Βάρος (kg)</Label>
                      <Input
                        id="minWeight"
                        name="minWeight"
                        type="number"
                        value={weightOfferData.minWeight}
                        onChange={handleWeightOfferChange}
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxWeight">Μέγιστο Βάρος (kg)</Label>
                      <Input
                        id="maxWeight"
                        name="maxWeight"
                        type="number"
                        value={weightOfferData.maxWeight}
                        onChange={handleWeightOfferChange}
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="baseCost">Βασικό Κόστος (€)</Label>
                      <Input
                        id="baseCost"
                        name="baseCost"
                        type="number"
                        value={weightOfferData.baseCost}
                        onChange={handleWeightOfferChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="extraCostPerKg">Επιπλέον Κόστος ανά kg (€)</Label>
                      <Input
                        id="extraCostPerKg"
                        name="extraCostPerKg"
                        type="number"
                        value={weightOfferData.extraCostPerKg === undefined ? "" : weightOfferData.extraCostPerKg}
                        onChange={handleWeightOfferChange}
                        min="0"
                        step="0.01"
                        placeholder="Προαιρετικό"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="extraCostRemote">Επιπλέον Κόστος Δυσπρόσιτο (€)</Label>
                      <Input
                        id="extraCostRemote"
                        name="extraCostRemote"
                        type="number"
                        value={weightOfferData.extraCostRemote === undefined ? "" : weightOfferData.extraCostRemote}
                        onChange={handleWeightOfferChange}
                        min="0"
                        step="0.01"
                        placeholder="Προαιρετικό"
                      />
                    </div>
                    
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Ζώνες Εξυπηρέτησης</Label>
                      <div className="border rounded-md p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {availableZones.map((zone) => (
                          <div key={zone} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`weight-zone-${zone}`} 
                              checked={(weightOfferData.zoneNames || []).includes(zone)}
                              onCheckedChange={(checked) => handleZoneSelectionChange(zone, !!checked)}
                            />
                            <Label htmlFor={`weight-zone-${zone}`} className="cursor-pointer">
                              {zone}
                            </Label>
                          </div>
                        ))}
                        {availableZones.length === 0 && (
                          <div className="col-span-full text-center text-gray-500">
                            Δεν βρέθηκαν διαθέσιμες ζώνες
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="zoneCubic" className="border rounded-md p-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="zoneName">Όνομα Ζώνης</Label>
                      <Select
                        value={zoneCubicOfferData.zoneName}
                        onValueChange={(value) => setZoneCubicOfferData({...zoneCubicOfferData, zoneName: value})}
                      >
                        <SelectTrigger id="zoneName">
                          <SelectValue placeholder="Επιλέξτε ζώνη" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableZones.map((zone) => (
                            <SelectItem key={zone} value={zone}>
                              {zone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minCharge">Ελάχιστη Χρέωση (€)</Label>
                      <Input
                        id="minCharge"
                        name="minCharge"
                        type="number"
                        value={zoneCubicOfferData.minCharge}
                        onChange={handleZoneCubicOfferChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cubicRate">Τιμή Κυβικού (€/m³)</Label>
                      <Input
                        id="cubicRate"
                        name="cubicRate"
                        type="number"
                        value={zoneCubicOfferData.cubicRate}
                        onChange={handleZoneCubicOfferChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryTime">Χρόνος Παράδοσης</Label>
                      <Input
                        id="deliveryTime"
                        name="deliveryTime"
                        type="text"
                        value={zoneCubicOfferData.deliveryTime}
                        onChange={(e) => setZoneCubicOfferData({...zoneCubicOfferData, deliveryTime: e.target.value})}
                        placeholder="π.χ. 24-72 ώρες"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minCubicVolume">Ελάχιστος Όγκος για Χρέωση (m³)</Label>
                      <Input
                        id="minCubicVolume"
                        name="minCubicVolume"
                        type="number"
                        value={zoneCubicOfferData.minCubicVolume || 0.12}
                        onChange={handleZoneCubicOfferChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Ζώνες Εξυπηρέτησης</Label>
                      <div className="border rounded-md p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {availableZones.map((zone) => (
                          <div key={zone} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`zonecubic-zone-${zone}`} 
                              checked={(zoneCubicOfferData.zoneNames || []).includes(zone)}
                              onCheckedChange={(checked) => handleZoneSelectionChange(zone, !!checked)}
                            />
                            <Label htmlFor={`zonecubic-zone-${zone}`} className="cursor-pointer">
                              {zone}
                            </Label>
                          </div>
                        ))}
                        {availableZones.length === 0 && (
                          <div className="col-span-full text-center text-gray-500">
                            Δεν βρέθηκαν διαθέσιμες ζώνες
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Ακύρωση
        </Button>
        <Button 
          type="submit"
          disabled={
            !selectedCarrierId || 
            (offerType === "weight" && (!selectedCarrier?.offersByWeight || !weightOfferData.zoneNames || weightOfferData.zoneNames.length === 0)) ||
            (offerType === "zoneCubic" && (!selectedCarrier?.offersByCubic || !zoneCubicOfferData.zoneName || !zoneCubicOfferData.zoneNames || zoneCubicOfferData.zoneNames.length === 0))
          }
        >
          {initialData ? "Ενημέρωση" : "Αποθήκευση"}
        </Button>
      </div>
    </form>
  );
};

export default OfferForm;
