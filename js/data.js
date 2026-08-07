/* Datos ficticios para la demo, todo vive en memoria */

const DEPARTMENTS = {
  "Guatemala": ["Guatemala", "Mixco", "Villa Nueva"],
  "Zacapa": ["Zacapa", "Rio Hondo", "Gualan"],
  "Quetzaltenango": ["Quetzaltenango", "Coatepeque", "Salcaja"],
  "Escuintla": ["Escuintla", "Puerto San Jose", "Santa Lucia Cotz."],
  "Chiquimula": ["Chiquimula", "Esquipulas", "Ipala"],
};

const GRASS_TYPES = [
  { id: "g1", name: "Grama Sintetica Deportiva Premium", price: 120, unit: "m2" },
  { id: "g2", name: "Grama Sintetica Residencial Classic", price: 95, unit: "m2" },
  { id: "g3", name: "Grama Sintetica Paisajistica Soft", price: 85, unit: "m2" },
  { id: "g4", name: "Grama Sintetica Alto Transito Pro", price: 135, unit: "m2" },
  { id: "g5", name: "Grama Sintetica Putting Green Golf", price: 160, unit: "m2" },
];

const CATALOG = [
  { id: "p1", name: "Instalacion de gramilla", unit: "m2", price: 35, active: true },
  { id: "p2", name: "Transporte / flete", unit: "Unidad", price: 1250, active: true },
  { id: "p3", name: "Nivelacion de terreno", unit: "m2", price: 15, active: true },
  { id: "p4", name: "Excavacion", unit: "m3", price: 65, active: true },
  { id: "p5", name: "Drenaje frances", unit: "ML", price: 90, active: true },
  { id: "p6", name: "Geotextil", unit: "m2", price: 18, active: true },
  { id: "p7", name: "Grava 3/4", unit: "m3", price: 220, active: true },
  { id: "p8", name: "Base de cancha", unit: "m2", price: 45, active: true },
  { id: "p9", name: "Cerca perimetral", unit: "ML", price: 180, active: true },
  { id: "p10", name: "Marcaje de lineas deportivas", unit: "ML", price: 12, active: false },
];

const UNITS = ["m2", "ML", "m3", "Unidad", "Otros"];

const FREIGHT = [
  { id: "f1", dept: "Guatemala", muni: "Guatemala", zone: "Urbana", price: 600 },
  { id: "f2", dept: "Guatemala", muni: "Guatemala", zone: "Rural", price: 950 },
  { id: "f3", dept: "Zacapa", muni: "Zacapa", zone: "Urbana", price: 900 },
  { id: "f4", dept: "Zacapa", muni: "Zacapa", zone: "Rural", price: 1250 },
  { id: "f5", dept: "Quetzaltenango", muni: "Quetzaltenango", zone: "Urbana", price: 850 },
  { id: "f6", dept: "Quetzaltenango", muni: "Quetzaltenango", zone: "Rural", price: 1100 },
  { id: "f7", dept: "Escuintla", muni: "Escuintla", zone: "Urbana", price: 780 },
  { id: "f8", dept: "Escuintla", muni: "Escuintla", zone: "Rural", price: 1050 },
  { id: "f9", dept: "Chiquimula", muni: "Esquipulas", zone: "Rural", price: 1400 },
];

const PRICE_BY_ZONE = [
  { dept: "Guatemala", zone: "Urbana", price: 120 },
  { dept: "Guatemala", zone: "Rural", price: 130 },
  { dept: "Zacapa", zone: "Urbana", price: 115 },
  { dept: "Zacapa", zone: "Rural", price: 125 },
  { dept: "Quetzaltenango", zone: "Urbana", price: 118 },
  { dept: "Quetzaltenango", zone: "Rural", price: 128 },
];

const VENDORS = ["Carlos Vendedor", "Maria Lopez", "Diego Ramirez", "Ana Castillo", "Luis Morales"];

const USERS = [
  { id: "u1", name: "Administrador Demo", email: "admin@demo.com", role: "Administrador", status: "Activo" },
  { id: "u2", name: "Carlos Vendedor", email: "vendedor@demo.com", role: "Vendedor", status: "Activo" },
  { id: "u3", name: "Maria Lopez", email: "maria@demo.com", role: "Vendedor", status: "Activo" },
  { id: "u4", name: "Diego Ramirez", email: "diego@demo.com", role: "Vendedor", status: "Activo" },
  { id: "u5", name: "Ana Castillo", email: "ana@demo.com", role: "Vendedor", status: "Inactivo" },
];

const ROLES = ["Administrador", "Vendedor"];

