/* 
Script para la creacion de la base de datos de Gigmatch
*/

-- Creacion del esquema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-------------TABLAS CON SOLO LLAVES PRIMARIAS-----------------

--  Tabla: usuario
CREATE TABLE usuario(
  idSpotify VARCHAR(50),
  nombre VARCHAR(50)
);

--Restricciones usuario
--Dominio
ALTER TABLE usuario ALTER COLUMN idSpotify SET NOT NULL; -- CORREGIDO: era idusuario
ALTER TABLE usuario ALTER COLUMN nombre SET NOT NULL;

ALTER TABLE usuario ADD CONSTRAINT usuario_nombre_letras CHECK(nombre <> '');

--Entidad
ALTER TABLE usuario ADD CONSTRAINT usuario_pkey PRIMARY KEY (idSpotify);

-- Comentarios
COMMENT ON TABLE usuario IS 'Tabla que almacena la informacion general de los usuarios.';
COMMENT ON COLUMN usuario.idSpotify IS 'Identificador unico de el usuario.';
COMMENT ON COLUMN usuario.nombre IS 'Nombre del usuario.';

COMMENT ON CONSTRAINT usuario_pkey ON usuario IS 'Llave primaria de la tabla usuario.';
COMMENT ON CONSTRAINT usuario_nombre_letras ON usuario IS 'Restriccion CHECK que evita que el nombre esté vacío.';


-------------TABLAS CON LLAVES PRIMARIAS Y LLAVES FORANEAS-----------------

--  Tabla: token
CREATE TABLE token (
  idToken CHAR(9),
  refreshToken VARCHAR(50),
  idSpotify VARCHAR(50)
);

--Restricciones token
--Dominio
ALTER TABLE token ALTER COLUMN idToken SET NOT NULL;
ALTER TABLE token ALTER COLUMN refreshToken SET NOT NULL;
ALTER TABLE token ALTER COLUMN idSpotify SET NOT NULL;

ALTER TABLE token ADD CONSTRAINT idToken_len CHECK(CHAR_LENGTH(idToken) = 9);

--Entidad
ALTER TABLE token ADD CONSTRAINT token_pkey PRIMARY KEY (idToken);

--Referencial
ALTER TABLE token ADD CONSTRAINT token_fkey_idSpotify FOREIGN KEY (idSpotify) REFERENCES usuario(idSpotify)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Comentarios
COMMENT ON TABLE token IS 'Tabla que almacena los refreshToken';
COMMENT ON COLUMN token.idToken IS 'ID unico de cada token';
COMMENT ON COLUMN token.idSpotify IS 'ID de Spotify del usuario (FK) que enlaza con la tabla usuario.';
COMMENT ON COLUMN token.refreshToken IS 'Es el token que se usara para obtener accesTokens cada que sea necesario';

COMMENT ON CONSTRAINT token_pkey ON token IS 'Llave primaria de la tabla token.';