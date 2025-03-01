import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { Package } from "@/types/Package";
import { CalculationResult } from "@/types/CalculationResult";

const ShippingCalculator = () => {
  const { state } = useAppContext();
  const { toast } = useToast();
  
  // Ορισμός βημάτων
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hasVolumeOrWeight, setHasVolumeOrWeight] = useState<string>("");
  
  // Στοιχεία συνολικής αποστολής (Βήμα 1-Επιλογή Ναι)
  const [totalShipment, setTotalShipment] = useState<{
    totalVolume?: number;
    totalWeight?: number;
    packages: number;
  }>({
    totalVolume: undefined,
    totalWeight: undefined,
    packages: 1
  });
  
  // Πακέτα με αναλυτικές διαστάσεις (Βήμα 1-Επιλογή Όχι -> Βήμα 2)
  const [individualPackages, setIndividualPackages] = useState<Package[]>([{
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    volume: 0
  }]);
  
  // Ταχυδρομικός κώδικας (Βήμα 3)
  const [shippingDetails, setShippingDetails] = useState<{
    postalCode: string;
    area?: string;
  }>({
    postalCode: "",
    area: undefined
  });
  
  // Αποτελέσματα υπολογισμού (Βήμα 4)
  const [results, setResults] = useState<CalculationResult[]>([]);
  
  // Διαθέσιμες περιοχές για επιλεγμένο ΤΚ
  const [availableAreas, setAvailableAreas] = useState<{area: string, city: string}[]>([]);
  
  // Επαναφορά των πακέτων όταν αλλάζει ο αριθμός τους
  useEffect(() => {
    if (hasVolumeOrWeight === "no") {
      const packageCount = Math.max(1, totalShipment.packages);
      const newPackages: Package[] = [];
      
      for (let i = 0; i < packageCount; i++) {
        if (i < individualPackages.length) {
          newPackages.push(individualPackages[i]);
        } else {
          newPackages.push({
            length: 0,
            width: 0,
            height: 0,
            weight: 0,
            volume: 0
          });
        }
      }
      
      setIndividualPackages(newPackages);
    }
  }, [totalShipment.packages, hasVolumeOrWeight]);
  
  // Ενημέρωση διαθέσιμων περιοχών όταν αλλάζει ο ΤΚ
  useEffect(() => {
    if (shippingDetails.postalCode) {
      // Βρίσκουμε όλες τις περιοχές με αυτόν τον ΤΚ
      const areas = state.postalCodes
        .filter(pc => pc.code === shippingDetails.postalCode)
        .map(pc => ({
          area: pc.area,
          city: pc.city
        }));
      
      setAvailableAreas(areas);
      
      // Αν υπάρχει μόνο μία περιοχή, την επιλέγουμε αυτόματα
      if (areas.length === 1) {
        setShippingDetails(prev => ({
          ...prev,
          area: areas[0].area
        }));
      } else if (areas.length === 0) {
        setShippingDetails(prev => ({
          ...prev,
          area: undefined
        }));
      }
    } else {
      setAvailableAreas([]);
      setShippingDetails(prev => ({
        ...prev,
        area: undefined
      }));
    }
  }, [shippingDetails.postalCode, state.postalCodes]);
  
  // Διαχείριση αλλαγών στα πεδία των πακέτων
  const handlePackageChange = (index: number, field: keyof Package, value: number) => {
    const updatedPackages = [...individualPackages];
    updatedPackages[index] = {
      ...updatedPackages[index],
      [field]: value
    };
    
    // Υπολογισμός όγκου αν έχουν οριστεί όλες οι διαστάσεις
    if (field === 'length' || field === 'width' || field === 'height') {
      const { length, width, height } = updatedPackages[index];
      if (length && width && height) {
        updatedPackages[index].volume = calculateVolume(length, width, height);
      }
    }
    
    setIndividualPackages(updatedPackages);
  };
  
  // Υπολογισμός όγκου από διαστάσεις
  const calculateVolume = (length: number, width: number, height: number): number => {
    return (length * width * height) / 1000000; // Μετατροπή σε κυβικά μέτρα
  };
  
  // Υπολογισμός συνολικού όγκου και βάρους από τα επιμέρους πακέτα
  const calculateTotals = (): { totalVolume: number, totalWeight: number } => {
    let totalVolume = 0;
    let totalWeight = 0;
    
    individualPackages.forEach(pkg => {
      if (pkg.volume) totalVolume += pkg.volume;
      if (pkg.weight) totalWeight += pkg.weight;
    });
    
    return { totalVolume, totalWeight };
  };
  
  // Υπολογισμός τιμών
  const calculatePrice = () => {
    // Δημιουργία package object για τους υπολογισμούς
    const packageDetails: Package = {
      postalCode: shippingDetails.postalCode,
      packages: totalShipment.packages
    };
    
    // Ανάλογα με τον τρόπο υπολογισμού, προσθέτουμε είτε συνολικές τιμές είτε υπολογισμένα σύνολα
    if (hasVolumeOrWeight === "yes") {
      packageDetails.weight = totalShipment.totalWeight;
      packageDetails.volume = totalShipment.totalVolume;
    } else {
      const { totalVolume, totalWeight } = calculateTotals();
      packageDetails.weight = totalWeight;
      packageDetails.volume = totalVolume;
      
      // Προσθέτουμε και τις διαστάσεις του μεγαλύτερου πακέτου για έλεγχο περιορισμών
      const maxDimensions = individualPackages.reduce(
        (max, pkg) => {
          return {
            length: Math.max(max.length || 0, pkg.length || 0),
            width: Math.max(max.width || 0, pkg.width || 0),
            height: Math.max(max.height || 0, pkg.height || 0)
          };
        },
        { length: 0, width: 0, height: 0 }
      );
      
      packageDetails.length = maxDimensions.length;
      packageDetails.width = maxDimensions.width;
      packageDetails.height = maxDimensions.height;
    }
    
    // Find the postal code details
    const postalCodeDetails = state.postalCodes.find(pc => 
      pc.code === packageDetails.postalCode && (!shippingDetails.area || pc.area === shippingDetails.area)
    );
    
    if (!postalCodeDetails) {
      toast({
        title: "Προειδοποίηση",
        description: "Ο ταχυδρομικός κώδικας/περιοχή δεν βρέθηκε στη βάση δεδομένων",
        variant: "default"
      });
      return;
    }
    
    console.log("Υπολογισμός με τα εξής δεδομένα:", { 
      packageDetails, 
      postalCodeDetails,
      carrierCount: state.carriers.length,
      offerCount: state.offers.length
    });
    
    const calculationResults: CalculationResult[] = [];
    
    // Υπολογισμός για κάθε μεταφορική
    state.carriers.forEach(carrier => {
      console.log(`Έλεγχος μεταφορικής: ${carrier.name}`);
      
      // Έλεγχος περιορισμών διαστάσεων και βάρους
      const dimensionLimitExceeded = (
        (packageDetails.length && packageDetails.length > carrier.maxLength) ||
        (packageDetails.width && packageDetails.width > carrier.maxWidth) ||
        (packageDetails.height && packageDetails.height > carrier.maxHeight) ||
        (packageDetails.weight && packageDetails.weight > carrier.maxWeight)
      );
      
      // Ξεχωριστός έλεγχος για maxCubic με ειδικό χειρισμό όταν είναι 0
      const cubicLimitExceeded = carrier.maxCubic > 0 && 
        packageDetails.volume && packageDetails.volume > carrier.maxCubic;
      
      if (dimensionLimitExceeded || cubicLimitExceeded) {
        // Η μεταφορική δεν μπορεί να μεταφέρει το πακέτο
        console.log(`${carrier.name}: Το πακέτο υπερβαίνει τους περιορισμούς της μεταφορικής`, {
          packageDimensions: {
            length: packageDetails.length,
            width: packageDetails.width,
            height: packageDetails.height,
            weight: packageDetails.weight,
            volume: packageDetails.volume
          },
          carrierLimits: {
            maxLength: carrier.maxLength,
            maxWidth: carrier.maxWidth,
            maxHeight: carrier.maxHeight,
            maxWeight: carrier.maxWeight,
            maxCubic: carrier.maxCubic
          }
        });
        return;
      }
    
      // Βεβαιωνόμαστε ότι τα arrays υπάρχουν
      const servicedPostalCodes = carrier.servicedPostalCodes || [];
      const remotePostalCodes = carrier.remotePostalCodes || [];
      const noAntiCashPostalCodes = carrier.noAntiCashPostalCodes || [];
      
      // Έλεγχος αν η μεταφορική εξυπηρετεί τον συγκεκριμένο ταχυδρομικό κώδικα
      const isServicedPostalCode = servicedPostalCodes.includes(packageDetails.postalCode || '');
      
      // Add debug logging to see what's being checked
      console.log(`${carrier.name}: Ελέγχω αν εξυπηρετεί τον ΤΚ ${packageDetails.postalCode}`, {
        carrierServicedCodes: servicedPostalCodes,
        postalCodeInList: isServicedPostalCode
      });
      
      if (!isServicedPostalCode) {
        // Η μεταφορική δεν εξυπηρετεί τον ταχυδρομικό κώδικα
        console.log(`${carrier.name}: Δεν εξυπηρετεί τον ΤΚ ${packageDetails.postalCode}`);
        return;
      }
    
      // Έλεγχος αν είναι δυσπρόσιτη περιοχή
      const isRemotePostalCode = remotePostalCodes.includes(packageDetails.postalCode || '') || 
                                (postalCodeDetails?.isRemote === true);
    
      // Έλεγχος αν επιτρέπεται αντικαταβολή
      const allowsCashOnDelivery = !noAntiCashPostalCodes.includes(packageDetails.postalCode || '');
      
      // Ενδεικτικά κόστη από προσφορές βάσει βάρους
      let minimumCost = Infinity;
      let selectedOffer = null;
      
      // Έλεγχος προσφορών βάσει βάρους
      if (carrier.offersByWeight && packageDetails.weight) {
        const weightOffers = state.offers.filter(
          offer => offer.carrierId === carrier.id && 
          offer.type === 'weight'
        );
        
        console.log(`${carrier.name}: Βρέθηκαν ${weightOffers.length} προσφορές βάσει βάρους`, {
          carrierId: carrier.id,
          packageWeight: packageDetails.weight,
          postalCode: packageDetails.postalCode
        });
        
        for (const offer of weightOffers) {
          if (offer.type === 'weight') {
            // Ελέγχουμε αν η ζώνη του ΤΚ είναι στις ζώνες της προσφοράς
            if (!offer.zoneNames.includes(postalCodeDetails.zone)) {
              console.log(`${carrier.name}: Η προσφορά ${offer.id} δεν ισχύει για τη ζώνη ${postalCodeDetails.zone}`);
              continue;
            }
            
            // Ελέγχουμε το εύρος βάρους
            if (packageDetails.weight < offer.minWeight || packageDetails.weight > offer.maxWeight) {
              console.log(`${carrier.name}: Το βάρος ${packageDetails.weight}kg είναι εκτός εύρους προσφοράς (${offer.minWeight}-${offer.maxWeight}kg)`);
              continue;
            }
            
            let cost = offer.baseCost;
            
            // Προσθήκη επιπλέον κόστους ανά κιλό αν υπάρχει
            if (offer.extraCostPerKg !== undefined) {
              const extraWeight = Math.max(0, packageDetails.weight - offer.minWeight);
              cost += extraWeight * offer.extraCostPerKg;
            }
            
            // Προσθήκη επιπλέον κόστους για δυσπρόσιτη περιοχή αν υπάρχει
            if (isRemotePostalCode && offer.extraCostRemote !== undefined) {
              cost += offer.extraCostRemote;
            }
            
            console.log(`${carrier.name}: Προσφορά βάρους ${offer.id} - Κόστος: ${cost}€`);
            
            if (cost < minimumCost) {
              minimumCost = cost;
              selectedOffer = offer;
            }
          }
        }
      }
      
      // Έλεγχος προσφορών βάσει κυβικού
      if (carrier.offersByCubic && packageDetails.volume) {
        // Έλεγχος για γενικές προσφορές κυβικού - Removing this section since cubicOffers no longer exist
        console.log(`${carrier.name}: Βρέθηκαν 0 γενικές προσφορές κυβικού (μη υποστηριζόμενος τύπος)`);
        
        // Έλεγχος για προσφορές κυβικού ανά ζώνη
        const zoneCubicOffers = state.offers.filter(
          offer => offer.carrierId === carrier.id && 
                  offer.type === 'zoneCubic' && 
                  offer.zoneName === postalCodeDetails.zone
        );
        
        console.log(`${carrier.name}: Βρέθηκαν ${zoneCubicOffers.length} προσφορές κυβικού για τη ζώνη ${postalCodeDetails.zone}`);
        
        for (const offer of zoneCubicOffers) {
          if (offer.type === 'zoneCubic') {
            // Έλεγχος ελάχιστου όγκου αν υπάρχει
            let chargedVolume = packageDetails.volume;
            if (offer.minCubicVolume && packageDetails.volume < offer.minCubicVolume) {
              chargedVolume = offer.minCubicVolume;
              console.log(`${carrier.name}: Χρέωση ελάχιστου όγκου ${offer.minCubicVolume}m³ αντί για ${packageDetails.volume}m³`);
            }
            
            const cost = Math.max(offer.minCharge, chargedVolume * offer.cubicRate);
            
            console.log(`${carrier.name}: Προσφορά κυβικού ζώνης - Κόστος: ${cost}€`);
            
            if (cost < minimumCost) {
              minimumCost = cost;
              selectedOffer = {
                ...offer,
                chargedVolume
              };
            }
          }
        }
      }
      
      // Έλεγχος προσφορών βάσει ογκομετρικού βάρους (για SPEEDEX και παρόμοιες)
      if (carrier.offersByWeight && packageDetails.volume && carrier.maxCubic === 0) {
        // Υπολογισμός ογκομετρικού βάρους (όγκος σε m³ * 200)
        const volumetricWeight = packageDetails.volume * 200;
        
        // Μόνο αν το ογκομετρικό βάρος είναι μεγαλύτερο από το πραγματικό
        if (volumetricWeight > (packageDetails.weight || 0)) {
          console.log(`${carrier.name}: Χρήση ογκομετρικού βάρους ${volumetricWeight}kg αντί για πραγματικό ${packageDetails.weight}kg`);
          
          // Αναζήτηση προσφορών βάρους που ισχύουν για το ογκομετρικό βάρος
          const weightOffers = state.offers.filter(
            offer => offer.carrierId === carrier.id && 
            offer.type === 'weight'
          );
          
          for (const offer of weightOffers) {
            if (offer.type === 'weight') {
              // Ελέγχουμε αν η ζώνη του ΤΚ είναι στις ζώνες της προσφοράς
              if (!offer.zoneNames.includes(postalCodeDetails.zone)) {
                continue;
              }
              
              // Ελέγχουμε το εύρος βάρους με το ογκομετρικό βάρος
              if (volumetricWeight < offer.minWeight || volumetricWeight > offer.maxWeight) {
                continue;
              }
              
              let cost = offer.baseCost;
              
              // Προσθήκη επιπλέον κόστους ανά κιλό αν υπάρχει
              if (offer.extraCostPerKg !== undefined) {
                const extraWeight = Math.max(0, volumetricWeight - offer.minWeight);
                cost += extraWeight * offer.extraCostPerKg;
              }
              
              // Προσθήκη επιπλέον κόστους για δυσπρόσιτη περιοχή αν υπάρχει
              if (isRemotePostalCode && offer.extraCostRemote !== undefined) {
                cost += offer.extraCostRemote;
              }
              
              console.log(`${carrier.name}: Προσφορά ογκομετρικού βάρους ${offer.id} - Κόστος: ${cost}€`);
              
              if (cost < minimumCost) {
                minimumCost = cost;
                selectedOffer = offer;
              }
            }
          }
        }
      }
      
      // Προσθήκη του αποτελέσματος στη λίστα μόνο αν βρέθηκε προσφορά
      if (selectedOffer && minimumCost !== Infinity) {
        // Πολλαπλασιάζουμε το κόστος με τον αριθμό των δεμάτων
        const totalCost = minimumCost * (packageDetails.packages || 1);
        
        let resultItem: CalculationResult = {
          carrierId: carrier.id,
          carrierName: carrier.name,
          cost: minimumCost,
          costWithVAT: minimumCost * 1.24, // Προσθήκη ΦΠΑ 24%
          suggestedPrice: minimumCost * 1.30, // Προτεινόμενη τιμή +30%
          actualWeight: packageDetails.weight || 0,
          volumetricWeight: (packageDetails.volume || 0) * 200, // Υπολογισμός ογκομετρικού βάρους
          allowsCashOnDelivery,
          isOptimal: false, // Θα οριστεί αργότερα
          offerType: selectedOffer.type,
          isRemote: isRemotePostalCode,
          offerId: selectedOffer.id,
          zoneName: postalCodeDetails.zone,
          deliveryTime: selectedOffer.type === 'zoneCubic' ? selectedOffer.deliveryTime : undefined,
          volume: packageDetails.volume || 0,
          packages: packageDetails.packages || 1,
          totalCost: totalCost,
          totalCostWithVAT: totalCost * 1.24
        };
        
        calculationResults.push(resultItem);
        console.log(`${carrier.name}: Προστέθηκε στα αποτελέσματα με κόστος ${totalCost}€`);
      } else {
        console.log(`${carrier.name}: Δεν βρέθηκε κατάλληλη προσφορά`);
      }
    });
    
    // Ταξινόμηση αποτελεσμάτων βάσει συνολικού κόστους (από το χαμηλότερο στο υψηλότερο)
    calculationResults.sort((a, b) => (a.totalCost || a.cost) - (b.totalCost || b.cost));
    
    // Ορισμός του πρώτου αποτελέσματος ως βέλτιστο
    if(calculationResults.length > 0) {
      calculationResults[0].isOptimal = true;
    }
    
    setResults(calculationResults);
    console.log(`Συνολικά αποτελέσματα: ${calculationResults.length}`);
    
    if (calculationResults.length === 0) {
      toast({
        title: "Πληροφορία",
        description: "Δεν βρέθηκαν διαθέσιμες μεταφορικές για το συγκεκριμένο πακέτο",
        variant: "default"
      });
    }
  };
  
  // Μετάβαση στο επόμενο βήμα
  const goToNextStep = () => {
    // Επικύρωση για κάθε βήμα
    if (currentStep === 1) {
      if (hasVolumeOrWeight === "") {
        toast({
          title: "Σφάλμα",
          description: "Παρακαλώ επιλέξτε αν γνωρίζετε τον συνολικό όγκο/βάρος",
          variant: "destructive"
        });
        return;
      }
      
      if (hasVolumeOrWeight === "yes") {
        if (totalShipment.packages < 1) {
          toast({
            title: "Σφάλμα",
            description: "Ο αριθμός των δεμάτων πρέπει να είναι τουλάχιστον 1",
            variant: "destructive"
          });
          return;
        }
        
        if (!totalShipment.totalVolume && !totalShipment.totalWeight) {
          toast({
            title: "Σφάλμα",
            description: "Παρακαλώ συμπληρώστε τουλάχιστον το συνολικό βάρος ή τον συνολικό όγκο",
            variant: "destructive"
          });
          return;
        }
        
        // Αν έχουμε συνολικό όγκο/βάρος, πηγαίνουμε κατευθείαν στο βήμα 3
        setCurrentStep(3);
        return;
      }
    } 
    else if (currentStep === 2) {
      // Επικύρωση πεδίων για κάθε πακέτο
      let isValid = true;
      let errorMessage = "";
      
      individualPackages.forEach((pkg, index) => {
        if (!pkg.weight || pkg.weight <= 0) {
          isValid = false;
          errorMessage = `Το βάρος για το πακέτο ${index + 1} πρέπει να είναι μεγαλύτερο από 0`;
        }
        
        if (!pkg.length || !pkg.width || !pkg.height || 
            pkg.length <= 0 || pkg.width <= 0 || pkg.height <= 0) {
          isValid = false;
          errorMessage = `Όλες οι διαστάσεις για το πακέτο ${index + 1} πρέπει να είναι μεγαλύτερες από 0`;
        }
      });
      
      if (!isValid) {
        toast({
          title: "Σφάλμα",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }
      
      // Υπολογισμός συνολικών τιμών από τα επιμέρους πακέτα
      const { totalVolume, totalWeight } = calculateTotals();
      setTotalShipment(prev => ({
        ...prev,
        totalVolume,
        totalWeight
      }));
    } 
    else if (currentStep === 3) {
      if (!shippingDetails.postalCode) {
        toast({
          title: "Σφάλμα",
          description: "Παρακαλώ επιλέξτε ταχυδρομικό κώδικα",
          variant: "destructive"
        });
        return;
      }
      
      if (availableAreas.length > 1 && !shippingDetails.area) {
        toast({
          title: "Σφάλμα",
          description: "Παρακαλώ επιλέξτε περιοχή",
          variant: "destructive"
        });
        return;
      }
      
      // Υπολογισμός τιμών πριν προχωρήσουμε στο βήμα 4
      calculatePrice();
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  // Μετάβαση στο προηγούμενο βήμα
  const goToPreviousStep = () => {
    if (currentStep === 3 && hasVolumeOrWeight === "yes") {
      setCurrentStep(1);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Επαναφορά της διαδικασίας
  const resetCalculator = () => {
    setCurrentStep(1);
    setHasVolumeOrWeight("");
    setTotalShipment({
      totalVolume: undefined,
      totalWeight: undefined,
      packages: 1
    });
    setIndividualPackages([{
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      volume: 0
    }]);
    setShippingDetails({
      postalCode: "",
      area: undefined
    });
    setResults([]);
    setAvailableAreas([]);
  };
  
  // Απόδοση των βημάτων
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Βήμα 1: Στοιχεία Αποστολής</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Γνωρίζετε τον συνολικό όγκο ή βάρος της αποστολής;</Label>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => setHasVolumeOrWeight("yes")}
                      variant={hasVolumeOrWeight === "yes" ? "default" : "outline"}
                      className="flex-1"
                    >
                      Ναι
                    </Button>
                    <Button 
                      onClick={() => setHasVolumeOrWeight("no")}
                      variant={hasVolumeOrWeight === "no" ? "default" : "outline"}
                      className="flex-1"
                    >
                      Όχι
                    </Button>
                  </div>
                </div>
                
                {hasVolumeOrWeight === "yes" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="packages">Αριθμός δεμάτων</Label>
                      <Input 
                        id="packages" 
                        type="number" 
                        min="1" 
                        step="1" 
                        value={totalShipment.packages}
                        onChange={(e) => setTotalShipment(prev => ({
                          ...prev,
                          packages: parseInt(e.target.value) || 1
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="totalVolume">Συνολικός όγκος (m³)</Label>
                      <Input 
                        id="totalVolume" 
                        type="number" 
                        min="0" 
                        step="0.001" 
                        value={totalShipment.totalVolume || ''}
                        onChange={(e) => setTotalShipment(prev => ({
                          ...prev,
                          totalVolume: parseFloat(e.target.value) || undefined
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="totalWeight">Συνολικό βάρος (kg)</Label>
                      <Input 
                        id="totalWeight" 
                        type="number" 
                        min="0" 
                        step="0.1" 
                        value={totalShipment.totalWeight || ''}
                        onChange={(e) => setTotalShipment(prev => ({
                          ...prev,
                          totalWeight: parseFloat(e.target.value) || undefined
                        }))}
                      />
                    </div>
                  </div>
                )}
                
                <div className="pt-4 flex justify-end">
                  <Button onClick={goToNextStep}>
                    Επόμενο βήμα
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Βήμα 2: Λεπτομέρειες Πακέτων</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="packageCount">Αριθμός δεμάτων</Label>
                  <Input 
                    id="packageCount" 
                    type="number" 
                    min="1" 
                    step="1" 
                    value={totalShipment.packages}
                    onChange={(e) => setTotalShipment(prev => ({
                      ...prev,
                      packages: parseInt(e.target.value) || 1
                    }))}
                  />
                </div>
                
                <div className="space-y-6 mt-4">
                  {individualPackages.map((pkg, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-md">
                      <h3 className="font-medium text-lg">Πακέτο {index + 1}</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`weight-${index}`}>Βάρος (kg)</Label>
                          <Input 
                            id={`weight-${index}`} 
                            type="number" 
                            min="0" 
                            step="0.1" 
                            value={pkg.weight || ''}
                            onChange={(e) => handlePackageChange(index, 'weight', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`volume-${index}`}>Όγκος (m³)</Label>
                          <Input 
                            id={`volume-${index}`} 
                            type="number" 
                            min="0" 
                            step="0.001" 
                            value={pkg.volume || ''}
                            readOnly
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Διαστάσεις (cm)</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.1" 
                              placeholder="Μήκος" 
                              value={pkg.length || ''}
                              onChange={(e) => handlePackageChange(index, 'length', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.1" 
                              placeholder="Πλάτος" 
                              value={pkg.width || ''}
                              onChange={(e) => handlePackageChange(index, 'width', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.1" 
                              placeholder="Ύψος" 
                              value={pkg.height || ''}
                              onChange={(e) => handlePackageChange(index, 'height', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={goToPreviousStep}>
                    Προηγούμενο
                  </Button>
                  <Button onClick={goToNextStep}>
                    Επόμενο βήμα
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Βήμα 3: Επιλογή Προορισμού</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Ταχυδρομικός Κώδικας</Label>
                  <Select 
                    value={shippingDetails.postalCode} 
                    onValueChange={(value) => setShippingDetails(prev => ({ ...prev, postalCode: value, area: undefined }))}
                  >
                    <SelectTrigger id="postalCode">
                      <SelectValue placeholder="Επιλέξτε Τ.Κ." />
                    </SelectTrigger>
                    <SelectContent>
                      {state.postalCodes
                        .filter((postal, index, self) => 
                          // Φιλτράρισμα για μοναδικούς ταχυδρομικούς κώδικες
                          self.findIndex(p => p.code === postal.code) === index
                        )
                        .map(pc => (
                          <SelectItem key={pc.code} value={pc.code}>
                            {pc.code} - {pc.city}
                            {pc.isRemote && " - ΔΥΣΠΡΟΣΙΤΗ"}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                
                {availableAreas.length > 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="area">Περιοχή</Label>
                    <Select 
                      value={shippingDetails.area} 
                      onValueChange={(value) => setShippingDetails(prev => ({ ...prev, area: value }))}
                    >
                      <SelectTrigger id="area">
                        <SelectValue placeholder="Επιλέξτε περιοχή" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAreas.map((area, index) => (
                          <SelectItem key={index} value={area.area}>
                            {area.area} - {area.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Εμφάνιση επιλεγμένης περιοχής αν υπάρχει μόνο μία */}
                {availableAreas.length === 1 && shippingDetails.area && (
                  <div className="p-3 rounded-md bg-muted">
                    <p className="text-sm">
                      Περιοχή: <span className="font-medium">{shippingDetails.area} - {availableAreas[0].city}</span>
                    </p>
                  </div>
                )}
                
                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={goToPreviousStep}>
                    Προηγούμενο
                  </Button>
                  <Button onClick={goToNextStep}>
                    Υπολογισμός Κόστους
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Βήμα 4: Αποτελέσματα Υπολογισμού</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.length === 0 ? (
                  <div className="text-center p-8 bg-muted rounded-md">
                    <p className="text-muted-foreground">
                      Δεν βρέθηκαν διαθέσιμες μεταφορικές για το συγκεκριμένο πακέτο
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <Card key={index} className={`overflow-hidden ${result.isOptimal ? 'border-2 border-primary' : ''}`}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {result.carrierName}
                              {result.isOptimal && (
                                <Badge variant="default" className="ml-2">Προτεινόμενο</Badge>
                              )}
                            </CardTitle>
                            <div className="text-2xl font-bold">
                              {result.totalCostWithVAT.toFixed(2)}€
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="details" className="w-full">
                            <TabsList className="w-full grid grid-cols-2">
                              <TabsTrigger value="details">Στοιχεία</TabsTrigger>
                              <TabsTrigger value="pricing">Ανάλυση κόστους</TabsTrigger>
                            </TabsList>
                            <TabsContent value="details" className="pt-4">
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>Χρεώσιμο βάρος:</div>
                                  <div className="text-right font-medium">
                                    {result.actualWeight > result.volumetricWeight 
                                      ? `${result.actualWeight.toFixed(1)} kg (πραγματικό)` 
                                      : `${result.volumetricWeight.toFixed(1)} kg (ογκομετρικό)`}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>Όγκος:</div>
                                  <div className="text-right font-medium">
                                    {result.volume.toFixed(3)} m³
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>Πλήθος δεμάτων:</div>
                                  <div className="text-right font-medium">
                                    {result.packages}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>Ζώνη:</div>
                                  <div className="text-right font-medium">
                                    {result.zoneName}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>Αντικαταβολή:</div>
                                  <div className="text-right font-medium">
                                    {result.allowsCashOnDelivery ? 'Ναι' : 'Όχι'}
                                  </div>
                                </div>
                                {result.isRemote && (
                                  <div className="text-destructive text-sm font-medium mt-2">
                                    Προσοχή: Δυσπρόσιτη περιοχή
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                            <TabsContent value="pricing" className="pt-4">
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>Τιμή μονάδας:</div>
                                  <div className="text-right font-medium">
                                    {result.cost.toFixed(2)}€
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>Συνολικό κόστος:</div>
                                  <div className="text-right font-medium">
                                    {result.totalCost.toFixed(2)}€
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>ΦΠΑ (24%):</div>
                                  <div className="text-right font-medium">
                                    {(result.totalCostWithVAT - result.totalCost).toFixed(2)}€
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm font-bold">
                                  <div>Τελική τιμή:</div>
                                  <div className="text-right">
                                    {result.totalCostWithVAT.toFixed(2)}€
                                  </div>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                    <div>Προτεινόμενη τιμή πώλησης (+30%):</div>
                                    <div className="text-right font-medium">
                                      {(result.totalCostWithVAT * 1.3).toFixed(2)}€
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={goToPreviousStep}>
                    Προηγούμενο
                  </Button>
                  <Button variant="outline" onClick={resetCalculator}>
                    Νέος υπολογισμός
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Υπολογισμός Κόστους Μεταφορικών</h1>
      {renderStep()}
    </div>
  );
};

export default ShippingCalculator;