const STATUSES = ["Borrador", "Pendiente", "Aprobada", "Programada", "Venta realizada", "Rechazada", "Cancelada"];

const PHOTOS = [
  "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=300&q=60",
  "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=300&q=60",
  "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=300&q=60",
];

/* Convertir una lista simple de partidas a partidas con total calculado */
function buildItems(list) {
  return list.map((it, i) => ({ id: "it" + i + Math.random().toString(36).slice(2, 6), ...it, total: it.qty * it.price }));
}

const INITIAL_QUOTES = [
  {
    id: "q1", code: "COT-0001", vendor: "Carlos Vendedor", date: "2026-07-10",
    client: { name: "Carlos Mendez", contact: "5555-5501" },
    location: { dept: "Zacapa", muni: "Zacapa", zone: "Rural" },
    area: 500, grassType: GRASS_TYPES[0].name, access: "Acceso vehicular directo", shape: "Regular", baseExisting: "Si",
    conditions: "El terreno presenta una superficie relativamente nivelada, sin obstaculos mayores.",
    observations: "Cliente solicita instalacion antes de fin de mes.",
    photos: PHOTOS,
    items: buildItems([
      { name: "Gramilla sintetica deportiva", qty: 500, unit: "m2", price: 120 },
      { name: "Instalacion", qty: 500, unit: "m2", price: 35 },
      { name: "Transporte", qty: 1, unit: "Unidad", price: 1250 },
      { name: "Nivelacion de terreno", qty: 500, unit: "m2", price: 15 },
    ]),
    discountPct: 5, manualAdjustment: 0, status: "Pendiente",
    history: [{ date: "2026-07-10", to: "Borrador", user: "Carlos Vendedor" }, { date: "2026-07-11", to: "Pendiente", user: "Carlos Vendedor" }],
  },
  {
    id: "q2", code: "COT-0002", vendor: "Maria Lopez", date: "2026-07-12",
    client: { name: "Municipalidad de Zacapa", contact: "7942-1100" },
    location: { dept: "Zacapa", muni: "Zacapa", zone: "Urbana" },
    area: 3200, grassType: GRASS_TYPES[3].name, access: "Acceso restringido", shape: "Irregular", baseExisting: "No",
    conditions: "Terreno de cancha municipal, requiere excavacion y drenaje.",
    observations: "Proyecto de obra deportiva municipal, avance por etapas.",
    photos: PHOTOS,
    items: buildItems([
      { name: "Base de cancha", qty: 3200, unit: "m2", price: 45 },
      { name: "Nivelacion", qty: 3200, unit: "m2", price: 15 },
      { name: "Excavacion", qty: 180, unit: "m3", price: 65 },
      { name: "Drenaje frances", qty: 240, unit: "ML", price: 90 },
      { name: "Geotextil", qty: 3200, unit: "m2", price: 18 },
      { name: "Grava 3/4", qty: 60, unit: "m3", price: 220 },
      { name: "Gramilla sintetica", qty: 3200, unit: "m2", price: 135 },
      { name: "Instalacion", qty: 3200, unit: "m2", price: 35 },
      { name: "Cerca perimetral", qty: 220, unit: "ML", price: 180 },
      { name: "Transporte", qty: 3, unit: "Unidad", price: 1250 },
    ]),
    discountPct: 8, manualAdjustment: -2000, status: "Aprobada",
    history: [{ date: "2026-07-12", to: "Borrador", user: "Maria Lopez" }, { date: "2026-07-20", to: "Aprobada", user: "Maria Lopez" }],
  },
  {
    id: "q3", code: "COT-0003", vendor: "Carlos Vendedor", date: "2026-07-14",
    client: { name: "Juan Perez", contact: "5555-5503" },
    location: { dept: "Quetzaltenango", muni: "Quetzaltenango", zone: "Urbana" },
    area: 120, grassType: GRASS_TYPES[1].name, access: "Acceso vehicular directo", shape: "Regular", baseExisting: "Si",
    conditions: "Jardin residencial, superficie plana.",
    observations: "",
    photos: PHOTOS.slice(0, 2),
    items: buildItems([
      { name: "Gramilla sintetica", qty: 120, unit: "m2", price: 95 },
      { name: "Instalacion", qty: 120, unit: "m2", price: 35 },
      { name: "Transporte", qty: 1, unit: "Unidad", price: 850 },
    ]),
    discountPct: 0, manualAdjustment: 0, status: "Venta realizada",
    history: [{ date: "2026-07-14", to: "Borrador", user: "Carlos Vendedor" }, { date: "2026-07-16", to: "Venta realizada", user: "Carlos Vendedor" }],
  },
  {
    id: "q4", code: "COT-0004", vendor: "Diego Ramirez", date: "2026-07-15",
    client: { name: "Colegio San Rafael", contact: "2222-3344" },
    location: { dept: "Guatemala", muni: "Mixco", zone: "Urbana" },
    area: 850, grassType: GRASS_TYPES[3].name, access: "Acceso vehicular directo", shape: "Regular", baseExisting: "No",
    conditions: "Cancha escolar, requiere base nueva.",
    observations: "Solicitan iniciar en vacaciones escolares.",
    photos: PHOTOS,
    items: buildItems([
      { name: "Base de cancha", qty: 850, unit: "m2", price: 45 },
      { name: "Gramilla sintetica", qty: 850, unit: "m2", price: 135 },
      { name: "Instalacion", qty: 850, unit: "m2", price: 35 },
      { name: "Transporte", qty: 1, unit: "Unidad", price: 600 },
    ]),
    discountPct: 3, manualAdjustment: 0, status: "Programada",
    history: [{ date: "2026-07-15", to: "Borrador", user: "Diego Ramirez" }, { date: "2026-07-22", to: "Programada", user: "Diego Ramirez" }],
  },
  {
    id: "q5", code: "COT-0005", vendor: "Ana Castillo", date: "2026-07-16",
    client: { name: "Restaurante Los Pinos", contact: "5555-5505" },
    location: { dept: "Escuintla", muni: "Escuintla", zone: "Urbana" },
    area: 60, grassType: GRASS_TYPES[2].name, access: "Acceso peatonal", shape: "Irregular", baseExisting: "Si",
    conditions: "Area de terraza, forma irregular.",
    observations: "",
    photos: [],
    items: buildItems([
      { name: "Gramilla sintetica", qty: 60, unit: "m2", price: 85 },
      { name: "Instalacion", qty: 60, unit: "m2", price: 35 },
    ]),
    discountPct: 0, manualAdjustment: 0, status: "Rechazada",
    history: [{ date: "2026-07-16", to: "Borrador", user: "Ana Castillo" }, { date: "2026-07-18", to: "Rechazada", user: "Ana Castillo" }],
  },
  {
    id: "q6", code: "COT-0006", vendor: "Luis Morales", date: "2026-07-18",
    client: { name: "Club Deportivo Antigua", contact: "7832-9911" },
    location: { dept: "Guatemala", muni: "Villa Nueva", zone: "Rural" },
    area: 1500, grassType: GRASS_TYPES[0].name, access: "Acceso vehicular directo", shape: "Regular", baseExisting: "No",
    conditions: "Cancha de futbol 7, requiere obra completa.",
    observations: "Cliente pidio cotizacion con y sin drenaje.",
    photos: PHOTOS,
    items: buildItems([
      { name: "Base de cancha", qty: 1500, unit: "m2", price: 45 },
      { name: "Drenaje frances", qty: 160, unit: "ML", price: 90 },
      { name: "Gramilla sintetica", qty: 1500, unit: "m2", price: 120 },
      { name: "Instalacion", qty: 1500, unit: "m2", price: 35 },
      { name: "Transporte", qty: 2, unit: "Unidad", price: 950 },
    ]),
    discountPct: 6, manualAdjustment: 0, status: "Pendiente",
    history: [{ date: "2026-07-18", to: "Pendiente", user: "Luis Morales" }],
  },
  {
    id: "q7", code: "COT-0007", vendor: "Maria Lopez", date: "2026-07-20",
    client: { name: "Hotel Ecologico Rio Verde", contact: "5555-5507" },
    location: { dept: "Chiquimula", muni: "Esquipulas", zone: "Rural" },
    area: 300, grassType: GRASS_TYPES[2].name, access: "Acceso vehicular limitado", shape: "Regular", baseExisting: "Si",
    conditions: "Zona de jardin frente al hotel.",
    observations: "",
    photos: PHOTOS.slice(0, 1),
    items: buildItems([
      { name: "Gramilla sintetica", qty: 300, unit: "m2", price: 85 },
      { name: "Instalacion", qty: 300, unit: "m2", price: 35 },
      { name: "Transporte", qty: 1, unit: "Unidad", price: 1400 },
    ]),
    discountPct: 0, manualAdjustment: 0, status: "Borrador",
    history: [{ date: "2026-07-20", to: "Borrador", user: "Maria Lopez" }],
  },
  {
    id: "q8", code: "COT-0008", vendor: "Carlos Vendedor", date: "2026-07-21",
    client: { name: "Iglesia Emanuel", contact: "5555-5508" },
    location: { dept: "Guatemala", muni: "Guatemala", zone: "Urbana" },
    area: 90, grassType: GRASS_TYPES[1].name, access: "Acceso vehicular directo", shape: "Regular", baseExisting: "Si",
    conditions: "Area verde frontal.",
    observations: "",
    photos: [],
    items: buildItems([
      { name: "Gramilla sintetica", qty: 90, unit: "m2", price: 95 },
      { name: "Instalacion", qty: 90, unit: "m2", price: 35 },
    ]),
    discountPct: 0, manualAdjustment: 0, status: "Cancelada",
    history: [{ date: "2026-07-21", to: "Borrador", user: "Carlos Vendedor" }, { date: "2026-07-23", to: "Cancelada", user: "Carlos Vendedor" }],
  },
  {
    id: "q9", code: "COT-0009", vendor: "Diego Ramirez", date: "2026-07-23",
    client: { name: "Residencial Las Flores", contact: "5555-5509" },
    location: { dept: "Quetzaltenango", muni: "Coatepeque", zone: "Rural" },
    area: 420, grassType: GRASS_TYPES[0].name, access: "Acceso vehicular directo", shape: "Regular", baseExisting: "No",
    conditions: "Area comunal del residencial.",
    observations: "Segunda etapa de proyecto residencial.",
    photos: PHOTOS,
    items: buildItems([
      { name: "Nivelacion", qty: 420, unit: "m2", price: 15 },
      { name: "Gramilla sintetica", qty: 420, unit: "m2", price: 120 },
      { name: "Instalacion", qty: 420, unit: "m2", price: 35 },
      { name: "Transporte", qty: 1, unit: "Unidad", price: 1100 },
    ]),
    discountPct: 4, manualAdjustment: 0, status: "Aprobada",
    history: [{ date: "2026-07-23", to: "Aprobada", user: "Diego Ramirez" }],
  },
  {
    id: "q10", code: "COT-0010", vendor: "Ana Castillo", date: "2026-07-25",
    client: { name: "Guarderia Pequenos Pasos", contact: "5555-5510" },
    location: { dept: "Zacapa", muni: "Rio Hondo", zone: "Rural" },
    area: 75, grassType: GRASS_TYPES[2].name, access: "Acceso peatonal", shape: "Regular", baseExisting: "Si",
    conditions: "Patio de juegos infantil.",
    observations: "Cliente solicita instalacion con bordes redondeados.",
    photos: PHOTOS.slice(0, 2),
    items: buildItems([
      { name: "Gramilla sintetica", qty: 75, unit: "m2", price: 85 },
      { name: "Instalacion", qty: 75, unit: "m2", price: 35 },
      { name: "Transporte", qty: 1, unit: "Unidad", price: 1250 },
    ]),
    discountPct: 0, manualAdjustment: 0, status: "Pendiente",
    history: [{ date: "2026-07-25", to: "Pendiente", user: "Ana Castillo" }],
  },
  {
    id: "q11", code: "COT-0011", vendor: "Luis Morales", date: "2026-07-28",
    client: { name: "Complejo Deportivo El Roble", contact: "5555-5511" },
    location: { dept: "Guatemala", muni: "Guatemala", zone: "Urbana" },
    area: 2100, grassType: GRASS_TYPES[3].name, access: "Acceso vehicular directo", shape: "Regular", baseExisting: "No",
    conditions: "Dos canchas multiuso, obra completa con drenaje y cerca.",
    observations: "Cliente corporativo, requiere factura y garantia extendida.",
    photos: PHOTOS,
    items: buildItems([
      { name: "Base de cancha", qty: 2100, unit: "m2", price: 45 },
      { name: "Excavacion", qty: 110, unit: "m3", price: 65 },
      { name: "Drenaje frances", qty: 180, unit: "ML", price: 90 },
      { name: "Geotextil", qty: 2100, unit: "m2", price: 18 },
      { name: "Gramilla sintetica", qty: 2100, unit: "m2", price: 135 },
      { name: "Instalacion", qty: 2100, unit: "m2", price: 35 },
      { name: "Cerca perimetral", qty: 200, unit: "ML", price: 180 },
      { name: "Transporte", qty: 2, unit: "Unidad", price: 600 },
    ]),
    discountPct: 7, manualAdjustment: -1500, status: "Pendiente",
    history: [{ date: "2026-07-28", to: "Pendiente", user: "Luis Morales" }],
  },
];
