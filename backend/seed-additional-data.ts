import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { hash } from 'bcryptjs';
import { Usuario } from './src/auth/entities/usuario.entity';
import { Administrador } from './src/auth/entities/administrador.entity';
import { Egresado } from './src/egresados/entities/egresado.entity';
import { Empresa } from './src/ofertas/entities/empresa.entity';
import { Habilidad } from './src/ofertas/entities/habilidad.entity';
import { OfertaLaboral } from './src/ofertas/entities/oferta-laboral.entity';
import { Postulacion } from './src/ofertas/entities/postulacion.entity';

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

interface CreateEgresadoResult {
  success: boolean;
  email: string;
  message: string;
  egresado?: Egresado;
}

interface CreateOfertaResult {
  success: boolean;
  titulo: string;
  message: string;
  oferta?: OfertaLaboral;
}

interface CreatePostulacionResult {
  success: boolean;
  message: string;
  postulacion?: Postulacion;
}

// Generar fecha aleatoria en los últimos 12 meses
function getRandomDateInLast12Months(): Date {
  const today = new Date(2026, 4, 4); // 4 de mayo de 2026
  const last12Months = new Date(today);
  last12Months.setFullYear(last12Months.getFullYear() - 1);

  const randomTime = Math.random() * (today.getTime() - last12Months.getTime());
  return new Date(last12Months.getTime() + randomTime);
}

// Estados posibles para postulaciones
const ESTADOS_POSTULACION = [
  'postulado',
  'revisado',
  'preseleccionado',
  'entrevista',
  'rechazado',
  'contratado'
];

function getRandomEstado(): string {
  return ESTADOS_POSTULACION[Math.floor(Math.random() * ESTADOS_POSTULACION.length)];
}

async function createNuevoEgresado(
  usuarioRepo: any,
  egresadoRepo: any,
  habilidadRepo: any,
  datos: {
    nombres: string;
    apellidos: string;
    email: string;
    carrera: string;
    ciudad: string;
    universidad: string;
    anio_graduacion: number;
    habilidades: string[];
  }
): Promise<CreateEgresadoResult> {
  try {
    // Verificar si el email ya existe
    const usuarioExistente = await usuarioRepo.findOneBy({ email: datos.email });
    if (usuarioExistente) {
      return {
        success: false,
        email: datos.email,
        message: `❌ Email ya existe: ${datos.email}`,
      };
    }

    // Crear usuario
    const hashedPassword = await hash(DEMO_PASSWORD, 10);
    const usuario = usuarioRepo.create({
      email: datos.email,
      contrasena_hash: hashedPassword,
      rol: 'egresado',
      activo: true,
    });
    const usuarioGuardado = await usuarioRepo.save(usuario);

    // Obtener habilidades
    const habilidadesDelEgresado: Habilidad[] = [];
    for (const nombreHabilidad of datos.habilidades) {
      const habilidad = await habilidadRepo.findOneBy({ nombre_habilidad: nombreHabilidad });
      if (habilidad) {
        habilidadesDelEgresado.push(habilidad);
      }
    }

    // Crear egresado
    const egresado = egresadoRepo.create({
      id_egresado: usuarioGuardado.id_usuario,
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      carrera: datos.carrera,
      ciudad: datos.ciudad,
      universidad: datos.universidad,
      anio_graduacion: datos.anio_graduacion,
      perfil_laboral: `Profesional con especialidad en ${datos.carrera}`,
      telefono: '999' + Math.floor(Math.random() * 9000000 + 1000000),
      habilidades: habilidadesDelEgresado,
    });

    const egresadoGuardado = await egresadoRepo.save(egresado);
    return {
      success: true,
      email: datos.email,
      message: `✅ Egresado creado: ${datos.nombres} ${datos.apellidos} (${habilidadesDelEgresado.length} habilidades)`,
      egresado: egresadoGuardado,
    };
  } catch (error: any) {
    return {
      success: false,
      email: datos.email,
      message: `❌ Error al crear egresado: ${error.message}`,
    };
  }
}

