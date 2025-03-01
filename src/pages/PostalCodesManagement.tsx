
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import PostalCodeForm from "@/components/postalcodes/PostalCodeForm";
import PostalCodeList from "@/components/postalcodes/PostalCodeList";
import { PostalCode } from "@/types/PostalCode";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";

const PostalCodesManagement = () => {
  const { state, addPostalCode, updatePostalCode, deletePostalCode } = useAppContext();
  const [editingPostalCode, setEditingPostalCode] = useState<PostalCode | null>(null);
  const { toast } = useToast();

  const handleSavePostalCode = (postalCode: PostalCode) => {
    if (editingPostalCode) {
      // Ενημέρωση υπάρχοντος Τ.Κ.
      updatePostalCode(postalCode);
      setEditingPostalCode(null);
      toast({
        title: "Επιτυχία",
        description: "Ο ταχυδρομικός κώδικας ενημερώθηκε επιτυχώς",
      });
    } else {
      // Προσθήκη νέου Τ.Κ.
      const newPostalCode = {
        ...postalCode,
        id: Date.now().toString(), // Απλή δημιουργία ID για το παράδειγμα
      };
      addPostalCode(newPostalCode);
      toast({
        title: "Επιτυχία",
        description: "Ο ταχυδρομικός κώδικας προστέθηκε επιτυχώς",
      });
    }
  };

  const handleDeletePostalCode = (id: string) => {
    deletePostalCode(id);
    toast({
      title: "Επιτυχία",
      description: "Ο ταχυδρομικός κώδικας διαγράφηκε επιτυχώς",
    });
  };

  const handleEditPostalCode = (postalCode: PostalCode) => {
    setEditingPostalCode(postalCode);
  };

  const handleCancelEdit = () => {
    setEditingPostalCode(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Διαχείριση Ταχυδρομικών Κωδικών</h1>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Λίστα Ταχ. Κωδικών</TabsTrigger>
          <TabsTrigger value="add">
            {editingPostalCode ? "Επεξεργασία Ταχ. Κώδικα" : "Προσθήκη Ταχ. Κώδικα"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="p-6">
            <PostalCodeList 
              postalCodes={state.postalCodes} 
              onDelete={handleDeletePostalCode} 
              onEdit={handleEditPostalCode} 
            />
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card className="p-6">
            <PostalCodeForm 
              initialData={editingPostalCode || undefined} 
              onSave={handleSavePostalCode}
              onCancel={handleCancelEdit}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PostalCodesManagement;
