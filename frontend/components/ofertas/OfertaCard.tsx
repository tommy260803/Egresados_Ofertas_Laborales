import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, MapPin, DollarSign } from "lucide-react";
import { useOfertas } from "@/hooks/use-ofertas";

interface Oferta {
  id_oferta: number;
  titulo: string;
  ubicacion?: string;
  salario_minimo?: number;
  salario_maximo?: number;
  modalidad: string;
  empresa?: { razon_social: string };
}

interface OfertaCardProps {
  oferta: Oferta;
  showPostular?: boolean;
}

export function OfertaCard({ oferta, showPostular = false }: OfertaCardProps) {
  const { postular } = useOfertas();
  return (
    <Card className="border-white/10 bg-white/5 text-white shadow-lg shadow-black/10 backdrop-blur">
      <CardHeader>
        <CardTitle>{oferta.titulo}</CardTitle>
        <p className="text-sm text-slate-300">{oferta.empresa?.razon_social}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4" /> {oferta.ubicacion || "Remoto"}</div>
        <div className="flex items-center gap-2 text-sm"><DollarSign className="w-4 h-4" /> {oferta.salario_minimo} - {oferta.salario_maximo}</div>
        <div className="flex items-center gap-2 text-sm"><Building className="w-4 h-4" /> {oferta.modalidad}</div>
      </CardContent>
      {showPostular && (
        <CardFooter>
          <Button onClick={() => postular.mutate({ id_oferta: oferta.id_oferta })} disabled={postular.isLoading}>Postularme</Button>
        </CardFooter>
      )}
    </Card>
  );
}