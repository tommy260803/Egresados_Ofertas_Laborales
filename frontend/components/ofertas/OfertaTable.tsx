import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function OfertaTable({ data, isLoading }: { data: any[]; isLoading: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Modalidad</TableHead>
          <TableHead>Salario</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((oferta) => (
          <TableRow key={oferta.id_oferta}>
            <TableCell>{oferta.titulo}</TableCell>
            <TableCell>{oferta.empresa?.razon_social}</TableCell>
            <TableCell>{oferta.modalidad}</TableCell>
            <TableCell>{oferta.salario_minimo} - {oferta.salario_maximo}</TableCell>
            <TableCell><Badge variant={oferta.activa ? "default" : "secondary"}>{oferta.activa ? "Activa" : "Cerrada"}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}