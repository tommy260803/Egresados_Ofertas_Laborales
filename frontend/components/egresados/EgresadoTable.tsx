import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface Egresado {
  id_egresado: number;
  nombres: string;
  apellidos: string;
  usuario?: { email: string };
  carrera: string;
  ciudad: string;
}

interface EgresadoTableProps {
  data: Egresado[];
  isLoading: boolean;
  onDelete?: (id: number) => void;
}

export function EgresadoTable({ data, isLoading, onDelete }: EgresadoTableProps) {
  if (isLoading) return <div>Cargando...</div>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombres</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Carrera</TableHead>
          <TableHead>Ciudad</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-slate-400">
              No hay egresados para mostrar.
            </TableCell>
          </TableRow>
        ) : null}
        {data.map((egresado) => (
          <TableRow key={egresado.id_egresado}>
            <TableCell>{egresado.nombres} {egresado.apellidos}</TableCell>
            <TableCell>{egresado.usuario?.email}</TableCell>
            <TableCell>{egresado.carrera}</TableCell>
            <TableCell>{egresado.ciudad}</TableCell>
            <TableCell className="flex gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/admin/egresados/${egresado.id_egresado}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/admin/egresados/${egresado.id_egresado}/editar`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="text-red-600" onClick={() => onDelete?.(egresado.id_egresado)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}