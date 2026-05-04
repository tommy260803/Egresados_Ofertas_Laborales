-- ======================================================
-- SCHEMA SQL PARA SISTEMA DE GESTIÓN DE EGRESADOS Y OFERTA LABORAL
-- PostgreSQL 15+
-- ======================================================

-- Extensión para UUID (si se prefiere UUID como PK, opcional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================================
-- 1. TABLAS PRINCIPALES
-- ======================================================

-- Usuarios (base para autenticación y roles)
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('administrador', 'egresado', 'empresa')),
    activo BOOLEAN DEFAULT TRUE,
    invitation_token VARCHAR(255),
    invitation_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Egresados (hereda de usuarios)
CREATE TABLE egresados (
    id_egresado INTEGER PRIMARY KEY REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    documento_identidad VARCHAR(20) UNIQUE,
    fecha_nacimiento DATE,
    genero VARCHAR(20),
    telefono VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    carrera VARCHAR(150) NOT NULL,
    universidad VARCHAR(150),
    anio_graduacion INTEGER,
    perfil_laboral TEXT,
    cv_url TEXT,
    foto_url TEXT,
    linkedin_url TEXT,
    github_url TEXT
);

-- Administradores (hereda de usuarios)
CREATE TABLE administradores (
    id_administrador INTEGER PRIMARY KEY REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    nivel VARCHAR(30) DEFAULT 'basico' CHECK (nivel IN ('basico', 'supervisor', 'gerente'))
);

-- Empresas (hereda de usuarios)
CREATE TABLE empresas (
    id_empresa INTEGER PRIMARY KEY REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    razon_social VARCHAR(200) NOT NULL,
    ruc VARCHAR(20) UNIQUE,
    descripcion TEXT,
    sector VARCHAR(100),
    sitio_web VARCHAR(255),
    telefono_contacto VARCHAR(20),
    email_contacto VARCHAR(255),
    direccion TEXT,
    ciudad VARCHAR(100),
    logo_url TEXT,
    verificada BOOLEAN DEFAULT FALSE
);

-- Habilidades (catálogo)
CREATE TABLE habilidades (
    id_habilidad SERIAL PRIMARY KEY,
    nombre_habilidad VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    categoria VARCHAR(50)
);

-- Relación egresados - habilidades (muchos a muchos)
CREATE TABLE egresados_habilidades (
    id_egresado INTEGER REFERENCES egresados(id_egresado) ON DELETE CASCADE ON UPDATE CASCADE,
    id_habilidad INTEGER REFERENCES habilidades(id_habilidad) ON DELETE CASCADE ON UPDATE CASCADE,
    nivel_experiencia VARCHAR(20) DEFAULT 'intermedio' CHECK (nivel_experiencia IN ('basico', 'intermedio', 'avanzado', 'experto')),
    PRIMARY KEY (id_egresado, id_habilidad)
);

-- Ofertas laborales
CREATE TABLE ofertas_laborales (
    id_oferta SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL REFERENCES empresas(id_empresa) ON DELETE CASCADE ON UPDATE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    modalidad VARCHAR(30) NOT NULL CHECK (modalidad IN ('presencial', 'remoto', 'hibrido')),
    ubicacion VARCHAR(150),
    salario_minimo DECIMAL(12,2),
    salario_maximo DECIMAL(12,2),
    tipo_salario VARCHAR(20) DEFAULT 'mensual' CHECK (tipo_salario IN ('mensual', 'quincenal', 'por_hora', 'anual')),
    jornada VARCHAR(30) DEFAULT 'completa' CHECK (jornada IN ('completa', 'media', 'por_horas')),
    experiencia_requerida VARCHAR(50),
    fecha_publicacion DATE DEFAULT CURRENT_DATE,
    fecha_cierre DATE,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fechas_validas CHECK (fecha_cierre IS NULL OR fecha_cierre >= fecha_publicacion)
);

-- Relación ofertas - habilidades
CREATE TABLE ofertas_habilidades (
    id_oferta INTEGER REFERENCES ofertas_laborales(id_oferta) ON DELETE CASCADE ON UPDATE CASCADE,
    id_habilidad INTEGER REFERENCES habilidades(id_habilidad) ON DELETE CASCADE ON UPDATE CASCADE,
    es_requisito BOOLEAN DEFAULT TRUE,  -- TRUE: requisito, FALSE: deseable
    PRIMARY KEY (id_oferta, id_habilidad)
);

