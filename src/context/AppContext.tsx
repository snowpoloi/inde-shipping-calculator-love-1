import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Carrier } from "@/types/Carrier";
import { PostalCode } from "@/types/PostalCode";
import { Offer } from "@/types/Offer";

interface AppState {
  carriers: Carrier[];
  postalCodes: PostalCode[];
  offers: Offer[];
  zones: string[]; // Προσθήκη ζωνών ως ξεχωριστό πεδίο
}

interface AppContextType {
  state: AppState;
  addCarrier: (carrier: Carrier) => void;
  updateCarrier: (carrier: Carrier) => void;
  deleteCarrier: (id: string) => void;
  addPostalCode: (postalCode: PostalCode) => void;
  updatePostalCode: (postalCode: PostalCode) => void;
  deletePostalCode: (id: string) => void;
  addOffer: (offer: Offer) => void;
  updateOffer: (offer: Offer) => void;
  deleteOffer: (id: string) => void;
  updateCarrierPostalCodes: (carrierId: string, postalCodes: string[], type: 'service' | 'remote' | 'noAntiCash') => void;
  addZone: (zone: string) => void;
  updateZone: (oldZone: string, newZone: string) => void;
  deleteZone: (zone: string) => void;
}

// Αρχικές ζώνες - Τώρα ορίζονται ανεξάρτητα
const initialZones = [
  "ΑΘΗΝΑ", 
  "ΘΕΣΣΑΛΟΝΙΚΗ", 
  "ΧΕΡΣΑΙΟΙ ΠΡΟΟΡΙΣΜΟΙ", 
  "ΝΗΣΙΩΤΙΚΟΙ ΠΡΟΟΡΙΣΜΟΙ", 
  "ΚΕΝΤΡΙΚΗ ΕΛΛΑΔΑ", 
  "ΝΗΣΙΑ", 
  "ΝΗΣΙΑ 2"
];

const initialCarriers: Carrier[] = [
  {
    id: "1",
    name: "MYTRANS",
    maxLength: 100,
    maxWidth: 120,
    maxHeight: 60,
    maxWeight: 30,
    maxCubic: 0.5,
    offersByWeight: true,
    offersByCubic: false,
    servicedPostalCodes: ["10431", "10432", "10434"],
    remotePostalCodes: ["74100", "73100"],
    noAntiCashPostalCodes: ["85100"],
    serviceZones: ["ΑΘΗΝΑ", "ΧΕΡΣΑΙΟΙ ΠΡΟΟΡΙΣΜΟΙ"]
  },
  {
    id: "2",
    name: "SPEEDEX",
    maxLength: 120,
    maxWidth: 120,
    maxHeight: 80,
    maxWeight: 50,
    maxCubic: 0, // 0 σημαίνει ότι δεν υπάρχει όριο, χρεώνει με βάρος ή ογκομετρικό
    offersByWeight: true,
    offersByCubic: true,
    servicedPostalCodes: ["10431", "54622", "26442"],
    remotePostalCodes: [],
    noAntiCashPostalCodes: [],
    serviceZones: ["ΧΕΡΣΑΙΟΙ ΠΡΟΟΡΙΣΜΟΙ", "ΝΗΣΙΩΤΙΚΟΙ ΠΡΟΟΡΙΣΜΟΙ", "ΑΘΗΝΑ"]
  }
];

