
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { PostalCode } from "@/types/PostalCode";

interface PostalCodeListProps {
  postalCodes: PostalCode[];
  onDelete: (id: string) => void;
  onEdit: (postalCode: PostalCode) => void;
}

const PostalCodeList = ({ postalCodes, onDelete, onEdit }: PostalCodeListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPostalCodes = postalCodes.filter(
    (pc) =>
      pc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pc.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pc.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pc.zone && pc.zone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pc.county.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Λίστα Ταχυδρομικών Κωδικών ({postalCodes.length})</h3>
        <div className="w-1/3">
          <Input
            placeholder="Αναζήτηση..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredPostalCodes.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          {searchTerm
            ? "Δεν βρέθηκαν αποτελέσματα για την αναζήτησή σας."
            : "Δεν υπάρχουν καταχωρημένοι ταχυδρομικοί κώδικες."}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Τ.Κ.</TableHead>
              <TableHead>Περιοχή</TableHead>
              <TableHead>Πόλη</TableHead>
              <TableHead>Νομός</TableHead>
              <TableHead>Ζώνη</TableHead>
              <TableHead>Κατάσταση</TableHead>
              <TableHead className="text-right">Ενέργειες</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPostalCodes.map((postalCode) => (
              <TableRow key={postalCode.id}>
                <TableCell className="font-medium">{postalCode.code}</TableCell>
                <TableCell>{postalCode.area}</TableCell>
                <TableCell>{postalCode.city}</TableCell>
                <TableCell>{postalCode.county}</TableCell>
                <TableCell>{postalCode.zone || "-"}</TableCell>
                <TableCell>
                  {postalCode.isRemote && (
                    <Badge variant="secondary">Δυσπρόσιτη</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(postalCode)}
                    >
                      Επεξεργασία
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(postalCode.id)}
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

export default PostalCodeList;