-- Postulaciones
CREATE TABLE postulaciones (
    id_postulacion SERIAL PRIMARY KEY,
    id_oferta INTEGER NOT NULL REFERENCES ofertas_laborales(id_oferta) ON DELETE CASCADE ON UPDATE CASCADE,
    id_egresado INTEGER NOT NULL REFERENCES egresados(id_egresado) ON DELETE CASCADE ON UPDATE CASCADE,
    estado_actual VARCHAR(30) NOT NULL DEFAULT 'postulado' CHECK (estado_actual IN ('postulado', 'revisado', 'preseleccionado', 'entrevista', 'rechazado', 'contratado')),
    fecha_postulacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    mensaje TEXT,
    cv_postulacion_url TEXT,  -- CV específico para la postulación
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_oferta, id_egresado)  -- Evita duplicados
);

-- Historial de cambios de estado de postulación (trigger automático)
CREATE TABLE historial_estados_postulacion (
    id_historial SERIAL PRIMARY KEY,
    id_postulacion INTEGER NOT NULL REFERENCES postulaciones(id_postulacion) ON DELETE CASCADE ON UPDATE CASCADE,
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    motivo TEXT,
    fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_por INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

-- Notificaciones (internas)
CREATE TABLE notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    id_usuario_destinatario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    asunto VARCHAR(200),
    contenido TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    id_referencia INTEGER  -- Puede referir a id_oferta, id_postulacion, etc.
);

-- Reportes generados (PDF almacenado en sistema de archivos o S3, aquí solo metadatos)
CREATE TABLE reportes (
    id_reporte SERIAL PRIMARY KEY,
    nombre_reporte VARCHAR(200) NOT NULL,
    tipo_reporte VARCHAR(50) NOT NULL,  -- 'operacional', 'gestion', 'estadistico'
    parametros JSONB,
    url_pdf TEXT,
    generado_por INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_completado TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'procesando', 'completado', 'fallido')),
    tamano_bytes BIGINT
);

-- Tabla de auditoría general (opcional pero recomendada)
CREATE TABLE auditoria (
    id_auditoria BIGSERIAL PRIMARY KEY,
    tabla_afectada VARCHAR(100),
    id_registro INTEGER,
    accion VARCHAR(20) CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    usuario_id INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    datos_antiguos JSONB,
    datos_nuevos JSONB
);

-- ======================================================
-- 2. TABLAS AGREGADAS / MÉTRICAS (para performance de dashboards)
-- ======================================================

