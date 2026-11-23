# Notas de repaso: Taller 4 (Concesionarios)

Para consultar en el parcial. El taller está **completo**: dealerships, cars y pruebas unitarias (`npm test` pasa 14/14).
Es la mejor referencia para **pruebas con mocks** (Vitest) y para **regla de padre activo al crear un hijo**.

Rutas relativas a esta carpeta (`dealerships-cars/`). El código está en `api/src/`.

---

## 1. Qué archivo hace qué

| Pieza | Para qué sirve | Archivo |
|---|---|---|
| **Entidad** | Describe la tabla tal como está en `db/init.sql` | `api/src/dealerships/entities/dealership.entity.ts`, `api/src/cars/entities/car.entity.ts` |
| **Enum** | Valores válidos de `status` (los del `CHECK` de la tabla) | `api/src/cars/entities/car-status.enums.ts` |
| **DTO** | Lo que puede llegar en el body de POST/PATCH; sus decoradores dan el **400** | `api/src/*/dto/*.ts` |
| **Servicio** | Reglas de negocio + repositorios. Aquí van los `throw` (404/409/400) | `api/src/*/*.service.ts` |
| **Controlador** | Una fila de la tabla de endpoints = un método. Solo delega | `api/src/*/*.controller.ts` |
| **Módulo** | Junta controlador + servicio + `forFeature([...])` | `api/src/*/*.module.ts` |
| **app.module** | `ConfigModule` (.env) + `TypeOrmModule.forRootAsync` (conexión) + importa los módulos | `api/src/app.module.ts` (l. 12, 16; `synchronize: false` en l. 26) |
| **main.ts** | `ValidationPipe` global (l. 11) + Swagger en `/api` (l. 28) | `api/src/main.ts` |

**Orden para crear un recurso nuevo:**
`nest g resource x` → entidad → registrar en `forFeature` del módulo → DTOs → servicio → controlador → probar en Swagger.
Si sale el error `edgesOut` de npm, se arregla con `--legacy-peer-deps`.

---

## 2. Relación 1 → N (un concesionario, muchos carros)

| Qué | Dónde | Línea |
|---|---|---|
| `@OneToMany(() => Car, (car) => car.dealership)` en el lado "uno"; **no crea columna** | `api/src/dealerships/entities/dealership.entity.ts` | 36 |
| `@ManyToOne(() => Dealership, (d) => d.cars)` en el lado "muchos", que **tiene la FK** | `api/src/cars/entities/car.entity.ts` | 54 |
| `@JoinColumn({ name: 'dealership_id' })`: qué columna guarda la FK | `api/src/cars/entities/car.entity.ts` | 55 |
| `@Column({ name: 'dealership_id' }) dealershipId: number`: la FK como número, para filtrar y crear | `api/src/cars/entities/car.entity.ts` | 39 |
| `forFeature([Dealership, Car])`: los dos repos en el módulo padre | `api/src/dealerships/dealerships.module.ts` | 12 |
| `forFeature([Car, Dealership])`: los dos repos en el módulo hijo | `api/src/cars/cars.module.ts` | 12 |

Cómo leerlo:
- `() => Car` es una función para evitar el problema de importación circular entre los dos archivos.
- El 2.º argumento dice cuál es la propiedad pareja del otro lado.
- Si un servicio usa el repositorio de otra entidad, esa entidad **tiene que estar en el `forFeature` de su módulo**. Si no, Nest falla al arrancar.
- `name: 'created_at'` se usa cuando la columna de la BD se llama distinto que la propiedad en TS.
- `status` es `VARCHAR + CHECK` en la BD → `type: 'varchar'` (no `'enum'`).

---

## 3. Reglas de negocio → código → dónde

| # | Regla | HTTP | Dónde está |
|---|---|---|---|
| 1 | El concesionario no existe | **404** | `api/src/dealerships/dealerships.service.ts:44` (`findOne`, reutilizado en l. 50 y 72) |
| 1 | El carro no existe | **404** | `api/src/cars/cars.service.ts:54` (`findOne`, reutilizado en updateStatus y remove) |
| 2 | `name` de concesionario repetido | **409** | `api/src/dealerships/dealerships.service.ts:62` |
| 2 | `plate` de carro repetida | **409** | `api/src/cars/cars.service.ts:63` |
| 3 | `year` 1990–2027 | **400** | DTO: `api/src/cars/dto/create-car.dto.ts:42-43` (`@Min`/`@Max`) |
| 3 | `price` > 0 | **400** | DTO: `api/src/cars/dto/create-car.dto.ts:48` (`@IsPositive`) |
| 3 | `status` válido | **400** | DTO: `create-car.dto.ts:53` y `update-car-status.dto.ts:7` (`@IsEnum(CarStatus)`) |
| 4 | Al crear carro: concesionario existe / está activo | **404 / 400** | `api/src/cars/cars.service.ts:69 / 72` |
| 5 | Carro `SOLD` no cambia de estado | **400** | `api/src/cars/cars.service.ts:100` |
| 6 | No borrar concesionario con carros | **409** | `api/src/dealerships/dealerships.service.ts:75` |

