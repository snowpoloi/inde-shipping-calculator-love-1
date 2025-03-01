
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Carrier } from "@/types/Carrier";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface XmlImportFormProps {
  carriers: Carrier[];
  onImport: (carrierId: string, postalCodes: string[], type: 'service' | 'remote' | 'noAntiCash') => void;
}

const XmlImportForm = ({ carriers, onImport }: XmlImportFormProps) => {
  const [selectedCarrier, setSelectedCarrier] = useState<string>("");
  const [selectedType, setSelectedType] = useState<'service' | 'remote' | 'noAntiCash'>('service');
  const [xmlContent, setXmlContent] = useState<string>("");
  const [mappedFields, setMappedFields] = useState<Record<string, string>>({});
  const [extractedTags, setExtractedTags] = useState<string[]>([]);
  const [postalCodes, setPostalCodes] = useState<string[]>([]);
  const { toast } = useToast();

  // Αναλύει το XML και εξάγει τα tags που περιέχονται σε αυτό
  const parseXml = () => {
    try {
      if (!xmlContent.trim()) {
        toast({
          title: "Σφάλμα",
          description: "Παρακαλώ εισάγετε περιεχόμενο XML",
          variant: "destructive"
        });
        return;
      }

      // Απλή εξαγωγή των tags (σε πραγματική εφαρμογή θα χρησιμοποιούσαμε κάποια βιβλιοθήκη XML parsing)
      const tagRegex = /<(\w+)>/g;
      const tags = [];
      let match;
      
      while ((match = tagRegex.exec(xmlContent)) !== null) {
        if (!tags.includes(match[1])) {
          tags.push(match[1]);
        }
      }

      if (tags.length === 0) {
        toast({
          title: "Προειδοποίηση",
          description: "Δεν βρέθηκαν έγκυρα XML tags",
          variant: "destructive"
        });
        return;
      }

      setExtractedTags(tags);
      setMappedFields({});
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Προέκυψε σφάλμα κατά την ανάλυση του XML",
        variant: "destructive"
      });
    }
  };

  // Χαρτογραφεί τα πεδία XML με τα πεδία της εφαρμογής
  const handleMapField = (tag: string, fieldName: string) => {
    setMappedFields({
      ...mappedFields,
      [tag]: fieldName
    });
  };

  // Επεξεργάζεται το XML και εξάγει τους ταχυδρομικούς κώδικες
  const processXml = () => {
    try {
      // Έλεγχος αν έχει επιλεγεί πεδίο για τους ταχυδρομικούς κώδικες
      const postalCodeTag = Object.keys(mappedFields).find(key => mappedFields[key] === 'postalCode');
      
      if (!postalCodeTag) {
        toast({
          title: "Σφάλμα",
          description: "Παρακαλώ επιλέξτε ποιο πεδίο αντιστοιχεί στον ταχυδρομικό κώδικα",
          variant: "destructive"
        });
        return;
      }

      // Εξαγωγή των ταχυδρομικών κωδικών από το XML
      const postalCodeRegex = new RegExp(`<${postalCodeTag}>([^<]+)</${postalCodeTag}>`, 'g');
      const extractedPostalCodes = [];
      let match;
      
      while ((match = postalCodeRegex.exec(xmlContent)) !== null) {
        extractedPostalCodes.push(match[1].trim());
      }

      if (extractedPostalCodes.length === 0) {
        toast({
          title: "Προειδοποίηση",
          description: "Δεν βρέθηκαν ταχυδρομικοί κώδικες",
          variant: "destructive"
        });
        return;
      }

      setPostalCodes(extractedPostalCodes);
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Προέκυψε σφάλμα κατά την επεξεργασία του XML",
        variant: "destructive"
      });
    }
  };

  // Ολοκληρώνει την εισαγωγή των ταχυδρομικών κωδικών
  const handleImport = () => {
    if (!selectedCarrier) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ επιλέξτε μεταφορική",
        variant: "destructive"
      });
      return;
    }

    if (postalCodes.length === 0) {
      toast({
        title: "Σφάλμα",
        description: "Δεν υπάρχουν ταχυδρομικοί κώδικες για εισαγωγή",
        variant: "destructive"
      });
      return;
    }

    onImport(selectedCarrier, postalCodes, selectedType);
    
    toast({
      title: "Επιτυχία",
      description: `Εισάχθηκαν ${postalCodes.length} ταχυδρομικοί κώδικες`
    });

    // Επαναφορά της φόρμας
    setXmlContent("");
    setExtractedTags([]);
    setMappedFields({});
    setPostalCodes([]);
  };

  const handleReset = () => {
    setXmlContent("");
    setExtractedTags([]);
    setMappedFields({});
    setPostalCodes([]);
  };

  const typeLabels = {
    service: "Περιοχές Εξυπηρέτησης",
    remote: "Δυσπρόσιτες Περιοχές",
    noAntiCash: "Περιοχές χωρίς Αντικαταβολή"
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Εισαγωγή Περιοχών από XML</h2>
        <p className="text-sm text-muted-foreground">
          Εισάγετε ταχυδρομικούς κώδικες από αρχείο XML για τις μεταφορικές.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="carrier-select">Επιλογή Μεταφορικής</Label>
            <Select
              value={selectedCarrier}
              onValueChange={setSelectedCarrier}
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

          <div className="space-y-2">
            <Label htmlFor="type-select">Τύπος Περιοχών</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as any)}
            >
              <SelectTrigger id="type-select">
                <SelectValue placeholder="Επιλέξτε τύπο περιοχών" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">Περιοχές Εξυπηρέτησης</SelectItem>
                <SelectItem value="remote">Δυσπρόσιτες Περιοχές</SelectItem>
                <SelectItem value="noAntiCash">Περιοχές χωρίς Αντικαταβολή</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <Label htmlFor="xml-content">XML Περιεχόμενο</Label>
          <Textarea
            id="xml-content"
            value={xmlContent}
            onChange={(e) => setXmlContent(e.target.value)}
            placeholder="Επικολλήστε το περιεχόμενο XML εδώ..."
            className="min-h-[150px]"
          />
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              Καθαρισμός
            </Button>
            <Button type="button" onClick={parseXml}>
              Ανάλυση XML
            </Button>
          </div>
        </div>
      </div>

      {extractedTags.length > 0 && (
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold">Αντιστοίχιση Πεδίων</h3>
          <p className="text-sm text-muted-foreground">
            Επιλέξτε ποιο XML tag αντιστοιχεί στον ταχυδρομικό κώδικα.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {extractedTags.map((tag) => (
              <div key={tag} className="flex items-center space-x-2">
                <Label className="min-w-20 text-xs font-medium">{`<${tag}>`}</Label>
                <Select
                  value={mappedFields[tag] || ""}
                  onValueChange={(value) => handleMapField(tag, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Επιλέξτε..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Δεν αντιστοιχεί</SelectItem>
                    <SelectItem value="postalCode">Ταχυδρομικός Κώδικας</SelectItem>
                    <SelectItem value="area">Περιοχή</SelectItem>
                    <SelectItem value="city">Πόλη</SelectItem>
                    <SelectItem value="county">Νομός</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button type="button" onClick={processXml}>
              Επεξεργασία Δεδομένων
            </Button>
          </div>
        </div>
      )}

      {postalCodes.length > 0 && (
        <div className="space-y-4 border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">
              {postalCodes.length} Ταχυδρομικοί Κώδικες έτοιμοι για εισαγωγή
            </h3>
          </div>
          
          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">Λίστα</TabsTrigger>
              <TabsTrigger value="preview">Προεπισκόπηση</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="space-y-2">
              <div className="text-sm">
                Έτοιμοι για εισαγωγή {postalCodes.length} ταχυδρομικοί κώδικες στις 
                <span className="font-medium"> {typeLabels[selectedType]}</span> της 
                <span className="font-medium"> {carriers.find(c => c.id === selectedCarrier)?.name || ""}</span>.
              </div>
            </TabsContent>
            <TabsContent value="preview">
              <div className="max-h-[200px] overflow-y-auto bg-muted p-2 rounded">
                <div className="flex flex-wrap gap-2">
                  {postalCodes.map((code, index) => (
                    <div key={index} className="bg-background px-2 py-1 rounded text-sm flex items-center">
                      {code}
                      <button 
                        className="ml-1 text-muted-foreground hover:text-destructive"
                        onClick={() => setPostalCodes(postalCodes.filter((_, i) => i !== index))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              Ακύρωση
            </Button>
            <Button type="button" onClick={handleImport}>
              Εισαγωγή
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default XmlImportForm;
