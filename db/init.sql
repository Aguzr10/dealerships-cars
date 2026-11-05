-- =========================================================
--  Base de datos del taller integrador: API de Concesionarios
--  Se ejecuta automáticamente la PRIMERA vez que se crea el
--  contenedor. Para reiniciar: docker compose down -v
-- =========================================================

CREATE TABLE dealerships (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    city        VARCHAR(100) NOT NULL,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE cars (
    id             SERIAL PRIMARY KEY,
    plate          VARCHAR(10) NOT NULL UNIQUE,
    brand          VARCHAR(50) NOT NULL,
    model          VARCHAR(50) NOT NULL,
    year           INTEGER NOT NULL CHECK (year BETWEEN 1990 AND 2027),
    price          INTEGER NOT NULL CHECK (price > 0),
    status         VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
                   CHECK (status IN ('AVAILABLE', 'RESERVED', 'SOLD')),
    dealership_id  INTEGER NOT NULL REFERENCES dealerships(id) ON DELETE RESTRICT,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cars_dealership ON cars(dealership_id);
CREATE INDEX idx_cars_status     ON cars(status);

-- ---------------------------------------------------------
--  Datos iniciales
--  (price en pesos colombianos, sin decimales)
-- ---------------------------------------------------------
INSERT INTO dealerships (name, city, active) VALUES
('Ruedas del Andino',  'Bogotá',        TRUE),
('Valle Motor',        'Cali',          TRUE),
('Motor Paisa',        'Medellín',      TRUE),
('Brisa Costeña Autos','Barranquilla',  TRUE),
('Café y Motor',       'Pereira',       TRUE),
('Llano Ruedas',       'Villavicencio', FALSE);

INSERT INTO cars (plate, brand, model, year, price, status, dealership_id) VALUES
('KMT481', 'Mazda',      'CX-30',          2024, 132900000, 'AVAILABLE', 1),
('JHQ209', 'Renault',    'Duster',         2023,  89900000, 'SOLD',      1),
('LPZ733', 'Toyota',     'Corolla Cross',  2025, 154500000, 'RESERVED',  1),
('GTR118', 'Chevrolet',  'Onix',           2022,  61500000, 'AVAILABLE', 1),
('NBV562', 'Kia',        'Sportage',       2025, 149900000, 'AVAILABLE', 2),
('HDS940', 'Renault',    'Logan',          2020,  42800000, 'SOLD',      2),
('MKL327', 'Hyundai',    'Tucson',         2024, 162300000, 'AVAILABLE', 2),
('FRW654', 'Nissan',     'Kicks',          2023,  97600000, 'RESERVED',  2),
('PQX815', 'Toyota',     'Hilux',          2024, 214900000, 'AVAILABLE', 3),
('ZTE472', 'Mazda',      '2',              2021,  58900000, 'SOLD',      3),
('WBN306', 'BYD',        'Dolphin',        2025, 119990000, 'AVAILABLE', 3),
('CXA751', 'Volkswagen', 'T-Cross',        2024, 118500000, 'AVAILABLE', 3),
('DLR238', 'Ford',       'Ranger',         2023, 189000000, 'AVAILABLE', 4),
('SVT690', 'Suzuki',     'Swift',          2022,  55400000, 'SOLD',      4),
('YHK145', 'Kia',        'Picanto',        2024,  59990000, 'AVAILABLE', 4),
('RMC583', 'Chevrolet',  'Tracker',        2019,  64700000, 'AVAILABLE', 6);
