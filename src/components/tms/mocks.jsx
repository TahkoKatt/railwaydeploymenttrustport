export const routes = [
  {
    id: 'r-001',
    name: 'Ruta Madrid Centro',
    status: 'planned',
    stops: [
      {
        id: 's-001',
        address: 'Calle Mayor 1, Madrid',
        type: 'pickup',
        timeWindow: { start: '2025-08-26T09:00:00Z', end: '2025-08-26T10:00:00Z' }
      },
      {
        id: 's-002',
        address: 'Calle Alcalá 100, Madrid',
        type: 'delivery',
        timeWindow: { start: '2025-08-26T11:00:00Z', end: '2025-08-26T12:00:00Z' }
      }
    ],
    vehicleId: 'v-001',
    driverId: 'd-001',
    estimatedDuration: 95
  },
  {
    id: 'r-002',
    name: 'Ruta BCN Norte',
    status: 'in_progress',
    stops: [
      {
        id: 's-003',
        address: 'Plaza Catalunya 1, Barcelona',
        type: 'pickup',
        timeWindow: { start: '2025-08-26T08:00:00Z', end: '2025-08-26T09:00:00Z' }
      },
      {
        id: 's-004',
        address: 'Av. Diagonal 450, Barcelona',
        type: 'delivery',
        timeWindow: { start: '2025-08-26T10:30:00Z', end: '2025-08-26T11:30:00Z' }
      }
    ],
    vehicleId: 'v-002',
    driverId: 'd-002',
    estimatedDuration: 130
  }
];

export const simulatorDefaults = { traffic: 0.1, speed: 0, dwell: 0 };

export const vehicles = [
  {
    id: 'v-001',
    plate: '1234ABC',
    model: 'Mercedes Actros',
    type: 'truck',
    capacity: 20000,
    status: 'available',
    mileage: 240000,
    nextMaintenance: '2025-09-15'
  },
  {
    id: 'v-002',
    plate: '5678DEF',
    model: 'Iveco Daily',
    type: 'van',
    capacity: 3500,
    status: 'in_maintenance',
    mileage: 92000,
    nextMaintenance: '2025-08-30'
  }
];

export const drivers = [
  {
    id: 'd-001',
    name: 'María Ortega',
    licenses: ['C'],
    status: 'available',
    hoursWorked: 4,
    nextAssignment: 'r-001'
  },
  {
    id: 'd-002',
    name: 'Luis Pérez',
    licenses: ['B'],
    status: 'assigned',
    hoursWorked: 6,
    nextAssignment: 'r-002'
  }
];

export const maintenances = [
  {
    id: 'm-101',
    vehicle: 'v-002',
    type: 'Cambio de aceite',
    date: '2025-08-30',
    status: 'scheduled',
    cost: 120,
    provider: 'Taller Norte'
  }
];

export const supplies = [
  {
    id: 'fuel-card',
    type: 'Diésel',
    brand: 'Repsol',
    qty: 1200,
    threshold: 800,
    lastPurchase: '2025-08-10',
    nextPurchase: '2025-08-27'
  }
];

export const pendingLoads = [
  {
    id: 'c-347',
    origin: 'Almacén A',
    dest: 'Cliente Z',
    weight: 1200,
    volume: 6.2
  }
];

export const liveVehicles = [
  {
    plate: '1234ABC',
    driver: 'María Ortega',
    route: 'Ruta Madrid Centro',
    status: 'moving',
    last: [40.4168,-3.7038],
    nextStop: 'Calle Alcalá 100',
    eta: '2025-08-26T11:10:00Z',
    speed: 62
  }
];

export const alerts = [
  {
    type: 'delay',
    subject: 'r-002',
    time: '10:42',
    desc: 'Retraso 25 min',
    status: 'open'
  },
  {
    type: 'deviation',
    subject: 'v-002',
    time: '10:48',
    desc: 'Desvío 5km',
    status: 'open'
  }
];

export const deliveries = [
  {
    number: 'E-456',
    client: 'Cliente X',
    address: 'Av. Reforma 120',
    window: '10:00–12:00',
    status: 'in_transit',
    actualTime: null,
    confirmation: null
  }
];

export const coldChain = [
  {
    plate: '1234ABC',
    load: 'Frescos',
    temperature: 5.3,
    humidity: 47,
    status: 'ok'
  }
];

export const chats = [
  {
    id: 't-1',
    participants: ['Backoffice', 'María'],
    last: 'Recibido, llegando en 15 min',
    time: '10:41'
  }
];

export const documents = [
  {
    type: 'Albarán',
    ref: 'ALB-001',
    date: '2025-08-25',
    party: 'Cliente X',
    status: 'pending'
  },
  {
    type: 'CMR',
    ref: 'CMR-990',
    date: '2025-08-24',
    party: 'Cliente Y',
    status: 'signed'
  }
];

export const signatures = {
  pending: [
    {
      type: 'Albarán',
      ref: 'ALB-001',
      client: 'Cliente X',
      sent: '2025-08-25',
      status: 'sent'
    }
  ],
  signed: [
    {
      type: 'CMR',
      ref: 'CMR-990',
      client: 'Cliente Y',
      date: '2025-08-24',
      signer: 'Juan'
    }
  ]
};

export const returnsAndIncidents = {
  returns: [
    {
      number: 'R-101',
      client: 'Cliente X',
      doc: 'ALB-001',
      reason: 'Daño',
      status: 'open'
    }
  ],
  incidents: [
    {
      number: 'I-77',
      type: 'Retraso',
      doc: 'E-456',
      date: '2025-08-25',
      status: 'investigating'
    }
  ]
};

export const kpis = {
  costPerKm: 0.68,
  fleetUtil: 0.74,
  onTime: 0.942,
  co2PerRoute: 18.6
};

export const costEvolution = [
  { date: '2025-08-01', cost: 0.73 },
  { date: '2025-08-08', cost: 0.70 },
  { date: '2025-08-15', cost: 0.68 }
];

export const realVsBudget = [
  { concept: 'Combustible', real: 12500, budget: 12000 },
  { concept: 'Peajes', real: 2100, budget: 2200 }
];

export const profitabilityByClient = [
  { client: 'ABC', revenue: 12000, cost: 8200 },
  { client: 'XYZ', revenue: 9800, cost: 9100 }
];

export const mockSocket = {
  on(event, cb) {
    if (event === 'tms.delivery.completed') {
      setInterval(() => cb({
        deliveryId: 'E-456',
        timestamp: new Date().toISOString()
      }), 15000);
    }
  },
  off() { /* no-op */ }
};