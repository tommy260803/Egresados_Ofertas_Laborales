import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Usuario } from './src/auth/entities/usuario.entity';
import { Administrador } from './src/auth/entities/administrador.entity';
import { Egresado } from './src/egresados/entities/egresado.entity';
import { Empresa } from './src/ofertas/entities/empresa.entity';
import { Habilidad } from './src/ofertas/entities/habilidad.entity';
import { OfertaLaboral } from './src/ofertas/entities/oferta-laboral.entity';
import { Postulacion } from './src/ofertas/entities/postulacion.entity';

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

async function main() {
  try {
    await dataSource.initialize();
    console.log('✅ Conectado a PostgreSQL\n');

    // Usuarios
    const usuarioRepo = dataSource.getRepository(Usuario);
    const usuariosCount = await usuarioRepo.count();
    const usuarios = await usuarioRepo.find();
    console.log(`📊 USUARIOS (${usuariosCount})`);
    usuarios.forEach(u => console.log(`  - ${u.email} (${u.rol})`));

    // Egresados
    console.log('\n');
    const egresadoRepo = dataSource.getRepository(Egresado);
    const egresadosCount = await egresadoRepo.count();
    const egresados = await egresadoRepo.find({ relations: ['habilidades'] });
    console.log(`👨‍🎓 EGRESADOS (${egresadosCount})`);
    egresados.forEach(e => console.log(`  - ID: ${e.id_egresado} | ${e.nombres} ${e.apellidos} | ${e.carrera} | Habilidades: ${e.habilidades?.length || 0}`));

    // Empresas
    console.log('\n');
    const empresaRepo = dataSource.getRepository(Empresa);
    const empresasCount = await empresaRepo.count();
    const empresas = await empresaRepo.find();
    console.log(`🏢 EMPRESAS (${empresasCount})`);
    empresas.forEach(e => console.log(`  - ID: ${e.id_empresa} | ${e.razon_social} | RUC: ${e.ruc}`));

    // Habilidades
    console.log('\n');
    const habilidadRepo = dataSource.getRepository(Habilidad);
    const habilidadesCount = await habilidadRepo.count();
    const habilidades = await habilidadRepo.find();
    console.log(`🛠️  HABILIDADES (${habilidadesCount})`);
    habilidades.forEach(h => console.log(`  - ID: ${h.id_habilidad} | ${h.nombre_habilidad} | ${h.categoria}`));

    // Ofertas Laborales
    console.log('\n');
    const ofertaRepo = dataSource.getRepository(OfertaLaboral);
    const ofertasCount = await ofertaRepo.count();
    const ofertas = await ofertaRepo.find({ relations: ['empresa'] });
    console.log(`💼 OFERTAS LABORALES (${ofertasCount})`);
    ofertas.forEach(o => {
      const fecha = o.fecha_publicacion instanceof Date ? o.fecha_publicacion.toISOString().split('T')[0] : o.fecha_publicacion;
      console.log(`  - ID: ${o.id_oferta} | ${o.titulo} | Empresa: ${o.empresa?.razon_social} | Activa: ${o.activa} | Fecha: ${fecha}`);
    });

    // Postulaciones
    console.log('\n');
    const postulacionRepo = dataSource.getRepository(Postulacion);
    const postulacionesCount = await postulacionRepo.count();
    const postulaciones = await postulacionRepo.find({ relations: ['egresado', 'oferta'] });
    console.log(`📝 POSTULACIONES (${postulacionesCount})`);
    postulaciones.forEach(p => console.log(`  - ID: ${p.id_postulacion} | Egresado: ${p.egresado?.nombres} | Oferta: ${p.oferta?.titulo} | Estado: ${p.estado_actual} | Fecha: ${p.fecha_postulacion.toISOString().split('T')[0]}`));

    // Análisis de postulaciones por mes
    if (postulacionesCount > 0) {
      console.log('\n');
      const query = dataSource.query(`
        SELECT DATE_TRUNC('month', fecha_postulacion)::date as mes, COUNT(*) as cantidad
        FROM postulaciones
        GROUP BY DATE_TRUNC('month', fecha_postulacion)
        ORDER BY mes DESC;
      `);
      const postulacionesPorMes = await query;
      console.log('📅 POSTULACIONES POR MES:');
      postulacionesPorMes.forEach(row => console.log(`  - ${row.mes}: ${row.cantidad} postulaciones`));
    }

    console.log('\n✅ Diagnóstico completado');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

main();