async function createNuevaOferta(
  ofertaRepo: any,
  empresaRepo: any,
  habilidadRepo: any,
  datos: {
    titulo: string;
    descripcion: string;
    empresa_id: number;
    modalidad: 'presencial' | 'remoto' | 'hibrido';
    ubicacion: string;
    salario_minimo: number;
    salario_maximo: number;
    experiencia_requerida: string;
    habilidades: string[];
    fechaPublicacion: Date;
  }
): Promise<CreateOfertaResult> {
  try {
    // Verificar que la empresa existe
    const empresa = await empresaRepo.findOneBy({ id_empresa: datos.empresa_id });
    if (!empresa) {
      return {
        success: false,
        titulo: datos.titulo,
        message: `❌ Empresa con ID ${datos.empresa_id} no existe`,
      };
    }

    // Obtener habilidades
    const habilidadesDeLaOferta: Habilidad[] = [];
    for (const nombreHabilidad of datos.habilidades) {
      const habilidad = await habilidadRepo.findOneBy({ nombre_habilidad: nombreHabilidad });
      if (habilidad) {
        habilidadesDeLaOferta.push(habilidad);
      }
    }

    // Crear oferta
    const fechaCierre = new Date(datos.fechaPublicacion);
    fechaCierre.setDate(fechaCierre.getDate() + 60); // 60 días después de la publicación

    const oferta = ofertaRepo.create({
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      empresa,
      modalidad: datos.modalidad,
      ubicacion: datos.ubicacion,
      salario_minimo: datos.salario_minimo,
      salario_maximo: datos.salario_maximo,
      tipo_salario: 'mensual',
      jornada: 'completa',
      experiencia_requerida: datos.experiencia_requerida,
      fecha_publicacion: datos.fechaPublicacion,
      fecha_cierre: fechaCierre,
      activa: new Date() < fechaCierre,
      habilidades: habilidadesDeLaOferta,
    });

    const ofertaGuardada = await ofertaRepo.save(oferta);
    return {
      success: true,
      titulo: datos.titulo,
      message: `✅ Oferta creada: ${datos.titulo} (${habilidadesDeLaOferta.length} habilidades)`,
      oferta: ofertaGuardada,
    };
  } catch (error: any) {
    return {
      success: false,
      titulo: datos.titulo,
      message: `❌ Error al crear oferta: ${error.message}`,
    };
  }
}

