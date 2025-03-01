
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carrier } from "@/types/Carrier";
import { Edit2Icon, Trash2Icon, FileTextIcon } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

interface CarrierListProps {
  carriers: Carrier[];
  onDelete: (id: string) => void;
  onEdit: (carrier: Carrier) => void;
}

const CarrierList = ({ carriers, onDelete, onEdit }: CarrierListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const handleViewDetails = (carrier: Carrier) => {
    setSelectedCarrier(carrier);
  };

  const closeDetails = () => {
    setSelectedCarrier(null);
  };

  if (carriers.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-muted-foreground">Δεν υπάρχουν καταχωρημένες μεταφορικές.</p>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Όνομα</TableHead>
            <TableHead>Τύποι Προσφορών</TableHead>
            <TableHead className="text-center">Περιορισμοί</TableHead>
            <TableHead className="text-center">Περιοχές</TableHead>
            <TableHead className="text-right">Ενέργειες</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carriers.map((carrier) => (
            <TableRow key={carrier.id}>
              <TableCell className="font-medium">{carrier.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {carrier.offersByWeight && (
                    <Badge variant="secondary">Βάρος (kg)</Badge>
                  )}
                  {carrier.offersByCubic && (
                    <Badge variant="secondary">Κυβικό (m³)</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => handleViewDetails(carrier)}
                >
                  <FileTextIcon className="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-1">
                  <Badge variant="outline">{carrier.servicedPostalCodes.length}</Badge>
                  <Badge variant="outline" className="bg-amber-50">
                    {carrier.remotePostalCodes.length}
                  </Badge>
                  <Badge variant="outline" className="bg-red-50">
                    {carrier.noAntiCashPostalCodes.length}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => onEdit(carrier)}
                  >
                    <Edit2Icon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={() => handleDeleteClick(carrier.id)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog Διαγραφής */}
      <Dialog open={!!deletingId} onOpenChange={cancelDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Επιβεβαίωση Διαγραφής</DialogTitle>
          </DialogHeader>
          <p>Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή τη μεταφορική;</p>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Ακύρωση
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Διαγραφή
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Λεπτομερειών */}
      <Dialog open={!!selectedCarrier} onOpenChange={closeDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Λεπτομέρειες Μεταφορικής</DialogTitle>
          </DialogHeader>
          {selectedCarrier && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{selectedCarrier.name}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Περιορισμοί:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span>Μέγιστο Μήκος:</span> <span>{selectedCarrier.maxLength} cm</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Μέγιστο Πλάτος:</span> <span>{selectedCarrier.maxWidth} cm</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Μέγιστο Ύψος:</span> <span>{selectedCarrier.maxHeight} cm</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Μέγιστο Βάρος:</span> <span>{selectedCarrier.maxWeight} kg</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Μέγιστο Κυβικό:</span> <span>{selectedCarrier.maxCubic} m³</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Τύποι Προσφορών:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span>Προσφορές με Βάρος (kg):</span> 
                      <Badge variant={selectedCarrier.offersByWeight ? "default" : "outline"}>
                        {selectedCarrier.offersByWeight ? "Ναι" : "Όχι"}
                      </Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Προσφορές με Κυβικό (m³):</span> 
                      <Badge variant={selectedCarrier.offersByCubic ? "default" : "outline"}>
                        {selectedCarrier.offersByCubic ? "Ναι" : "Όχι"}
                      </Badge>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Προσθήκη ζωνών εξυπηρέτησης */}
              <div className="space-y-2">
                <h4 className="font-medium">Ζώνες Εξυπηρέτησης:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCarrier.serviceZones && selectedCarrier.serviceZones.length > 0 ? 
                    selectedCarrier.serviceZones.map(zone => (
                      <Badge key={zone} variant="secondary" className="px-3 py-1">
                        {zone}
                      </Badge>
                    )) : 
                    <span className="text-sm text-muted-foreground">Δεν έχουν καταχωρηθεί ζώνες εξυπηρέτησης.</span>
                  }
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Περιοχές Εξυπηρέτησης:</h4>
                <div className="text-sm bg-muted p-2 rounded max-h-20 overflow-y-auto">
                  {selectedCarrier.servicedPostalCodes.length > 0 ? 
                    selectedCarrier.servicedPostalCodes.join(", ") : 
                    "Δεν έχουν καταχωρηθεί περιοχές εξυπηρέτησης."}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Δυσπρόσιτες Περιοχές:</h4>
                <div className="text-sm bg-muted p-2 rounded max-h-20 overflow-y-auto">
                  {selectedCarrier.remotePostalCodes.length > 0 ? 
                    selectedCarrier.remotePostalCodes.join(", ") : 
                    "Δεν έχουν καταχωρηθεί δυσπρόσιτες περιοχές."}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Περιοχές χωρίς Αντικαταβολή:</h4>
                <div className="text-sm bg-muted p-2 rounded max-h-20 overflow-y-auto">
                  {selectedCarrier.noAntiCashPostalCodes.length > 0 ? 
                    selectedCarrier.noAntiCashPostalCodes.join(", ") : 
                    "Δεν έχουν καταχωρηθεί περιοχές χωρίς αντικαταβολή."}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={closeDetails}>Κλείσιμο</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarrierList;