**Las validaciones de forma (rangos, enum, largos) van en el DTO**: el `ValidationPipe` responde 400 solo.
**Las reglas que necesitan la BD** (existe, duplicado, estado actual) **van en el servicio**.

---

## 4. Endpoints: rutas anidadas y `@Query`

| Endpoint | Decorador | Archivo:línea | Códigos |
|---|---|---|---|
| `GET /dealerships` | `@Get()` | `dealerships.controller.ts:20` | 200 |
| `GET /dealerships/{id}` | `@Get(':id')` | `dealerships.controller.ts:26` | 200, 400, 404 |
| `GET /dealerships/{id}/cars` (**anidada**) | `@Get(':id/cars')` | `dealerships.controller.ts:32` | 200, 404 |
| `POST /dealerships` | `@Post()` | `dealerships.controller.ts:14` | 201, 400, 409 |
| `DELETE /dealerships/{id}` | `@Delete(':id')` | `dealerships.controller.ts:39` | 200, 404, 409 |
| `GET /cars?status=&dealershipId=` (**@Query**) | `@Get()` + `@Query() filters: FilterCarsDto` | `cars.controller.ts:27-28` | 200, 400 |
| `GET /cars/{id}` (incluye su concesionario) | `@Get(':id')` | `cars.controller.ts:33` | 200, 400, 404 |
| `POST /cars` | `@Post()` | `cars.controller.ts:39` | 201, 400, 404, 409 |
| `PATCH /cars/{id}/status` | `@Patch(':id/status')` + `@Body() UpdateCarStatusDto` | `cars.controller.ts:46` | 200, 400, 404 |
| `DELETE /cars/{id}` | `@Delete(':id')` | `cars.controller.ts:55` | 200, 404 |

**Filtros con `@Query`:** DTO `api/src/cars/dto/filter-cars.dto.ts` (todo `@IsOptional()`; `@Type(() => Number)` en l. 19 porque los query params llegan como texto) → servicio `cars.service.ts:31` arma el `where` solo con lo que llegó.

**De la fila del enunciado al código** (`GET /dealerships/{id}/cars`):
```ts
@Get(':id/cars')                                    // prefijo /dealerships ya está en @Controller; {id} → :id
findCars(@Param('id', ParseIntPipe) id: number) {   // ParseIntPipe: "abc" → 400
  return this.dealershipsService.findCars(id);      // el controlador no piensa, delega
}
```

**¿Qué parámetro lleva cada endpoint?**
- `{id}` en la ruta → `@Param('id', ParseIntPipe) id: number`
- `?x=` después de la ruta → `@Query('x')` o `@Query() filtros: FiltroDto`
- POST/PATCH → `@Body() dto: XDto`
- GET/DELETE **nunca** llevan body.

**¿Qué va en el body de un POST?** Las columnas de la tabla menos `id`, `created_at` y `updated_at`. Las que tienen `DEFAULT` son opcionales (`@IsOptional()` + `?`).
**¿Y en un PATCH?** Solo lo que diga la descripción. "Cambia únicamente el estado" → DTO con solo `status`.

---

## 5. Patrones para copiar

### 404: `findOne` reutilizable
```ts
async findOne(id: number): Promise<Padre> {
  const x = await this.repo.findOne({ where: { id }, relations: { hijos: true } });
  if (!x) throw new NotFoundException(`Padre con id ${id} no encontrado`);
  return x;
}
// En los demás métodos: const x = await this.findOne(id);  → ya da 404
```

### 409: nombre repetido (antes de guardar)
```ts
if (await this.repo.findOne({ where: { name } })) {
  throw new ConflictException(`Ya existe uno con el nombre '${name}'`);
}
return await this.repo.save(this.repo.create({ name, city, active }));
```

### 409: borrar un padre que tiene hijos
```ts
const padre = await this.findOne(id);          // 404
if (padre.hijos.length > 0) {                   // necesita relations: { hijos: true } en findOne
  throw new ConflictException('Tiene hijos asociados');
}
await this.repo.remove(padre);
return { message: 'Eliminado' };
// Alternativa sin cargar la relación: await this.hijoRepo.count({ where: { padreId: id } })
```

