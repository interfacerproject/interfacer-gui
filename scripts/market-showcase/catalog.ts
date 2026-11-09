// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// The marketplace showcase: invented designers, workshops and sellers (no
// real organisation), their own projects, what each workshop builds and what
// is on sale. Names and notes stay printable ASCII.

export interface ShowcasePerson {
  key: string;
  name: string;
  city?: { name: string; address: string; lat: number; lng: number; country: string };
}

export interface ShowcaseDesign {
  key: string;
  owner: string;
  name: string;
  note: string;
  license: string;
  tags: string[];
  drawing: string;
  requirements: {
    process: string[];
    materials: string[];
    max_dimensions_mm: { x: number; y: number; z: number };
    tolerance_mm: number;
    quantity: number;
  };
}

export interface ShowcaseService {
  key: string;
  owner: string;
  name: string;
  note: string;
  drawing: string;
  capabilities: {
    processes: string[];
    materials: string[];
    build_volume_mm: { x: number; y: number; z: number };
    min_tolerance_mm: number;
  };
  base_price_eur: number;
  per_unit_price_eur: number;
  // design key → [setup EUR, per piece EUR, lead days]
  builds: Record<string, [number, number, number]>;
}

export interface ShowcaseProduct {
  key: string;
  owner: string;
  name: string;
  note: string;
  drawing: string;
  price_eur: number;
  dims: string;
}

export const PEOPLE: ShowcasePerson[] = [
  { key: "giulia", name: "Giulia Ferraro" },
  { key: "marco", name: "Marco Rinaldi" },
  { key: "ana", name: "Ana Lima" },
  { key: "jonas", name: "Jonas Weber" },
  { key: "tomas", name: "Tomas Ruiz" },
  {
    key: "cavour",
    name: "Officina Cavour",
    city: { name: "Officina Cavour", address: "Via Cavour 31, 10123 Torino, Italy", lat: 45.0631, lng: 7.6854, country: "it" },
  },
  {
    key: "navigli",
    name: "Laboratorio Navigli",
    city: { name: "Laboratorio Navigli", address: "Alzaia Naviglio Grande 66, 20144 Milano, Italy", lat: 45.4513, lng: 9.1695, country: "it" },
  },
  {
    key: "nord",
    name: "Werkstatt Nord",
    city: { name: "Werkstatt Nord", address: "Ueberseetor 14, 28217 Bremen, Germany", lat: 53.0968, lng: 8.7745, country: "de" },
  },
  {
    key: "laserwerk",
    name: "Kreuzberg Laserwerk",
    city: { name: "Kreuzberg Laserwerk", address: "Ohlauer Strasse 38, 10999 Berlin, Germany", lat: 52.4967, lng: 13.4317, country: "de" },
  },
  {
    key: "poblenou",
    name: "Taller Poblenou",
    city: { name: "Taller Poblenou", address: "Carrer de Pujades 102, 08005 Barcelona, Spain", lat: 41.3989, lng: 2.1966, country: "es" },
  },
];

