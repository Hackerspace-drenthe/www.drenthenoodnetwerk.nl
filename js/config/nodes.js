/**
 * Nodes — Node-locaties en status data voor de Drenthe-kaart.
 * Coördinaten zijn relatief binnen de SVG-kaart (0-100 schaal).
 */

const NODE_STATUS = {
  PLANNED: 'planned',
  ACTIVE: 'active',
  OFFLINE: 'offline',
  PROTOTYPE: 'prototype',
};

const NODE_TYPES = {
  CLIENT: 'client',
  ROUTER: 'router',
  REPEATER: 'repeater',
  SOLAR: 'solar',
};

/**
 * Node-locaties. Wordt uitgebreid naarmate het project vordert.
 * x/y: positie in SVG viewBox (0-500 x, 0-600 y) van drenthe-map.svg.
 * bereik: geschat bereik in km.
 * connections: array van id's waarmee deze node verbinding heeft.
 */
const NODES = [
  {
    id: 'coevorden-01',
    name: 'Hackerspace Coevorden',
    description: 'Thuisbasis — De Nieuwe Veste',
    type: NODE_TYPES.ROUTER,
    status: NODE_STATUS.PLANNED,
    x: 245,
    y: 460,
    bereik: 10,
    connections: ['coevorden-02', 'emmen-01'],
  },
  {
    id: 'coevorden-02',
    name: 'Coevorden Kasteel',
    description: 'Hoog punt in centrum Coevorden',
    type: NODE_TYPES.REPEATER,
    status: NODE_STATUS.PLANNED,
    x: 270,
    y: 430,
    bereik: 12,
    connections: ['coevorden-01', 'emmen-01', 'hoogeveen-01'],
  },
  {
    id: 'emmen-01',
    name: 'Emmen Centrum',
    description: 'Geplande node nabij centrum Emmen',
    type: NODE_TYPES.ROUTER,
    status: NODE_STATUS.PLANNED,
    x: 350,
    y: 380,
    bereik: 10,
    connections: ['coevorden-01', 'coevorden-02', 'borger-01'],
  },
  {
    id: 'hoogeveen-01',
    name: 'Hoogeveen Toren',
    description: 'Hoog punt in Hoogeveen',
    type: NODE_TYPES.SOLAR,
    status: NODE_STATUS.PLANNED,
    x: 175,
    y: 315,
    bereik: 12,
    connections: ['coevorden-02', 'midden-01'],
  },
  {
    id: 'assen-01',
    name: 'Assen Centrum',
    description: 'Provinciale hoofdstad',
    type: NODE_TYPES.ROUTER,
    status: NODE_STATUS.PLANNED,
    x: 235,
    y: 170,
    bereik: 10,
    connections: ['midden-01', 'tynaarlo-01'],
  },
  {
    id: 'midden-01',
    name: 'Beilen',
    description: 'Centraal knooppunt Midden-Drenthe',
    type: NODE_TYPES.REPEATER,
    status: NODE_STATUS.PLANNED,
    x: 210,
    y: 240,
    bereik: 15,
    connections: ['assen-01', 'hoogeveen-01', 'westerveld-01'],
  },
  {
    id: 'borger-01',
    name: 'Borger Hunebedcentrum',
    description: 'Node bij het Hunebedcentrum',
    type: NODE_TYPES.SOLAR,
    status: NODE_STATUS.PLANNED,
    x: 385,
    y: 280,
    bereik: 12,
    connections: ['emmen-01', 'aa-hunze-01'],
  },
  {
    id: 'aa-hunze-01',
    name: 'Gieten',
    description: 'Noordoost Drenthe knooppunt',
    type: NODE_TYPES.REPEATER,
    status: NODE_STATUS.PLANNED,
    x: 390,
    y: 140,
    bereik: 12,
    connections: ['borger-01', 'tynaarlo-01'],
  },
  {
    id: 'tynaarlo-01',
    name: 'Zuidlaren',
    description: 'Node bij Zuidlaren',
    type: NODE_TYPES.CLIENT,
    status: NODE_STATUS.PLANNED,
    x: 290,
    y: 90,
    bereik: 8,
    connections: ['assen-01', 'aa-hunze-01'],
  },
  {
    id: 'westerveld-01',
    name: 'Diever',
    description: 'Westelijk knooppunt',
    type: NODE_TYPES.SOLAR,
    status: NODE_STATUS.PLANNED,
    x: 95,
    y: 210,
    bereik: 15,
    connections: ['midden-01', 'noordenveld-01'],
  },
  {
    id: 'noordenveld-01',
    name: 'Roden',
    description: 'Noordwest Drenthe',
    type: NODE_TYPES.REPEATER,
    status: NODE_STATUS.PLANNED,
    x: 130,
    y: 80,
    bereik: 12,
    connections: ['westerveld-01', 'assen-01'],
  },
  {
    id: 'meppel-01',
    name: 'Meppel',
    description: 'Zuidwest toegangspunt',
    type: NODE_TYPES.CLIENT,
    status: NODE_STATUS.PLANNED,
    x: 70,
    y: 445,
    bereik: 8,
    connections: ['hoogeveen-01'],
  },
];
