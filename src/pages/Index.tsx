
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { TruckIcon, MapPinIcon, TagIcon, CalculatorIcon } from "lucide-react";

const Index = () => {
  return (
    <div className="flex flex-col space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">INDE SHIPPING Calculator</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Εργαλείο υπολογισμού εξόδων αποστολής για διάφορους μεταφορείς
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard
          title="Διαχείριση Μεταφορικών"
          description="Εισαγωγή και διαχείριση μεταφορικών εταιρειών και των περιορισμών τους"
          icon={<TruckIcon className="h-10 w-10" />}
          link="/carriers"
        />
        <FeatureCard
          title="Διαχείριση Ταχ. Κωδικών"
          description="Διαχείριση ταχυδρομικών κωδικών και αντιστοίχιση με περιοχές"
          icon={<MapPinIcon className="h-10 w-10" />}
          link="/postal-codes"
        />
        <FeatureCard
          title="Διαχείριση Προσφορών"
          description="Καταχώρηση προσφορών μεταφορικών βάσει βάρους ή όγκου"
          icon={<TagIcon className="h-10 w-10" />}
          link="/offers"
        />
        <FeatureCard
          title="Υπολογιστής Κόστους"
          description="Υπολογισμός βέλτιστου κόστους αποστολής για τα πακέτα σας"
          icon={<CalculatorIcon className="h-10 w-10" />}
          link="/calculator"
        />
      </div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const FeatureCard = ({ title, description, icon, link }: FeatureCardProps) => {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="min-h-[60px]">{description}</CardDescription>
        <Button asChild className="w-full">
          <Link to={link}>Μετάβαση</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default Index;
