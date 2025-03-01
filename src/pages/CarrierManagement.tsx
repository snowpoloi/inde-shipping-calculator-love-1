
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import CarrierForm from "@/components/carriers/CarrierForm";
import CarrierList from "@/components/carriers/CarrierList";
import XmlImportForm from "@/components/carriers/XmlImportForm";
import { Carrier } from "@/types/Carrier";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";

const CarrierManagement = () => {
  const { state, addCarrier, updateCarrier, deleteCarrier, updateCarrierPostalCodes } = useAppContext();
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const { toast } = useToast();

  const handleSaveCarrier = (carrier: Carrier) => {
    if (editingCarrier) {
      // Ενημέρωση υπάρχουσας μεταφορικής
      updateCarrier(carrier);
      setEditingCarrier(null);
      toast({
        title: "Επιτυχία",
        description: "Η μεταφορική ενημερώθηκε επιτυχώς",
      });
    } else {
      // Προσθήκη νέας μεταφορικής
      const newCarrier = {
        ...carrier,
        id: Date.now().toString(), // Απλή δημιουργία ID για το παράδειγμα
      };
      addCarrier(newCarrier);
      toast({
        title: "Επιτυχία",
        description: "Η μεταφορική προστέθηκε επιτυχώς",
      });
    }
  };

  const handleDeleteCarrier = (id: string) => {
    deleteCarrier(id);
    toast({
      title: "Επιτυχία",
      description: "Η μεταφορική διαγράφηκε επιτυχώς",
    });
  };

  const handleEditCarrier = (carrier: Carrier) => {
    setEditingCarrier(carrier);
  };

  const handleCancelEdit = () => {
    setEditingCarrier(null);
  };

  const handlePostalCodesImport = (carrierId: string, postalCodes: string[], type: 'service' | 'remote' | 'noAntiCash') => {
    updateCarrierPostalCodes(carrierId, postalCodes, type);
    toast({
      title: "Επιτυχία",
      description: "Οι ταχυδρομικοί κώδικες ενημερώθηκαν επιτυχώς",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Διαχείριση Μεταφορικών</h1>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Λίστα Μεταφορικών</TabsTrigger>
          <TabsTrigger value="add">
            {editingCarrier ? "Επεξεργασία Μεταφορικής" : "Προσθήκη Μεταφορικής"}
          </TabsTrigger>
          <TabsTrigger value="import">Εισαγωγή από XML</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="p-6">
            <CarrierList 
              carriers={state.carriers} 
              onDelete={handleDeleteCarrier} 
              onEdit={handleEditCarrier} 
            />
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card className="p-6">
            <CarrierForm 
              initialData={editingCarrier || undefined} 
              onSave={handleSaveCarrier}
              onCancel={handleCancelEdit}
            />
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card className="p-6">
            <XmlImportForm 
              carriers={state.carriers} 
              onImport={handlePostalCodesImport} 
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CarrierManagement;