export const DESIGNS: ShowcaseDesign[] = [
  {
    key: "lamp",
    owner: "giulia",
    name: "Modular Lamp Shade",
    note: "Six PETG panels clip together around a standard E27 socket ring, no glue or screws. Print the panels flat, snap them into a cone, and swap any panel for another colour whenever you like. Version 1.3 tightened the clip tolerance so shades built by different makers fit together.",
    license: "CERN-OHL-S-2.0",
    tags: ["tag-lighting", "material-petg", "machine-3d-printer"],
    drawing: "lampshade",
    requirements: { process: ["fdm_3d_print"], materials: ["PETG"], max_dimensions_mm: { x: 120, y: 80, z: 60 }, tolerance_mm: 0.3, quantity: 2 },
  },
  {
    key: "mount",
    owner: "marco",
    name: "Bike Phone Mount",
    note: "A two-part handlebar mount for phones up to 80 mm wide. The clamp fits 22 to 32 mm bars and the cradle rotates in 90 degree steps. Print it in PETG so it survives sun and winter.",
    license: "CERN-OHL-P-2.0",
    tags: ["tag-cycling", "material-petg", "machine-3d-printer"],
    drawing: "phonemount",
    requirements: { process: ["fdm_3d_print"], materials: ["PETG"], max_dimensions_mm: { x: 90, y: 70, z: 40 }, tolerance_mm: 0.3, quantity: 1 },
  },
  {
    key: "clip",
    owner: "ana",
    name: "Cable Clip, set of 10",
    note: "Snap-on clips that hold one cable each under a desk or along a shelf. The flexure is tuned for PLA; a set of ten covers a typical workstation.",
    license: "CC0-1.0",
    tags: ["tag-home", "material-pla", "machine-3d-printer"],
    drawing: "cableclip",
    requirements: { process: ["fdm_3d_print"], materials: ["PLA"], max_dimensions_mm: { x: 30, y: 20, z: 12 }, tolerance_mm: 0.4, quantity: 10 },
  },
  {
    key: "picase",
    owner: "giulia",
    name: "Raspberry Pi 5 Case",
    note: "A ventilated two-shell case with cut-outs for every port and a slot for the active cooler. The lid snaps on; four printed feet keep it off the desk.",
    license: "CERN-OHL-S-2.0",
    tags: ["tag-electronics", "material-petg", "machine-3d-printer"],
    drawing: "picase",
    requirements: { process: ["fdm_3d_print"], materials: ["PETG"], max_dimensions_mm: { x: 98, y: 70, z: 32 }, tolerance_mm: 0.2, quantity: 1 },
  },
  {
    key: "tray",
    owner: "jonas",
    name: "Stackable Seed Tray",
    note: "A seed tray cut from 4 mm plywood sheets and assembled with finger joints. Trays stack four high with an air gap; the set of four parts makes one tray.",
    license: "CC-BY-SA-4.0",
    tags: ["tag-garden", "material-plywood", "machine-laser-cutter"],
    drawing: "seedtray",
    requirements: { process: ["laser_cutting"], materials: ["plywood 4 mm"], max_dimensions_mm: { x: 300, y: 200, z: 4 }, tolerance_mm: 0.5, quantity: 4 },
  },
  {
    key: "panel",
    owner: "nord",
    name: "Printer Enclosure Panel",
    note: "A clear side panel for enclosing a desktop 3D printer, with a window frame and four mounting holes. Two panels close both sides.",
    license: "CERN-OHL-W-2.0",
    tags: ["tag-workshop", "material-acrylic", "machine-laser-cutter"],
    drawing: "enclosure",
    requirements: { process: ["laser_cutting"], materials: ["acrylic 3 mm"], max_dimensions_mm: { x: 400, y: 300, z: 3 }, tolerance_mm: 0.2, quantity: 2 },
  },
  {
    key: "stool",
    owner: "tomas",
    name: "Three-leg Stool Tre",
    note: "A stool milled from one sheet of 18 mm birch plywood: a round seat, three legs and a ring, held by wedged joints. No hardware, flat-packed until you knock it together.",
    license: "CC-BY-SA-4.0",
    tags: ["tag-furniture", "material-birch-plywood", "machine-cnc"],
    drawing: "stool",
    requirements: { process: ["cnc_milling"], materials: ["birch plywood 18 mm"], max_dimensions_mm: { x: 450, y: 450, z: 18 }, tolerance_mm: 0.5, quantity: 1 },
  },
];