async function createPostulacion(
  postulacionRepo: any,
  egresadoRepo: any,
  ofertaRepo: any,
  egresado_id: number,
  oferta_id: number,
  fechaPostulacion: Date
): Promise<CreatePostulacionResult> {
  try {
    // Verificar que egresado y oferta existen
    const egresado = await egresadoRepo.findOneBy({ id_egresado: egresado_id });
    if (!egresado) {
      return {
        success: false,
        message: `❌ Egresado con ID ${egresado_id} no existe`,
      };
    }

    const oferta = await ofertaRepo.findOneBy({ id_oferta: oferta_id });
    if (!oferta) {
      return {
        success: false,
        message: `❌ Oferta con ID ${oferta_id} no existe`,
      };
    }

    // Verificar que la postulación no exista ya
    const postulacionExistente = await postulacionRepo.findOneBy({
      egresado: { id_egresado: egresado_id },
      oferta: { id_oferta: oferta_id },
    });

    if (postulacionExistente) {
      return {
        success: false,
        message: `⚠️  Ya existe una postulación de ${egresado.nombres} a ${oferta.titulo}`,
      };
    }

    // Verificar que la fecha de postulación sea posterior a la publicación de la oferta
    if (fechaPostulacion < oferta.fecha_publicacion) {
      return {
        success: false,
        message: `⚠️  Fecha de postulación anterior a publicación de oferta (${oferta.titulo})`,
      };
    }

    // Crear postulación
    const postulacion = postulacionRepo.create({
      egresado,
      oferta,
      estado_actual: getRandomEstado(),
      fecha_postulacion: fechaPostulacion,
      mensaje: `Interesado/a en la posición de ${oferta.titulo}`,
    });

    const postulacionGuardada = await postulacionRepo.save(postulacion);
    return {
      success: true,
      message: `✅ Postulación creada: ${egresado.nombres} → ${oferta.titulo}`,
      postulacion: postulacionGuardada,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Error al crear postulación: ${error.message}`,
    };
  }
}

async function main() {
  await dataSource.initialize();

  const usuarioRepo = dataSource.getRepository(Usuario);
  const egresadoRepo = dataSource.getRepository(Egresado);
  const empresaRepo = dataSource.getRepository(Empresa);
  const habilidadRepo = dataSource.getRepository(Habilidad);
  const ofertaRepo = dataSource.getRepository(OfertaLaboral);
  const postulacionRepo = dataSource.getRepository(Postulacion);

  console.log('🚀 INICIANDO SEEDING DE DATOS ADICIONALES\n');

  // ============ NUEVOS EGRESADOS ============
  console.log('📝 CREANDO 10 NUEVOS EGRESADOS...\n');

  const nuevosEgresados = [
    {
      nombres: 'Juan',
      apellidos: 'Pérez López',
      email: 'test_egresado_1@mail.com',
      carrera: 'Ingeniería de Sistemas',
      ciudad: 'Lima',
      universidad: 'Universidad Nacional de Ingeniería',
      anio_graduacion: 2024,
      habilidades: ['JavaScript', 'React', 'Node.js'],
    },
    {
      nombres: 'María',
      apellidos: 'Rodríguez García',
      email: 'test_egresado_2@mail.com',
      carrera: 'Ingeniería de Software',
      ciudad: 'Arequipa',
      universidad: 'Universidad Católica de Santa María',
      anio_graduacion: 2023,
      habilidades: ['Python', 'SQL', 'Docker'],
    },
    {
      nombres: 'Carlos',
      apellidos: 'Martínez Ruiz',
      email: 'test_egresado_3@mail.com',
      carrera: 'Ingeniería en Computación',
      ciudad: 'Cusco',
      universidad: 'Universidad Nacional San Antonio Abad',
      anio_graduacion: 2024,
      habilidades: ['Java', 'SQL', 'Git'],
    },
    {
      nombres: 'Ana',
      apellidos: 'González López',
      email: 'test_egresado_4@mail.com',
      carrera: 'Ingeniería de Sistemas',
      ciudad: 'Trujillo',
      universidad: 'Universidad Privada del Norte',
      anio_graduacion: 2023,
      habilidades: ['TypeScript', 'React', 'Docker'],
    },
    {
      nombres: 'David',
      apellidos: 'Flores Silva',
      email: 'test_egresado_5@mail.com',
      carrera: 'Ingeniería de Telecomunicaciones',
      ciudad: 'Chiclayo',
      universidad: 'Universidad de Lambayeque',
      anio_graduacion: 2024,
      habilidades: ['Python', 'Node.js', 'Docker'],
    },
    {
      nombres: 'Sofía',
      apellidos: 'Vega Morales',
      email: 'test_egresado_6@mail.com',
      carrera: 'Ingeniería Informática',
      ciudad: 'Ica',
      universidad: 'Universidad Regional de Ica',
      anio_graduacion: 2023,
      habilidades: ['React', 'Node.js', 'Git'],
    },
    {
      nombres: 'Luis',
      apellidos: 'Torres Cabrera',
      email: 'test_egresado_7@mail.com',
      carrera: 'Ingeniería de Sistemas',
      ciudad: 'Puno',
      universidad: 'Universidad Nacional del Altiplano',
      anio_graduacion: 2024,
      habilidades: ['JavaScript', 'Python', 'SQL'],
    },
    {
      nombres: 'Paola',
      apellidos: 'Bravo Muñoz',
      email: 'test_egresado_8@mail.com',
      carrera: 'Ingeniería de Software',
      ciudad: 'Ayacucho',
      universidad: 'Universidad Nacional de San Cristóbal de Huamanga',
      anio_graduacion: 2023,
      habilidades: ['TypeScript', 'React', 'Node.js'],
    },
    {
      nombres: 'Javier',
      apellidos: 'Mendez Acosta',
      email: 'test_egresado_9@mail.com',
      carrera: 'Ingeniería en Sistemas Computacionales',
      ciudad: 'Tacna',
      universidad: 'Universidad Privada de Tacna',
      anio_graduacion: 2024,
      habilidades: ['Python', 'Docker', 'Git'],
    },
    {
      nombres: 'Claudia',
      apellidos: 'Jiménez Rojas',
      email: 'test_egresado_10@mail.com',
      carrera: 'Ingeniería de Sistemas',
      ciudad: 'Moquegua',
      universidad: 'Universidad José Carlos Mariátegui',
      anio_graduacion: 2023,
      habilidades: ['JavaScript', 'SQL', 'Docker'],
    },
  ];

  const egresadosCreados: Egresado[] = [];
  for (const egresadoData of nuevosEgresados) {
    const result = await createNuevoEgresado(usuarioRepo, egresadoRepo, habilidadRepo, egresadoData);
    console.log(result.message);
    if (result.success && result.egresado) {
      egresadosCreados.push(result.egresado);
    }
  }

  // ============ NUEVAS OFERTAS ============
  console.log('\n💼 CREANDO 5 NUEVAS OFERTAS...\n');

  // Obtener empresas existentes
  const empresas = await empresaRepo.find();
  if (empresas.length === 0) {
    console.log('❌ No hay empresas para crear ofertas');
    return;
  }

  const nuevasOfertas = [
    {
      titulo: 'Desarrollador Python Senior',
      descripcion: 'Buscamos desarrollador Python senior con experiencia en proyectos grandes.',
      empresa_id: empresas[0].id_empresa,
      modalidad: 'hibrido' as const,
      ubicacion: 'Lima',
      salario_minimo: 5000,
      salario_maximo: 7000,
      experiencia_requerida: '5+ años',
      habilidades: ['Python', 'SQL', 'Docker'],
      fechaPublicacion: new Date('2025-05-15'),
    },
    {
      titulo: 'Especialista en Frontend React',
      descripcion: 'Requierimos especialista frontend con fuerte experiencia en React y TypeScript.',
      empresa_id: empresas[empresas.length > 1 ? 1 : 0].id_empresa,
      modalidad: 'remoto' as const,
      ubicacion: 'Remoto',
      salario_minimo: 4500,
      salario_maximo: 6500,
      experiencia_requerida: '3-4 años',
      habilidades: ['React', 'TypeScript', 'Git'],
      fechaPublicacion: new Date('2025-08-20'),
    },
    {
      titulo: 'DevOps Engineer',
      descripcion: 'Se busca DevOps engineer para gestionar infraestructura cloud y CI/CD.',
      empresa_id: empresas[0].id_empresa,
      modalidad: 'presencial' as const,
      ubicacion: 'Lima',
      salario_minimo: 4800,
      salario_maximo: 6800,
      experiencia_requerida: '3-5 años',
      habilidades: ['Docker', 'Git', 'Python'],
      fechaPublicacion: new Date('2025-11-10'),
    },
    {
      titulo: 'Data Engineer Junior',
      descripcion: 'Buscamos Data Engineer junior con conocimientos en SQL y Python.',
      empresa_id: empresas[empresas.length > 1 ? 1 : 0].id_empresa,
      modalidad: 'hibrido' as const,
      ubicacion: 'Lima',
      salario_minimo: 3500,
      salario_maximo: 5000,
      experiencia_requerida: '1-2 años',
      habilidades: ['Python', 'SQL', 'Git'],
      fechaPublicacion: new Date('2026-01-15'),
    },
    {
      titulo: 'Full Stack Developer',
      descripcion: 'Desarrollador Full Stack con experiencia en JavaScript/TypeScript y Node.js.',
      empresa_id: empresas[0].id_empresa,
      modalidad: 'remoto' as const,
      ubicacion: 'Remoto',
      salario_minimo: 4200,
      salario_maximo: 6200,
      experiencia_requerida: '2-3 años',
      habilidades: ['JavaScript', 'Node.js', 'React'],
      fechaPublicacion: new Date('2026-02-20'),
    },
  ];

  const ofertasCreadas: OfertaLaboral[] = [];
  for (const ofertaData of nuevasOfertas) {
    const result = await createNuevaOferta(ofertaRepo, empresaRepo, habilidadRepo, ofertaData);
    console.log(result.message);
    if (result.success && result.oferta) {
      ofertasCreadas.push(result.oferta);
    }
  }

  // ============ NUEVAS POSTULACIONES ============
  console.log('\n📮 CREANDO 30 POSTULACIONES DISTRIBUIDAS EN LOS ÚLTIMOS 12 MESES...\n');

  // Obtener todos los egresados y ofertas para crear combinaciones
  const todosEgresados = await egresadoRepo.find();
  const todasOfertas = await ofertaRepo.find();

  if (todosEgresados.length === 0 || todasOfertas.length === 0) {
    console.log('❌ No hay egresados u ofertas para crear postulaciones');
    return;
  }

  let postulacionesExitosas = 0;
  let postulacionesFallidas = 0;

  for (let i = 0; i < 30; i++) {
    const egresadoAleatorio = todosEgresados[Math.floor(Math.random() * todosEgresados.length)];
    const ofertaAleatoria = todasOfertas[Math.floor(Math.random() * todasOfertas.length)];
    const fechaAleatoria = getRandomDateInLast12Months();

    const result = await createPostulacion(
      postulacionRepo,
      egresadoRepo,
      ofertaRepo,
      egresadoAleatorio.id_egresado,
      ofertaAleatoria.id_oferta,
      fechaAleatoria
    );

    if (result.success) {
      console.log(result.message);
      postulacionesExitosas++;
    } else {
      console.log(result.message);
      postulacionesFallidas++;
    }
  }

  // ============ RESUMEN ============
  console.log('\n');
  console.log('═════════════════════════════════════════════');
  console.log('✅ SEEDING COMPLETADO');
  console.log('═════════════════════════════════════════════');
  console.log(`📝 Egresados creados: ${egresadosCreados.length}/10`);
  console.log(`💼 Ofertas creadas: ${ofertasCreadas.length}/5`);
  console.log(`📮 Postulaciones exitosas: ${postulacionesExitosas}/30`);
  console.log(`⚠️  Postulaciones evitadas (duplicados/errores): ${postulacionesFallidas}`);
  console.log('═════════════════════════════════════════════\n');
}

main()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