const initialPostalCodes: PostalCode[] = [
  {
    id: "1",
    code: "10431",
    county: "Αττικής",
    city: "Αθήνα",
    area: "Κυψέλη",
    zone: "ΑΘΗΝΑ"
  },
  {
    id: "2",
    code: "54622",
    county: "Θεσσαλονίκης",
    city: "Θεσσαλονίκη",
    area: "Κέντρο",
    zone: "ΘΕΣΣΑΛΟΝΙΚΗ"
  },
  {
    id: "3",
    code: "26442",
    county: "Αχαΐας",
    city: "Πάτρα",
    area: "Κέντρο",
    zone: "ΚΕΝΤΡΙΚΗ ΕΛΛΑΔΑ"
  },
  {
    id: "4",
    code: "74100",
    county: "Ρεθύμνου",
    city: "Ρέθυμνο",
    area: "Κέντρο",
    zone: "ΝΗΣΙΑ",
    isRemote: true
  },
  {
    id: "5",
    code: "73100",
    county: "Χανίων",
    city: "Χανιά",
    area: "Κέντρο",
    zone: "ΝΗΣΙΑ",
    isRemote: true
  },
  {
    id: "6",
    code: "85100",
    county: "Δωδεκανήσου",
    city: "Ρόδος",
    area: "Κέντρο",
    zone: "ΝΗΣΙΑ 2"
  },
  {
    id: "7",
    code: "10432",
    county: "Αττικής",
    city: "Αθήνα",
    area: "Κυψέλη",
    zone: "ΑΘΗΝΑ"
  },
  {
    id: "8",
    code: "10434",
    county: "ΑΤΤΙΚΗΣ",
    city: "Αθήνα",
    area: "Γέρακας",
    zone: "ΑΘΗΝΑ"
  }
];

const initialOffers: Offer[] = [
  {
    id: "1",
    type: "weight",
    carrierId: "1",
    minWeight: 0,
    maxWeight: 15,
    baseCost: 5,
    extraCostPerKg: undefined,
    extraCostRemote: 2,
    zoneNames: ["ΑΘΗΝΑ"]
  },
  {
    id: "2",
    type: "weight",
    carrierId: "1",
    minWeight: 5,
    maxWeight: 20,
    baseCost: 8,
    extraCostPerKg: 1,
    extraCostRemote: 3,
    zoneNames: ["ΧΕΡΣΑΙΟΙ ΠΡΟΟΡΙΣΜΟΙ"]
  },
  {
    id: "3",
    type: "zoneCubic",
    carrierId: "2",
    zoneId: "z1",
    zoneName: "ΑΘΗΝΑ",
    minCharge: 7,
    cubicRate: 300,
    deliveryTime: "24-48 ώρες",
    minCubicVolume: 0.12,
    zoneNames: ["ΑΘΗΝΑ"]
  },
  {
    id: "4",
    type: "weight",
    carrierId: "2",
    minWeight: 0,
    maxWeight: 20,
    baseCost: 6,
    extraCostPerKg: 0.5,
    extraCostRemote: undefined,
    zoneNames: ["ΧΕΡΣΑΙΟΙ ΠΡΟΟΡΙΣΜΟΙ", "ΝΗΣΙΩΤΙΚΟΙ ΠΡΟΟΡΙΣΜΟΙ", "ΑΘΗΝΑ"]
  }
];