CREATE TABLE metricas_diarias (
    id_metrica SERIAL PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    total_egresados INTEGER DEFAULT 0,
    total_empresas INTEGER DEFAULT 0,
    total_ofertas_activas INTEGER DEFAULT 0,
    total_postulaciones INTEGER DEFAULT 0,
    total_contrataciones INTEGER DEFAULT 0,
    tasa_empleabilidad NUMERIC(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- 3. ÍNDICES PARA BÚSQUEDAS FRECUENTES
-- ======================================================

-- Usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- Egresados
CREATE INDEX idx_egresados_carrera ON egresados(carrera);
CREATE INDEX idx_egresados_ciudad ON egresados(ciudad);
CREATE INDEX idx_egresados_anio_graduacion ON egresados(anio_graduacion);
CREATE INDEX idx_egresados_busqueda_nombres ON egresados USING GIN (to_tsvector('spanish', nombres || ' ' || apellidos));

-- Empresas
CREATE INDEX idx_empresas_razon_social ON empresas(razon_social);
CREATE INDEX idx_empresas_sector ON empresas(sector);
CREATE INDEX idx_empresas_ciudad ON empresas(ciudad);

-- Ofertas laborales
CREATE INDEX idx_ofertas_empresa ON ofertas_laborales(id_empresa);
CREATE INDEX idx_ofertas_fechas ON ofertas_laborales(fecha_publicacion, fecha_cierre);
CREATE INDEX idx_ofertas_salario ON ofertas_laborales(salario_minimo, salario_maximo);
CREATE INDEX idx_ofertas_ubicacion ON ofertas_laborales(ubicacion);
CREATE INDEX idx_ofertas_activa ON ofertas_laborales(activa);
CREATE INDEX idx_ofertas_modalidad ON ofertas_laborales(modalidad);
-- Búsqueda full-text en título y descripción
CREATE INDEX idx_ofertas_busqueda ON ofertas_laborales USING GIN (to_tsvector('spanish', titulo || ' ' || descripcion));

-- Habilidades
CREATE INDEX idx_habilidades_nombre ON habilidades(nombre_habilidad);

-- Postulaciones
CREATE INDEX idx_postulaciones_egresado ON postulaciones(id_egresado);
CREATE INDEX idx_postulaciones_oferta ON postulaciones(id_oferta);
CREATE INDEX idx_postulaciones_estado ON postulaciones(estado_actual);
CREATE INDEX idx_postulaciones_fecha ON postulaciones(fecha_postulacion);

-- Historial estados
CREATE INDEX idx_historial_postulacion ON historial_estados_postulacion(id_postulacion);
CREATE INDEX idx_historial_fecha ON historial_estados_postulacion(fecha_cambio);

-- Notificaciones
CREATE INDEX idx_notificaciones_usuario ON notificaciones(id_usuario_destinatario, leida);
CREATE INDEX idx_notificaciones_fecha ON notificaciones(fecha_envio);

-- ======================================================
-- 4. USUARIOS DE PRUEBA
-- ======================================================

WITH usuario_admin AS (
    INSERT INTO usuarios (email, contrasena_hash, rol, activo)
    VALUES ('admin@demo.com', '$2b$10$siNcc3lFdBA4WO8vOOO3qeYHppC.mtxwOX8wmMiB/X9gSTRfVt/Au', 'administrador', TRUE)
    ON CONFLICT (email) DO UPDATE
        SET contrasena_hash = EXCLUDED.contrasena_hash,
            rol = EXCLUDED.rol,
            activo = EXCLUDED.activo,
            updated_at = CURRENT_TIMESTAMP
    RETURNING id_usuario
)
INSERT INTO administradores (id_administrador, nombres, apellidos, nivel)
VALUES ((SELECT id_usuario FROM usuario_admin), 'Ana', 'Torres', 'supervisor')
ON CONFLICT (id_administrador) DO UPDATE
    SET nombres = EXCLUDED.nombres,
        apellidos = EXCLUDED.apellidos,
        nivel = EXCLUDED.nivel;

WITH usuario_egresado AS (
    INSERT INTO usuarios (email, contrasena_hash, rol, activo)
    VALUES ('egresado@demo.com', '$2b$10$siNcc3lFdBA4WO8vOOO3qeYHppC.mtxwOX8wmMiB/X9gSTRfVt/Au', 'egresado', TRUE)
    ON CONFLICT (email) DO UPDATE
        SET contrasena_hash = EXCLUDED.contrasena_hash,
            rol = EXCLUDED.rol,
            activo = EXCLUDED.activo,
            updated_at = CURRENT_TIMESTAMP
    RETURNING id_usuario
)
INSERT INTO egresados (id_egresado, nombres, apellidos, carrera, ciudad, universidad, anio_graduacion, perfil_laboral)
VALUES ((SELECT id_usuario FROM usuario_egresado), 'Luis', 'Ramirez', 'Ingenieria de Sistemas', 'Lima', 'Universidad Demo', 2024, 'Desarrollador junior con interes en backend y cloud.')
ON CONFLICT (id_egresado) DO UPDATE
    SET nombres = EXCLUDED.nombres,
        apellidos = EXCLUDED.apellidos,
        carrera = EXCLUDED.carrera,
        ciudad = EXCLUDED.ciudad,
        universidad = EXCLUDED.universidad,
        anio_graduacion = EXCLUDED.anio_graduacion,
        perfil_laboral = EXCLUDED.perfil_laboral;

WITH usuario_empresa AS (
    INSERT INTO usuarios (email, contrasena_hash, rol, activo)
    VALUES ('empresa@demo.com', '$2b$10$siNcc3lFdBA4WO8vOOO3qeYHppC.mtxwOX8wmMiB/X9gSTRfVt/Au', 'empresa', TRUE)
    ON CONFLICT (email) DO UPDATE
        SET contrasena_hash = EXCLUDED.contrasena_hash,
            rol = EXCLUDED.rol,
            activo = EXCLUDED.activo,
            updated_at = CURRENT_TIMESTAMP
    RETURNING id_usuario
)
INSERT INTO empresas (id_empresa, razon_social, ruc, descripcion, sector, ciudad, email_contacto, telefono_contacto, verificada)
VALUES ((SELECT id_usuario FROM usuario_empresa), 'Demo Tech SAC', '20123456789', 'Empresa de prueba para validar postulaciones y gestion de ofertas.', 'Tecnologia', 'Lima', 'empresa@demo.com', '999888777', TRUE)
ON CONFLICT (id_empresa) DO UPDATE
    SET razon_social = EXCLUDED.razon_social,
        ruc = EXCLUDED.ruc,
        descripcion = EXCLUDED.descripcion,
        sector = EXCLUDED.sector,
        ciudad = EXCLUDED.ciudad,
        email_contacto = EXCLUDED.email_contacto,
        telefono_contacto = EXCLUDED.telefono_contacto,
        verificada = EXCLUDED.verificada;

-- ======================================================
-- 4. VISTAS MATERIALIZADAS PARA DASHBOARD
-- ======================================================

-- Empleabilidad por carrera
CREATE MATERIALIZED VIEW mv_empleabilidad_por_carrera AS
SELECT 
    e.carrera,
    COUNT(DISTINCT e.id_egresado) AS total_egresados,
    COUNT(DISTINCT p.id_egresado) AS egresados_contratados,
    ROUND(100.0 * COUNT(DISTINCT p.id_egresado) / NULLIF(COUNT(DISTINCT e.id_egresado), 0), 2) AS tasa_empleabilidad
FROM egresados e
LEFT JOIN postulaciones p ON e.id_egresado = p.id_egresado AND p.estado_actual = 'contratado'
GROUP BY e.carrera
WITH DATA;

CREATE UNIQUE INDEX idx_mv_empleabilidad_carrera ON mv_empleabilidad_por_carrera(carrera);
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_empleabilidad_por_carrera;

-- Demanda de habilidades por ofertas activas
CREATE MATERIALIZED VIEW mv_demanda_habilidades AS
SELECT 
    h.id_habilidad,
    h.nombre_habilidad,
    COUNT(DISTINCT oh.id_oferta) AS cantidad_ofertas_requieren,
    COUNT(DISTINCT o.id_empresa) AS empresas_demandantes,
    AVG(o.salario_minimo) AS salario_promedio_minimo
FROM habilidades h
JOIN ofertas_habilidades oh ON h.id_habilidad = oh.id_habilidad
JOIN ofertas_laborales o ON oh.id_oferta = o.id_oferta AND o.activa = TRUE
GROUP BY h.id_habilidad, h.nombre_habilidad
ORDER BY cantidad_ofertas_requieren DESC
WITH DATA;

CREATE UNIQUE INDEX idx_mv_demanda_habilidad ON mv_demanda_habilidades(id_habilidad);
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_demanda_habilidades;

-- ======================================================
-- 5. FUNCIONES Y TRIGGERS
-- ======================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para usuarios
CREATE TRIGGER trigger_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

-- Trigger para ofertas_laborales
CREATE TRIGGER trigger_ofertas_updated_at
    BEFORE UPDATE ON ofertas_laborales
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

-- Trigger para postulaciones
CREATE TRIGGER trigger_postulaciones_updated_at
    BEFORE UPDATE ON postulaciones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

-- Función para guardar historial de estados de postulación
CREATE OR REPLACE FUNCTION registrar_historial_estado_postulacion()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo si el estado cambió
    IF OLD.estado_actual IS DISTINCT FROM NEW.estado_actual THEN
        INSERT INTO historial_estados_postulacion (
            id_postulacion,
            estado_anterior,
            estado_nuevo,
            motivo,
            modificado_por
        ) VALUES (
            NEW.id_postulacion,
            OLD.estado_actual,
            NEW.estado_actual,
            NEW.mensaje,   -- se puede usar el mensaje como motivo
            NULL           -- se podría obtener de una variable de sesión
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para postulaciones al cambiar estado
CREATE TRIGGER trigger_postulaciones_historial
    AFTER UPDATE OF estado_actual ON postulaciones
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historial_estado_postulacion();

-- Función para refrescar vistas materializadas automáticamente
-- (se puede invocar manualmente desde aplicación o con cron)
CREATE OR REPLACE FUNCTION refresh_mv_dashboards()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_empleabilidad_por_carrera;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_demanda_habilidades;
END;
$$ LANGUAGE plpgsql;

-- Trigger opcional: actualizar métricas diarias al insertar postulación
CREATE OR REPLACE FUNCTION actualizar_metricas_diarias()
RETURNS TRIGGER AS $$
DECLARE
    fecha_actual DATE := CURRENT_DATE;
BEGIN
    INSERT INTO metricas_diarias (fecha, total_postulaciones)
    VALUES (fecha_actual, 1)
    ON CONFLICT (fecha) DO UPDATE
    SET total_postulaciones = metricas_diarias.total_postulaciones + 1,
        updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_metricas_postulacion
    AFTER INSERT ON postulaciones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_metricas_diarias();

-- ======================================================
-- 6. CONSTRAINTS ADICIONALES Y COMENTARIOS
-- ======================================================

COMMENT ON TABLE usuarios IS 'Usuarios del sistema con autenticación y roles';
COMMENT ON TABLE egresados IS 'Perfil completo de egresados (hereda de usuarios)';
COMMENT ON TABLE empresas IS 'Perfil de empresas empleadoras';
COMMENT ON TABLE ofertas_laborales IS 'Ofertas de trabajo publicadas por empresas';
COMMENT ON TABLE postulaciones IS 'Postulaciones de egresados a ofertas';
COMMENT ON MATERIALIZED VIEW mv_empleabilidad_por_carrera IS 'Vista materializada de tasa de empleabilidad por carrera';
COMMENT ON MATERIALIZED VIEW mv_demanda_habilidades IS 'Vista materializada de habilidades más demandadas';

-- Fin del script SQL