### 404 + 400: el padre debe existir y estar activo (regla 4, al crear un hijo)
```ts
const padre = await this.padreRepo.findOneBy({ id: dto.padre_id });
if (!padre) throw new NotFoundException('El padre no existe');
if (!padre.active) throw new BadRequestException('El padre no está activo');
```

### 400: estado que no puede cambiar (regla 5)
```ts
const car = await this.findOne(id);                       // 404
if (car.status === CarStatus.SOLD) {
  throw new BadRequestException('Un carro vendido no puede cambiar de estado');
}
car.status = dto.status;
return await this.carRepo.save(car);
```

### Filtros opcionales con `@Query` (`cars.controller.ts:28`, `cars.service.ts:31`)
```ts
// controlador
@Get()
findAll(@Query() filters: FilterCarsDto) {
  return this.carsService.findAll(filters);
}
// servicio
const where: FindOptionsWhere<Car> = {};
if (filters?.status) where.status = filters.status;
if (filters?.dealershipId) where.dealershipId = filters.dealershipId;
return this.carRepo.find({ where, order: { id: 'ASC' } });
```

### Crear un hijo: DTO con nombre del enunciado → propiedad de la entidad (`cars.service.ts:80-92`)
```ts
this.carRepo.create({ ...campos, status: dto.status ?? CarStatus.AVAILABLE, dealershipId: dto.dealership_id })
```

### DTO: campo obligatorio vs opcional
```ts
@ApiProperty({ example: 2020 }) @IsInt() @Min(1990) @Max(2027) year: number;              // obligatorio
@ApiPropertyOptional({ enum: CarStatus }) @IsOptional() @IsEnum(CarStatus) status?: CarStatus; // opcional
```

---

## 6. Errores que ya me pasaron

| Síntoma | Causa |
|---|---|
| `Cannot find type definition file for 'node'` | `npm install` corrido en otra carpeta → instalar dentro de `api/` |
| `database "x" does not exist` | nombre de la BD en `.env` distinto al del `docker-compose.yml` |
| `ECONNREFUSED` | puerto mal (es el de la **izquierda** en `"5434:5432"`) o Docker apagado |
| Muchos `',' expected` seguidos | falta una `}` **antes** del primer error |
| `has no exported member 'XsService'` | nombre de la clase distinto al que generó Nest |
| `Property 'update' does not exist` | el controlador generado llama a un método que se borró del servicio |
| Imports sin `.js` | en este proyecto (`"type": "module"`) los imports locales terminan en `.js` |

---

## 7. Pruebas unitarias (Vitest, sin base de datos)

Correr: `npm test` (dentro de `api/`).

| Prueba | Archivo:línea |
|---|---|
| Crear carro en concesionario activo (éxito, queda AVAILABLE) | `api/src/cars/cars.service.spec.ts:59` |
| Regla 4: concesionario no existe → 404 | `cars.service.spec.ts:78` |
| Regla 4: concesionario inactivo → 400 | `cars.service.spec.ts:86` |
| Regla 2: placa repetida → 409 | `cars.service.spec.ts:95` |
| Regla 5: carro SOLD no cambia → 400 | `cars.service.spec.ts:102` |
| Regla 6: borrar concesionario con carros → 409 | `api/src/dealerships/dealerships.service.spec.ts:36` |
| Regla 1 y 2 de dealerships | `dealerships.service.spec.ts:54`, `61` |

**La receta (cópiala):**
```ts
const repo = { findOne: vi.fn(), save: vi.fn(), create: vi.fn(), remove: vi.fn() }; // mock: solo lo que usa el servicio

beforeEach(async () => {
  vi.clearAllMocks();
  const module = await Test.createTestingModule({
    providers: [
      MiService,
      { provide: getRepositoryToken(MiEntidad), useValue: repo }, // reemplaza @InjectRepository(MiEntidad)
    ],
  }).compile();
  service = module.get(MiService);
});

it('regla X: 400 si ...', async () => {
  repo.findOne.mockResolvedValue({ id: 1, status: 'SOLD' });              // lo que "devuelve la base"
  await expect(service.updateStatus(1, dto)).rejects.toThrow(BadRequestException); // esperar el error
  expect(repo.save).not.toHaveBeenCalled();                                // y que no guardó
});
```
- Varias llamadas al mismo método con resultados distintos → `.mockResolvedValueOnce(a).mockResolvedValueOnce(b)` (ver `cars.service.spec.ts:61-63`).
- `create` que devuelve lo que recibe → `repo.create.mockImplementation((data) => data)`.
- **Las pruebas de controlador** que genera Nest fallan si el servicio pide repositorios. Se arreglan con `providers: [{ provide: MiService, useValue: {} }]`.
- En el Taller 3 (Jest) es igual pero con `jest.fn()`.