const defaultInitialState: AppState = {
  carriers: initialCarriers,
  postalCodes: initialPostalCodes,
  offers: initialOffers,
  zones: initialZones // Χρησιμοποιούμε τώρα την ανεξάρτητη λίστα ζωνών
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loadInitialState = (): AppState => {
    try {
      const savedState = localStorage.getItem("appState");
      
      // Αν δεν υπάρχει αποθηκευμένη κατάσταση ή είναι κενή, επιστρέφουμε την προεπιλεγμένη
      if (!savedState) {
        console.log("No saved state found, using default initial state");
        return defaultInitialState;
      }
      
      const parsedState = JSON.parse(savedState);
      
      // Βεβαιωνόμαστε ότι όλα τα πεδία υπάρχουν
      const state = {
        carriers: parsedState.carriers || defaultInitialState.carriers,
        postalCodes: parsedState.postalCodes || defaultInitialState.postalCodes,
        offers: parsedState.offers || defaultInitialState.offers,
        zones: parsedState.zones || defaultInitialState.zones
      };
      
      // Έλεγχος για κενά arrays
      state.carriers = state.carriers.map(carrier => {
        // Αν κάποιο από τα array properties είναι undefined ή null, το αντικαθιστούμε με κενό array
        return {
          ...carrier,
          servicedPostalCodes: carrier.servicedPostalCodes || [],
          remotePostalCodes: carrier.remotePostalCodes || [],
          noAntiCashPostalCodes: carrier.noAntiCashPostalCodes || [],
          serviceZones: carrier.serviceZones || []
        };
      });
      
      return state;
    } catch (error) {
      console.error("Error loading state from localStorage:", error);
      return defaultInitialState;
    }
  };

  const [state, setState] = useState<AppState>(loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem("appState", JSON.stringify(state));
    } catch (error) {
      console.error("Error saving state to localStorage:", error);
    }
  }, [state]);

  const addCarrier = (carrier: Carrier) => {
    const newCarrier = {
      ...carrier,
      id: carrier.id || Date.now().toString(),
      // Ensure empty arrays have defaults
      servicedPostalCodes: carrier.servicedPostalCodes || [],
      remotePostalCodes: carrier.remotePostalCodes || [],
      noAntiCashPostalCodes: carrier.noAntiCashPostalCodes || [],
      serviceZones: carrier.serviceZones || []
    };
    setState(prevState => {
      return {
        ...prevState,
        carriers: [...prevState.carriers, newCarrier]
      };
    });
  };

  const updateCarrier = (carrier: Carrier) => {
    setState(prevState => {
      const updatedCarrier = {
        ...carrier,
        // Ensure arrays are always defined
        servicedPostalCodes: carrier.servicedPostalCodes || [],
        remotePostalCodes: carrier.remotePostalCodes || [],
        noAntiCashPostalCodes: carrier.noAntiCashPostalCodes || [],
        serviceZones: carrier.serviceZones || []
      };
      
      return {
        ...prevState,
        carriers: prevState.carriers.map(c => c.id === carrier.id ? updatedCarrier : c)
      };
    });
  };

  const deleteCarrier = (id: string) => {
    setState(prevState => {
      const updatedCarriers = prevState.carriers.filter(c => c.id !== id);
      
      return {
        ...prevState,
        carriers: updatedCarriers,
        offers: prevState.offers.filter(o => o.carrierId !== id)
      };
    });
  };

  const addPostalCode = (postalCode: PostalCode) => {
    const newPostalCode = {
      ...postalCode,
      id: postalCode.id || Date.now().toString(),
    };
    setState(prevState => ({
      ...prevState,
      postalCodes: [...prevState.postalCodes, newPostalCode]
    }));
  };

  const updatePostalCode = (postalCode: PostalCode) => {
    setState(prevState => ({
      ...prevState,
      postalCodes: prevState.postalCodes.map(pc => pc.id === postalCode.id ? postalCode : pc)
    }));
  };

  const deletePostalCode = (id: string) => {
    setState(prevState => ({
      ...prevState,
      postalCodes: prevState.postalCodes.filter(pc => pc.id !== id)
    }));
  };

  const addOffer = (offer: Offer) => {
    const newOffer = {
      ...offer,
      id: offer.id || Date.now().toString(),
    };
    setState(prevState => ({
      ...prevState,
      offers: [...prevState.offers, newOffer]
    }));
  };

  const updateOffer = (offer: Offer) => {
    setState(prevState => ({
      ...prevState,
      offers: prevState.offers.map(o => o.id === offer.id ? offer : o)
    }));
  };

  const deleteOffer = (id: string) => {
    setState(prevState => ({
      ...prevState,
      offers: prevState.offers.filter(o => o.id !== id)
    }));
  };

  const updateCarrierPostalCodes = (
    carrierId: string, 
    postalCodes: string[], 
    type: 'service' | 'remote' | 'noAntiCash'
  ) => {
    setState(prevState => ({
      ...prevState,
      carriers: prevState.carriers.map(carrier => {
        if (carrier.id === carrierId) {
          const updatedCarrier = { ...carrier };
          
          if (type === 'service') {
            updatedCarrier.servicedPostalCodes = postalCodes;
          } else if (type === 'remote') {
            updatedCarrier.remotePostalCodes = postalCodes;
          } else if (type === 'noAntiCash') {
            updatedCarrier.noAntiCashPostalCodes = postalCodes;
          }
          
          return updatedCarrier;
        }
        return carrier;
      })
    }));
  };
  
  // Ανανεωμένες λειτουργίες για διαχείριση ζωνών
  const addZone = (zone: string) => {
    if (!state.zones?.includes(zone)) {
      setState(prevState => ({
        ...prevState,
        zones: [...(prevState.zones || []), zone]
      }));
    }
  };
  
  const updateZone = (oldZone: string, newZone: string) => {
    if (oldZone === newZone) return;
    
    setState(prevState => {
      // Ενημέρωση των ζωνών στις μεταφορικές
      const updatedCarriers = prevState.carriers.map(carrier => {
        const updatedServiceZones = carrier.serviceZones?.map(zone => 
          zone === oldZone ? newZone : zone
        ) || [];
        
        return {
          ...carrier,
          serviceZones: updatedServiceZones
        };
      });
      
      // Ενημέρωση των ζωνών στους ταχυδρομικούς κώδικες
      const updatedPostalCodes = prevState.postalCodes.map(pc => {
        if (pc.zone === oldZone) {
          return {
            ...pc,
            zone: newZone
          };
        }
        return pc;
      });
      
      // Ενημέρωση των ζωνών στις προσφορές
      const updatedOffers = prevState.offers.map(offer => {
        if (offer.type === 'weight' && offer.zoneNames) {
          return {
            ...offer,
            zoneNames: offer.zoneNames.map(zone => zone === oldZone ? newZone : zone)
          };
        } else if (offer.type === 'zoneCubic' && offer.zoneName === oldZone) {
          return {
            ...offer,
            zoneName: newZone
          };
        }
        return offer;
      });
      
      // Ενημέρωση της λίστας των ζωνών
      const updatedZones = (prevState.zones || []).map(zone => 
        zone === oldZone ? newZone : zone
      );
      
      return {
        ...prevState,
        carriers: updatedCarriers,
        postalCodes: updatedPostalCodes,
        offers: updatedOffers,
        zones: updatedZones
      };
    });
  };
  
  const deleteZone = (zone: string) => {
    setState(prevState => {
      // Αφαίρεση της ζώνης από τις μεταφορικές
      const updatedCarriers = prevState.carriers.map(carrier => {
        const filteredZones = carrier.serviceZones?.filter(z => z !== zone) || [];
        
        return {
          ...carrier,
          serviceZones: filteredZones
        };
      });
      
      // Αφαίρεση των προσφορών που σχετίζονται με την ζώνη
      const updatedOffers = prevState.offers.filter(offer => {
        if (offer.type === 'weight' && offer.zoneNames) {
          // Αν η προσφορά έχει και άλλες ζώνες, αφαιρούμε αυτή τη ζώνη μόνο
          const filteredZones = offer.zoneNames.filter(z => z !== zone);
          // Αν η προσφορά έχει μόνο αυτή τη ζώνη, την αφαιρούμε εντελώς
          if (filteredZones.length === 0) return false;
          
          offer.zoneNames = filteredZones;
          return true;
        } else if (offer.type === 'zoneCubic' && offer.zoneName === zone) {
          // Αν είναι προσφορά zoneCubic με αυτή τη ζώνη, την αφαιρούμε εντελώς
          return false;
        }
        return true;
      });
      
      // Ενημέρωση της λίστας των ζωνών - αφαιρούμε μόνο τη συγκεκριμένη ζώνη
      const updatedZones = (prevState.zones || []).filter(z => z !== zone);
      
      return {
        ...prevState,
        carriers: updatedCarriers,
        offers: updatedOffers,
        zones: updatedZones
      };
    });
  };

  const contextValue: AppContextType = {
    state,
    addCarrier,
    updateCarrier,
    deleteCarrier,
    addPostalCode,
    updatePostalCode,
    deletePostalCode,
    addOffer,
    updateOffer,
    deleteOffer,
    updateCarrierPostalCodes,
    addZone,
    updateZone,
    deleteZone
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