export const SERVICES: ShowcaseService[] = [
  {
    key: "cavour-fdm",
    owner: "cavour",
    name: "Officina Cavour - FDM printing",
    note: "A neighbourhood fab lab in San Salvario. Three FDM printers for PETG and PLA, pickup at the workshop or bike courier across Torino.",
    drawing: "printer",
    capabilities: { processes: ["fdm_3d_print"], materials: ["PETG", "PLA"], build_volume_mm: { x: 220, y: 220, z: 250 }, min_tolerance_mm: 0.2 },
    base_price_eur: 10,
    per_unit_price_eur: 4.5,
    builds: { lamp: [10, 4.5, 4], mount: [6, 3.4, 3], clip: [3, 0.38, 2], picase: [8, 6.9, 5] },
  },
  {
    key: "navigli-fdm",
    owner: "navigli",
    name: "Laboratorio Navigli - 3D printing",
    note: "Small-batch printing by the canal: FDM in PETG, PLA and TPU, ships across Italy.",
    drawing: "printer",
    capabilities: { processes: ["fdm_3d_print"], materials: ["PETG", "PLA", "TPU"], build_volume_mm: { x: 250, y: 210, z: 210 }, min_tolerance_mm: 0.2 },
    base_price_eur: 8,
    per_unit_price_eur: 5,
    builds: { lamp: [8, 5.2, 6], mount: [5, 4.4, 4], picase: [6, 7.5, 6] },
  },
  {
    key: "nord-shop",
    owner: "nord",
    name: "Werkstatt Nord - print and laser",
    note: "A Bremen workshop with a large-format FDM printer and a laser cutter. Ships across the EU.",
    drawing: "lasercutter",
    capabilities: {
      processes: ["fdm_3d_print", "laser_cutting"],
      materials: ["PETG", "PLA", "plywood 4 mm", "acrylic 3 mm"],
      build_volume_mm: { x: 600, y: 400, z: 400 },
      min_tolerance_mm: 0.1,
    },
    base_price_eur: 15,
    per_unit_price_eur: 4,
    builds: { lamp: [15, 3.9, 9], panel: [20, 14, 7], tray: [6, 1.25, 5] },
  },
  {
    key: "laserwerk",
    owner: "laserwerk",
    name: "Kreuzberg Laserwerk - laser cutting",
    note: "Laser cutting in plywood, acrylic and MDF on a 1000 x 600 mm bed, same-week turnaround in Berlin.",
    drawing: "lasercutter",
    capabilities: {
      processes: ["laser_cutting"],
      materials: ["plywood 4 mm", "acrylic 3 mm", "MDF 6 mm"],
      build_volume_mm: { x: 1000, y: 600, z: 20 },
      min_tolerance_mm: 0.2,
    },
    base_price_eur: 5,
    per_unit_price_eur: 1.5,
    builds: { tray: [5, 1.5, 3], panel: [18, 15, 5] },
  },
  {
    key: "poblenou-cnc",
    owner: "poblenou",
    name: "Taller Poblenou - CNC milling",
    note: "A furniture collective with a 2500 x 1250 mm CNC router for sheet goods.",
    drawing: "cnc",
    capabilities: {
      processes: ["cnc_milling"],
      materials: ["birch plywood 18 mm"],
      build_volume_mm: { x: 2500, y: 1250, z: 100 },
      min_tolerance_mm: 0.5,
    },
    base_price_eur: 40,
    per_unit_price_eur: 22,
    builds: { stool: [40, 22, 6] },
  },
];

export const PRODUCTS: ShowcaseProduct[] = [
  {
    key: "printer",
    owner: "nord",
    name: "Benchtop 3D Printer, kit",
    note: "An open-hardware FDM printer kit: aluminium frame, 300 x 300 x 400 mm build volume, 0.4 mm nozzle. Assembly guide and wiring diagrams included.",
    drawing: "printer",
    price_eur: 1249,
    dims: "500 x 500 x 640 mm",
  },
  {
    key: "laser",
    owner: "nord",
    name: "Desktop Laser Cutter",
    note: "A 40 W desktop laser cutter with a 600 x 400 mm bed, air assist and an enclosed, interlocked lid.",
    drawing: "lasercutter",
    price_eur: 799,
    dims: "bed 600 x 400 mm",
  },
  {
    key: "parts",
    owner: "nord",
    name: "Printer Spare Parts Set",
    note: "42 spare parts for the benchtop printer: bearings, bolts, nuts, belts and a spare nozzle.",
    drawing: "spareparts",
    price_eur: 39,
    dims: "42 parts",
  },
  {
    key: "lamp-made",
    owner: "cavour",
    name: "Modular Lamp Shade, ready-made",
    note: "A Modular Lamp Shade printed and assembled at Officina Cavour in white PETG, with its E27 ring.",
    drawing: "lampshade",
    price_eur: 38,
    dims: "diameter 240 x 180 mm",
  },
  {
    key: "tray-made",
    owner: "laserwerk",
    name: "Stackable Seed Tray, set of 4",
    note: "Four seed trays cut and assembled in Berlin from 4 mm birch plywood, oiled.",
    drawing: "seedtray",
    price_eur: 24,
    dims: "4 x 300 x 200 mm",
  },
  {
    key: "stool-made",
    owner: "poblenou",
    name: "Three-leg Stool Tre, oiled birch",
    note: "The Tre stool milled and finished at Taller Poblenou, oiled birch plywood.",
    drawing: "stool",
    price_eur: 89,
    dims: "seat height 450 mm",
  },
];
