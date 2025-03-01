
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ZonesManagement = () => {
  const { state, addZone, updateZone, deleteZone } = useAppContext();
  const [newZone, setNewZone] = useState("");
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [updatedZoneName, setUpdatedZoneName] = useState("");
  const { toast } = useToast();

  const handleAddZone = () => {
    if (!newZone.trim()) {
      toast({
        title: "Σφάλμα",
        description: "Πρέπει να συμπληρώσετε το όνομα της ζώνης",
        variant: "destructive",
      });
      return;
    }

    if (state.zones && state.zones.includes(newZone.trim())) {
      toast({
        title: "Σφάλμα",
        description: "Η ζώνη υπάρχει ήδη",
        variant: "destructive",
      });
      return;
    }

    addZone(newZone.trim());
    setNewZone("");
    toast({
      title: "Επιτυχία",
      description: "Η ζώνη προστέθηκε επιτυχώς",
    });
  };

  const handleUpdateZone = () => {
    if (!editingZone) return;
    if (!updatedZoneName.trim()) {
      toast({
        title: "Σφάλμα",
        description: "Πρέπει να συμπληρώσετε το νέο όνομα της ζώνης",
        variant: "destructive",
      });
      return;
    }

    if (state.zones && state.zones.includes(updatedZoneName.trim()) && updatedZoneName.trim() !== editingZone) {
      toast({
        title: "Σφάλμα",
        description: "Υπάρχει ήδη ζώνη με αυτό το όνομα",
        variant: "destructive",
      });
      return;
    }

    updateZone(editingZone, updatedZoneName.trim());
    setEditingZone(null);
    setUpdatedZoneName("");
    toast({
      title: "Επιτυχία",
      description: "Η ζώνη ενημερώθηκε επιτυχώς",
    });
  };

  // Βρίσκουμε πόσες φορές χρησιμοποιείται κάθε ζώνη σε προσφορές και μεταφορικές
  const getZoneUsageCount = (zoneName: string) => {
    let count = 0;
    
    // Έλεγχος στις μεταφορικές
    if (state.carriers) {
      state.carriers.forEach(carrier => {
        if (carrier.serviceZones?.includes(zoneName)) {
          count++;
        }
      });
    }
    
    // Έλεγχος στις προσφορές
    if (state.offers) {
      state.offers.forEach(offer => {
        if (offer.type === 'weight' && offer.zoneNames?.includes(zoneName)) {
          count++;
        } else if (offer.type === 'zoneCubic' && offer.zoneName === zoneName) {
          count++;
        }
      });
    }
    
    return count;
  };

  // Διασφάλιση ότι το state.zones είναι πάντα ένας πίνακας για αποφυγή σφαλμάτων
  const zones = state.zones || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Διαχείριση Ζωνών</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Προσθήκη Νέας Ζώνης</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="new-zone">Όνομα Ζώνης</Label>
              <Input
                id="new-zone"
                placeholder="π.χ. ΝΗΣΙΩΤΙΚΟΙ ΠΡΟΟΡΙΣΜΟΙ"
                value={newZone}
                onChange={(e) => setNewZone(e.target.value)}
                className="mb-2"
              />
            </div>
            <div className="self-end">
              <Button onClick={handleAddZone}>Προσθήκη</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Λίστα Ζωνών</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Όνομα Ζώνης</TableHead>
                <TableHead>Χρήση</TableHead>
                <TableHead className="w-[200px] text-right">Ενέργειες</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone}>
                  <TableCell>
                    {editingZone === zone ? (
                      <Input
                        value={updatedZoneName}
                        onChange={(e) => setUpdatedZoneName(e.target.value)}
                        placeholder="Νέο όνομα ζώνης"
                      />
                    ) : (
                      zone
                    )}
                  </TableCell>
                  <TableCell>{getZoneUsageCount(zone)}</TableCell>
                  <TableCell className="text-right">
                    {editingZone === zone ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingZone(null);
                            setUpdatedZoneName("");
                          }}
                        >
                          Ακύρωση
                        </Button>
                        <Button size="sm" onClick={handleUpdateZone}>
                          Αποθήκευση
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingZone(zone);
                            setUpdatedZoneName(zone);
                          }}
                        >
                          Επεξεργασία
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Διαγραφή
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Διαγραφή Ζώνης</AlertDialogTitle>
                              <AlertDialogDescription>
                                Είστε βέβαιοι ότι θέλετε να διαγράψετε τη ζώνη "{zone}";
                                {getZoneUsageCount(zone) > 0 && (
                                  <p className="mt-2 text-red-500 font-semibold">
                                    Προσοχή! Η ζώνη χρησιμοποιείται σε {getZoneUsageCount(zone)} {getZoneUsageCount(zone) === 1 ? 'περίπτωση' : 'περιπτώσεις'}. 
                                    Η διαγραφή της θα επηρεάσει τις αντίστοιχες προσφορές και μεταφορικές.
                                  </p>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  deleteZone(zone);
                                  toast({
                                    title: "Επιτυχία",
                                    description: "Η ζώνη διαγράφηκε επιτυχώς",
                                  });
                                }}
                              >
                                Διαγραφή
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {zones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Δεν υπάρχουν διαθέσιμες ζώνες
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZonesManagement;
