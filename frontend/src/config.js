// Map configuration
export const MAP_CONFIG = {
  CENTER: [37.31930349325796, -122.04499476044137],
  DEFAULT_ZOOM: 16,
  MAX_ZOOM: 20,
  ZOOM_LEVELS: {
    COMBINED: 17,     // Below 17: Show combined view
    SEPARATE: 17,     // 17 and above: Show separate areas
    MARKERS_ONLY: 18  // 18 and above: Show markers only, no areas
  }
};

// Define cluster areas
export const CLUSTER_AREAS = [
  {
    name: "West Campus",
    polygon: [
      [37.318, -122.048],
      [37.322719, -122.049764],
      [37.322753, -122.045215],
      [37.318, -122.045215]
    ],
    style: {
      className: 'custom-cluster custom-cluster-west',
      color: '#1B5E20',
      fillColor: '#1B5E20'
    }
  },
  {
    name: "East Campus",
    polygon: [
      [37.318, -122.045215],
      [37.322753, -122.045215], 
      [37.322745, -122.04157],
      [37.318, -122.04157]
    ],
    style: {
      className: 'custom-cluster custom-cluster-east',
      color: '#0b6a3c',
      fillColor: '#0b6a3c'
    }
  },
  {
    name: "South Campus",
    polygon: [
      [37.315603, -122.046578],
      [37.318, -122.048],
      [37.318, -122.04157],
      [37.315603, -122.04157]
    ],
    style: {
      className: 'custom-cluster custom-cluster-south',
      color: '#006633',
      fillColor: '#006633'
    }
  }
];

// Combined area covering the entire campus
export const COMBINED_AREA = {
  name: "De Anza College",
  polygon: [
    [37.315603, -122.046578],
    [37.318, -122.048],
    [37.322753, -122.049764],
    [37.322753, -122.04157],
    [37.315603, -122.04157]
  ],
  style: {
    className: 'custom-cluster custom-cluster-combined',
    color: '#1B5E20',
    fillColor: '#1B5E20'
  }
}; 