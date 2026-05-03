import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { hash } from 'bcryptjs';
import { Usuario } from '../auth/entities/usuario.entity';
import { Administrador } from '../auth/entities/administrador.entity';
import { Egresado } from '../egresados/entities/egresado.entity';
import { Empresa } from '../ofertas/entities/empresa.entity';
import { Habilidad } from '../ofertas/entities/habilidad.entity';
import { OfertaLaboral } from '../ofertas/entities/oferta-laboral.entity';
import { Postulacion } from '../ofertas/entities/postulacion.entity';

type Rol = 'administrador' | 'egresado' | 'empresa';

const DEMO_PASSWORD = 'Demo123!';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'egresados_db',
  entities: [Usuario, Administrador, Egresado, Empresa, Habilidad, OfertaLaboral, Postulacion],
  synchronize: false,
});

async function upsertUsuario(rol: Rol, email: string, contrasena_hash: string) {
  const usuarioRepo = dataSource.getRepository(Usuario);
  const existing = await usuarioRepo.findOneBy({ email });
  const usuario = existing ?? usuarioRepo.create({ email, contrasena_hash, rol, activo: true });

  usuario.contrasena_hash = contrasena_hash;
  usuario.rol = rol;
  usuario.activo = true;

  return usuarioRepo.save(usuario);
}

async function upsertAdministrador(email: string, contrasena_hash: string) {
  const usuario = await upsertUsuario('administrador', email, contrasena_hash);
  const adminRepo = dataSource.getRepository(Administrador);
  const existing = await adminRepo.findOneBy({ id_administrador: usuario.id_usuario });
  const administrador = existing ?? adminRepo.create({ id_administrador: usuario.id_usuario, nombres: 'Ana', apellidos: 'Torres', nivel: 'supervisor' });

  administrador.id_administrador = usuario.id_usuario;
  administrador.nombres = 'Ana';
  administrador.apellidos = 'Torres';
  administrador.nivel = 'supervisor';

  await adminRepo.save(administrador);
}

async function upsertEgresado(email: string, contrasena_hash: string, nombres: string, apellidos: string, carrera: string, habilidades: Habilidad[]) {
  const usuario = await upsertUsuario('egresado', email, contrasena_hash);
  const egresadoRepo = dataSource.getRepository(Egresado);
  const existing = await egresadoRepo.findOneBy({ id_egresado: usuario.id_usuario });
  const egresado = existing ?? egresadoRepo.create({ id_egresado: usuario.id_usuario, nombres, apellidos, carrera });

  egresado.id_egresado = usuario.id_usuario;
  egresado.nombres = nombres;
  egresado.apellidos = apellidos;
  egresado.carrera = carrera;
  egresado.ciudad = 'Lima';
  egresado.universidad = 'Universidad Demo';
  egresado.anio_graduacion = 2024;
  egresado.perfil_laboral = 'Desarrollador junior con interes en backend y cloud.';

  egresado.habilidades = habilidades;

  await egresadoRepo.save(egresado);
  return egresado;
}

async function upsertEmpresa(email: string, contrasena_hash: string, razon_social: string, ruc: string, ofertas: OfertaLaboral[]) {
  const usuario = await upsertUsuario('empresa', email, contrasena_hash);
  const empresaRepo = dataSource.getRepository(Empresa);
  const existing = await empresaRepo.findOneBy({ id_empresa: usuario.id_usuario });
  const empresa = existing ?? empresaRepo.create({ id_empresa: usuario.id_usuario, razon_social, ruc });

  empresa.id_empresa = usuario.id_usuario;
  empresa.razon_social = razon_social;
  empresa.ruc = ruc;
  empresa.descripcion = 'Empresa de prueba para validar postulaciones y gestion de ofertas.';
  empresa.sector = 'Tecnologia';
  empresa.ciudad = 'Lima';
  empresa.email_contacto = email;
  empresa.telefono_contacto = '999888777';
  empresa.verificada = true;

  await empresaRepo.save(empresa);

  // Asignar la empresa a las ofertas y guardarlas
  for (const oferta of ofertas) {
    oferta.empresa = empresa;
    await dataSource.getRepository(OfertaLaboral).save(oferta);
  }

  return empresa;
}

