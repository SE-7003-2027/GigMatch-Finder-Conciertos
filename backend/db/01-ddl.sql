/* 
Script para la creacion de la base de datos de Gigmatch
*/

-- Creacion del esquema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

------------- TABLAS CON SOLO LLAVES PRIMARIAS -----------------

--  Tabla: usuario
CREATE TABLE usuario(
  idSpotify VARCHAR(100),
  nombre VARCHAR(100)
);

-- Restricciones usuario
-- Dominio
ALTER TABLE usuario ALTER COLUMN idSpotify SET NOT NULL;
ALTER TABLE usuario ALTER COLUMN nombre SET NOT NULL;

ALTER TABLE usuario ADD CONSTRAINT usuario_nombre_letras CHECK(nombre <> '');

-- Entidad
ALTER TABLE usuario ADD CONSTRAINT usuario_pkey PRIMARY KEY (idSpotify);

-- Comentarios
COMMENT ON TABLE usuario IS 'Tabla que almacena la informacion general de los usuarios.';
COMMENT ON COLUMN usuario.idSpotify IS 'Identificador unico de el usuario en Spotify.';
COMMENT ON COLUMN usuario.nombre IS 'Nombre del usuario.';
COMMENT ON CONSTRAINT usuario_pkey ON usuario IS 'Llave primaria de la tabla usuario.';
COMMENT ON CONSTRAINT usuario_nombre_letras ON usuario IS 'Restriccion CHECK que evita que el nombre este vacio.';


------------- TABLAS CON LLAVES PRIMARIAS Y FORANEAS -----------------

--  Tabla: token
CREATE TABLE token (
  idSpotify VARCHAR(100),
  accessToken TEXT,
  refreshToken TEXT,
  expiresAt TIMESTAMP
);

-- Restricciones token
-- Dominio
ALTER TABLE token ALTER COLUMN idSpotify SET NOT NULL;
ALTER TABLE token ALTER COLUMN accessToken SET NOT NULL;
ALTER TABLE token ALTER COLUMN refreshToken SET NOT NULL;
ALTER TABLE token ALTER COLUMN expiresAt SET NOT NULL;

-- Entidad (idSpotify funciona como PK garantizando la relacion 1 a 1)
ALTER TABLE token ADD CONSTRAINT token_pkey PRIMARY KEY (idSpotify);

-- Referencial
ALTER TABLE token ADD CONSTRAINT token_fkey_idSpotify FOREIGN KEY (idSpotify) REFERENCES usuario(idSpotify)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Comentarios
COMMENT ON TABLE token IS 'Tabla que almacena las credenciales de acceso de Spotify cifradas';
COMMENT ON COLUMN token.idSpotify IS 'ID de Spotify del usuario (PK y FK).';
COMMENT ON COLUMN token.accessToken IS 'Token de acceso cifrado para consumir APIs.';
COMMENT ON COLUMN token.refreshToken IS 'Token de refresco cifrado para renovar la sesion.';
COMMENT ON COLUMN token.expiresAt IS 'Fecha y hora exacta en la que el accessToken pierde validez.';
COMMENT ON CONSTRAINT token_pkey ON token IS 'Llave primaria de la tabla token.';