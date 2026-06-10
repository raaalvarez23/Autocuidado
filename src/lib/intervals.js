export const INTERVALS = [
  { name: 'Cambio de aceite',         icon: '🛢️',  min: 5000,  max: 10000, label: '5.000 - 10.000' },
  { name: 'Filtro de aceite',         icon: '🔧',  min: 5000,  max: 10000, label: 'Cada cambio de aceite' },
  { name: 'Filtro de aire',           icon: '💨',  min: 20000, max: 30000, label: '20.000 - 30.000' },
  { name: 'Filtro de combustible',    icon: '⛽',  min: 30000, max: 40000, label: '30.000 - 40.000' },
  { name: 'Filtro de cabina (polen)', icon: '🌿',  min: 15000, max: 20000, label: '15.000 - 20.000' },
  { name: 'Pastillas de freno',       icon: '🔴',  min: 30000, max: 50000, label: '30.000 - 50.000' },
  { name: 'Discos de freno',          icon: '🔴',  min: 60000, max: 80000, label: '60.000 - 80.000' },
  { name: 'Líquido de frenos',        icon: '💧',  min: 40000, max: 50000, label: '40.000 - 50.000 o 2 años' },
  { name: 'Líquido refrigerante',     icon: '🌡️',  min: 40000, max: 60000, label: '40.000 - 60.000' },
  { name: 'Neumáticos',               icon: '⚫',  min: 40000, max: 60000, label: '40.000 - 60.000' },
  { name: 'Rotación de neumáticos',   icon: '🔄',  min: 10000, max: 10000, label: '10.000' },
  { name: 'Batería',                  icon: '🔋',  min: 40000, max: 60000, label: '40.000 - 60.000 o 3-4 años' },
  { name: 'Bujías',                   icon: '⚡',  min: 40000, max: 60000, label: '40.000 - 60.000' },
  { name: 'Correa de distribución',   icon: '⚙️',  min: 60000, max: 100000,label: '60.000 - 100.000 ⚠️' },
  { name: 'Correa de accesorios',     icon: '🔗',  min: 60000, max: 80000, label: '60.000 - 80.000' },
  { name: 'Aceite de transmisión',    icon: '⚙️',  min: 60000, max: 100000,label: '60.000 - 100.000' },
  { name: 'Amortiguadores',           icon: '🔩',  min: 80000, max: 100000,label: '80.000 - 100.000' },
  { name: 'Alineación y balanceo',    icon: '🎯',  min: 10000, max: 15000, label: '10.000 - 15.000' },
]

export function getInterval(name) {
  return INTERVALS.find(i => i.name === name)
}

export function getNextKm(name, currentKm) {
  const i = getInterval(name)
  return currentKm + (i ? i.min : 10000)
}

export function calcStatus(partName, currentKm, records) {
  const interval = getInterval(partName)
  const intervalKm = interval?.min || 10000

  const partRecords = records
    .filter(r => r.part_name === partName)
    .sort((a, b) => b.km_at_service - a.km_at_service)

  const last = partRecords[0]
  if (!last) return { partName, status: 'no-record', lastKm: null, nextKm: null, remaining: null, percentUsed: 0, lastDate: null, interval: intervalKm }

  const remaining = last.next_km - currentKm
  const used = currentKm - last.km_at_service
  const percentUsed = Math.min(100, Math.round((used / intervalKm) * 100))
  const status = remaining <= 0 ? 'danger' : remaining <= 5000 ? 'warn' : 'ok'

  return { partName, status, lastKm: last.km_at_service, nextKm: last.next_km, remaining, percentUsed, lastDate: last.date, interval: intervalKm }
}

export function calcAllStatuses(currentKm, records) {
  return INTERVALS.map(i => calcStatus(i.name, currentKm, records))
}