async function main() {
  const hashedPassword = await hash(DEMO_PASSWORD, 10);
  await dataSource.initialize();

  // Crear habilidades
  const habilidadRepo = dataSource.getRepository(Habilidad);
  const habilidadesData = [
    { nombre_habilidad: 'JavaScript', descripcion: 'Lenguaje de programación para web', categoria: 'Frontend' },
    { nombre_habilidad: 'TypeScript', descripcion: 'Superset de JavaScript con tipado', categoria: 'Frontend' },
    { nombre_habilidad: 'React', descripcion: 'Librería para interfaces de usuario', categoria: 'Frontend' },
    { nombre_habilidad: 'Node.js', descripcion: 'Entorno de ejecución JavaScript', categoria: 'Backend' },
    { nombre_habilidad: 'Python', descripcion: 'Lenguaje de programación versátil', categoria: 'Backend' },
    { nombre_habilidad: 'SQL', descripcion: 'Lenguaje de consultas de bases de datos', categoria: 'Database' },
    { nombre_habilidad: 'Docker', descripcion: 'Contenedores de aplicaciones', categoria: 'DevOps' },
    { nombre_habilidad: 'Git', descripcion: 'Control de versiones', categoria: 'Tools' },
  ];

  const habilidades: Habilidad[] = [];
  for (const habData of habilidadesData) {
    let habilidad = await habilidadRepo.findOneBy({ nombre_habilidad: habData.nombre_habilidad });
    if (!habilidad) {
      habilidad = habilidadRepo.create(habData);
      await habilidadRepo.save(habilidad);
    }
    habilidades.push(habilidad);
  }

  // Crear ofertas laborales
  const ofertaRepo = dataSource.getRepository(OfertaLaboral);
  const ofertasEmpresa1: OfertaLaboral[] = [
    ofertaRepo.create({
      titulo: 'Desarrollador Frontend Junior',
      descripcion: 'Buscamos desarrollador frontend con experiencia en React y TypeScript.',
      modalidad: 'remoto',
      ubicacion: 'Lima',
      salario_minimo: 2500,
      salario_maximo: 3500,
      tipo_salario: 'mensual',
      jornada: 'completa',
      experiencia_requerida: '1-2 años',
      fecha_cierre: new Date('2026-06-01'),
      activa: true,
      habilidades: [habilidades[0], habilidades[1], habilidades[2]], // JavaScript, TypeScript, React
    }),
    ofertaRepo.create({
      titulo: 'Desarrollador Backend Junior',
      descripcion: 'Buscamos desarrollador backend con experiencia en Node.js y SQL.',
      modalidad: 'hibrido',
      ubicacion: 'Lima',
      salario_minimo: 3000,
      salario_maximo: 4000,
      tipo_salario: 'mensual',
      jornada: 'completa',
      experiencia_requerida: '1-2 años',
      fecha_cierre: new Date('2026-06-15'),
      activa: true,
      habilidades: [habilidades[0], habilidades[3], habilidades[5]], // JavaScript, Node.js, SQL
    }),
  ];

  const ofertasEmpresa2: OfertaLaboral[] = [
    ofertaRepo.create({
      titulo: 'Desarrollador Full Stack',
      descripcion: 'Buscamos desarrollador full stack con experiencia en React, Node.js y Python.',
      modalidad: 'remoto',
      ubicacion: 'Cualquier lugar',
      salario_minimo: 4000,
      salario_maximo: 5500,
      tipo_salario: 'mensual',
      jornada: 'completa',
      experiencia_requerida: '2-3 años',
      fecha_cierre: new Date('2026-07-01'),
      activa: true,
      habilidades: [habilidades[0], habilidades[1], habilidades[2], habilidades[3], habilidades[4]], // JavaScript, TypeScript, React, Node.js, Python
    }),
  ];

  // Crear administrador
  await upsertAdministrador('admin@demo.com', hashedPassword);

  // Crear egresados con habilidades
  await upsertEgresado('egresado@demo.com', hashedPassword, 'Luis', 'Ramirez', 'Ingenieria de Sistemas', [habilidades[0], habilidades[1], habilidades[2]]); // JavaScript, TypeScript, React
  await upsertEgresado('egresado2@demo.com', hashedPassword, 'Maria', 'Gonzalez', 'Ingenieria de Software', [habilidades[3], habilidades[4], habilidades[5]]); // Node.js, Python, SQL
  await upsertEgresado('egresado3@demo.com', hashedPassword, 'Carlos', 'Mendoza', 'Ingenieria de Sistemas', [habilidades[0], habilidades[3], habilidades[6]]); // JavaScript, Node.js, Docker

  // Crear empresas con ofertas
  await upsertEmpresa('empresa@demo.com', hashedPassword, 'Demo Tech SAC', '20123456789', ofertasEmpresa1);
  await upsertEmpresa('empresa2@demo.com', hashedPassword, 'Innovate Peru SAC', '20987654321', ofertasEmpresa2);

  console.log('Datos de prueba creados/actualizados:');
  console.log('\nUsuarios:');
  console.log('- admin@demo.com / Demo123! (administrador)');
  console.log('- egresado@demo.com / Demo123! (egresado)');
  console.log('- egresado2@demo.com / Demo123! (egresado)');
  console.log('- egresado3@demo.com / Demo123! (egresado)');
  console.log('- empresa@demo.com / Demo123! (empresa)');
  console.log('- empresa2@demo.com / Demo123! (empresa)');
  console.log('\nHabilidades creadas:', habilidades.map(h => h.nombre_habilidad).join(', '));
  console.log('\nOfertas laborales creadas: 3 (2 para empresa@demo.com, 1 para empresa2@demo.com)');
}

main()
  .catch((error) => {
    console.error('No se pudieron crear los usuarios de prueba:', error);
    process.exit(1);
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
