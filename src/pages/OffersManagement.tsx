
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import OfferForm from "@/components/offers/OfferForm";
import OfferList from "@/components/offers/OfferList";
import { Offer } from "@/types/Offer";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";

const OffersManagement = () => {
  const { state, addOffer, updateOffer, deleteOffer } = useAppContext();
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const { toast } = useToast();

  const handleSaveOffer = (offer: Offer) => {
    if (editingOffer) {
      // Ενημέρωση υπάρχουσας προσφοράς
      updateOffer(offer);
      setEditingOffer(null);
      toast({
        title: "Επιτυχία",
        description: "Η προσφορά ενημερώθηκε επιτυχώς",
      });
    } else {
      // Προσθήκη νέας προσφοράς
      const newOffer = {
        ...offer,
        id: Date.now().toString(), // Απλή δημιουργία ID για το παράδειγμα
      };
      addOffer(newOffer);
      toast({
        title: "Επιτυχία",
        description: "Η προσφορά προστέθηκε επιτυχώς",
      });
    }
  };

  const handleDeleteOffer = (id: string) => {
    deleteOffer(id);
    toast({
      title: "Επιτυχία",
      description: "Η προσφορά διαγράφηκε επιτυχώς",
    });
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
  };

  const handleCancelEdit = () => {
    setEditingOffer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Διαχείριση Προσφορών</h1>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Λίστα Προσφορών</TabsTrigger>
          <TabsTrigger value="add">
            {editingOffer ? "Επεξεργασία Προσφοράς" : "Προσθήκη Προσφοράς"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="p-6">
            <OfferList 
              offers={state.offers} 
              carriers={state.carriers}
              onDelete={handleDeleteOffer} 
              onEdit={handleEditOffer} 
            />
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card className="p-6">
            <OfferForm 
              initialData={editingOffer || undefined} 
              carriers={state.carriers}
              onSave={handleSaveOffer}
              onCancel={handleCancelEdit}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OffersManagement;
