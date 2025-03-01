
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carrier } from "@/types/Carrier";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";

interface CarrierFormProps {
  initialData?: Carrier;
  onSave: (carrier: Carrier) => void;
  onCancel: () => void;
}

const defaultCarrier: Carrier = {
  id: "",
  name: "",
  maxLength: 0,
  maxWidth: 0,
  maxHeight: 0,
  maxWeight: 0,
  maxCubic: 0,
  offersByWeight: true,
  offersByCubic: false,
  servicedPostalCodes: [],
  remotePostalCodes: [],
  noAntiCashPostalCodes: [],
  serviceZones: []
};

// Αντιστοίχιση ζωνών με κατηγορίες
const zoneCategories: Record<string, "ΑΘΗΝΑ" | "ΧΕΡΣΑΙΟΙ" | "ΝΗΣΙΩΤΙΚΟΙ"> = {
  "ΑΘΗΝΑ": "ΑΘΗΝΑ",
  "ΑΘΗΝΑ 2": "ΑΘΗΝΑ",
  "ΘΕΣΣΑΛΟΝΙΚΗ": "ΧΕΡΣΑΙΟΙ",
  "ΚΕΝΤΡΙΚΗ ΕΛΛΑΔΑ": "ΧΕΡΣΑΙΟΙ",
  "ΒΟΡΕΙΑ ΕΛΛΑΔΑ": "ΧΕΡΣΑΙΟΙ",
  "ΝΗΣΙΑ": "ΝΗΣΙΩΤΙΚΟΙ",
  "ΝΗΣΙΑ 2": "ΝΗΣΙΩΤΙΚΟΙ"
};

const CarrierForm = ({ initialData, onSave, onCancel }: CarrierFormProps) => {
  const [formData, setFormData] = useState<Carrier>(initialData || defaultCarrier);
  const [selectedZones, setSelectedZones] = useState<string[]>(initialData?.serviceZones || []);
  const { toast } = useToast();
  const { state } = useAppContext();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSelectedZones(initialData.serviceZones || []);
    } else {
      setFormData(defaultCarrier);
      setSelectedZones([]);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const toggleZone = (zone: string) => {
    if (selectedZones.includes(zone)) {
      setSelectedZones(selectedZones.filter(z => z !== zone));
    } else {
      setSelectedZones([...selectedZones, zone]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Βασικός έλεγχος εγκυρότητας
    if (!formData.name.trim()) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε το όνομα της μεταφορικής",
        variant: "destructive"
      });
      return;
    }

    // Τουλάχιστον ένας τύπος προσφοράς πρέπει να είναι ενεργοποιημένος
    if (!formData.offersByWeight && !formData.offersByCubic) {
      toast({
        title: "Σφάλμα",
        description: "Πρέπει να επιλέξετε τουλάχιστον έναν τύπο προσφοράς",
        variant: "destructive"
      });
      return;
    }

    // Προσθήκη των επιλεγμένων ζωνών στο formData
    const updatedCarrier = {
      ...formData,
      serviceZones: selectedZones
    };

    onSave(updatedCarrier);
    
    if (!initialData) {
      // Επαναφορά της φόρμας αν είναι νέα εγγραφή
      setFormData(defaultCarrier);
      setSelectedZones([]);
    }
    
    toast({
      title: "Επιτυχία",
      description: initialData 
        ? "Η μεταφορική ενημερώθηκε επιτυχώς" 
        : "Η μεταφορική προστέθηκε επιτυχώς"
    });
  };

  // Λαμβάνουμε δυναμικά τις διαθέσιμες ζώνες από το context
  const availableZones = state.zones || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {initialData ? "Επεξεργασία Μεταφορικής" : "Προσθήκη Νέας Μεταφορικής"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Όνομα Μεταφορικής</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Τύποι Προσφορών</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="offersByWeight">Προσφορές με Βάρος (kg)</Label>
              <Switch
                id="offersByWeight"
                checked={formData.offersByWeight}
                onCheckedChange={(checked) => handleSwitchChange('offersByWeight', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="offersByCubic">Προσφορές με Κυβικό (m³)</Label>
              <Switch
                id="offersByCubic"
                checked={formData.offersByCubic}
                onCheckedChange={(checked) => handleSwitchChange('offersByCubic', checked)}
              />
            </div>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Περιορισμοί Μεταφορικής</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxLength">Μέγιστο Μήκος (cm)</Label>
                <Input
                  id="maxLength"
                  name="maxLength"
                  type="number"
                  value={formData.maxLength}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxWidth">Μέγιστο Πλάτος (cm)</Label>
                <Input
                  id="maxWidth"
                  name="maxWidth"
                  type="number"
                  value={formData.maxWidth}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxHeight">Μέγιστο Ύψος (cm)</Label>
                <Input
                  id="maxHeight"
                  name="maxHeight"
                  type="number"
                  value={formData.maxHeight}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxWeight">Μέγιστο Βάρος (kg)</Label>
                <Input
                  id="maxWeight"
                  name="maxWeight"
                  type="number"
                  value={formData.maxWeight}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxCubic">Μέγιστο Κυβικό (m³)</Label>
                <Input
                  id="maxCubic"
                  name="maxCubic"
                  type="number"
                  value={formData.maxCubic}
                  onChange={handleChange}
                  min="0"
                  step="0.001"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Ζώνες Εξυπηρέτησης</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {availableZones.map(zone => (
                <div key={zone} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`zone-${zone}`}
                    checked={selectedZones.includes(zone)}
                    onChange={() => toggleZone(zone)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={`zone-${zone}`} className="cursor-pointer">
                    {zone} {zoneCategories[zone] && <span className="text-sm text-muted-foreground">({zoneCategories[zone]})</span>}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Ακύρωση
        </Button>
        <Button type="submit">
          {initialData ? "Ενημέρωση" : "Αποθήκευση"}
        </Button>
      </div>
    </form>
  );
};

export default CarrierForm;
