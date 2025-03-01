
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { PostalCode } from "@/types/PostalCode";
import { useAppContext } from "@/context/AppContext";

interface PostalCodeFormProps {
  initialData?: PostalCode;
  onSave: (postalCode: PostalCode) => void;
  onCancel: () => void;
}

const emptyPostalCode: PostalCode = {
  id: "",
  code: "",
  county: "",
  city: "",
  area: "",
  zone: "",
  isRemote: false
};

const PostalCodeForm = ({ initialData, onSave, onCancel }: PostalCodeFormProps) => {
  const [formData, setFormData] = useState<PostalCode>(initialData || emptyPostalCode);
  const { state } = useAppContext();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(emptyPostalCode);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isRemote: checked,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Ταχυδρομικός Κώδικας</Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            placeholder="π.χ. 10431"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="county">Νομός</Label>
          <Input
            id="county"
            name="county"
            value={formData.county}
            onChange={handleChange}
            required
            placeholder="π.χ. Αττικής"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Πόλη</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            placeholder="π.χ. Αθήνα"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">Περιοχή</Label>
          <Input
            id="area"
            name="area"
            value={formData.area}
            onChange={handleChange}
            required
            placeholder="π.χ. Κυψέλη"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zone">Ζώνη</Label>
          <Select
            value={formData.zone}
            onValueChange={(value) => handleSelectChange("zone", value)}
          >
            <SelectTrigger id="zone">
              <SelectValue placeholder="Επιλέξτε ζώνη" />
            </SelectTrigger>
            <SelectContent>
              {state.zones.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex flex-col justify-end">
          <div className="flex items-center space-x-2">
            <Switch
              id="isRemote"
              checked={formData.isRemote || false}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="isRemote">Δυσπρόσιτη Περιοχή</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
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

export default PostalCodeForm;
