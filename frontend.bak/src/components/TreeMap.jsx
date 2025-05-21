import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import { fetchTrees } from '../services/api';
import { filterTrees } from '../services/api';
import { MAP_CONFIG, CLUSTER_AREAS, COMBINED_AREA } from '../config';
import FilterPanel from './FilterPanel';
import TreePopup from './TreePopup';

// Fix for Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom tree icon
const treeIcon = L.divIcon({
  className: 'tree-marker',
  html: '<div class="tree-dot"></div>',
  iconSize: [12, 12]
});

function TreeMap() {
  const [treeData, setTreeData] = useState(null);
  const [filteredTrees, setFilteredTrees] = useState([]);
  const [selectedTree, setSelectedTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const markersLayerRef = useRef(null);
  const polygonLayersRef = useRef({});
  
  // Fetch tree data on component mount
  useEffect(() => {
    const loadTreeData = async () => {
      try {
        setLoading(true);
        const data = await fetchTrees();
        setTreeData(data);
        setFilteredTrees(data.features);
        setLoading(false);
      } catch (err) {
        setError('Failed to load tree data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadTreeData();
  }, []);
  
  // Apply filters to tree data
  const handleApplyFilters = (filters) => {
    if (!treeData) return { filteredCount: 0 };
    
    const filtered = filterTrees(treeData, filters);
    setFilteredTrees(filtered);
    
    return {
      filteredCount: filtered.length
    };
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-130px)]">
        <div className="text-xl font-semibold">Loading tree data...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-130px)]">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-[calc(100vh-130px)]">
      <MapContainer
        center={MAP_CONFIG.CENTER}
        zoom={MAP_CONFIG.DEFAULT_ZOOM}
        maxZoom={MAP_CONFIG.MAX_ZOOM}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={20}
        />
        
        {/* Map manager component to handle zoom-dependent visibility */}
        <MapManager 
          treeData={filteredTrees} 
          markersLayerRef={markersLayerRef}
          polygonLayersRef={polygonLayersRef}
          onSelectTree={setSelectedTree}
        />
        
        {/* Render selected tree popup */}
        {selectedTree && (
          <TreePopup 
            tree={selectedTree} 
            onClose={() => setSelectedTree(null)} 
          />
        )}
      </MapContainer>
      
      {/* Filter panel */}
      <FilterPanel 
        onApplyFilters={handleApplyFilters} 
        totalCount={treeData ? treeData.features.length : 0}
      />
    </div>
  );
}

// Component to manage the map layers based on zoom level
function MapManager({ treeData, markersLayerRef, polygonLayersRef, onSelectTree }) {
  const map = useMap();
  
  useEffect(() => {
    if (!treeData) return;
    
    // Create marker cluster groups
    const combinedCluster = L.markerClusterGroup({
      disableClusteringAtZoom: MAP_CONFIG.ZOOM_LEVELS.MARKERS_ONLY,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 80,
      iconCreateFunction: createClusterIcon(COMBINED_AREA.style.fillColor)
    });
    
    // Create area clusters for each defined area
    const areaClusters = {};
    CLUSTER_AREAS.forEach(area => {
      areaClusters[area.name] = L.markerClusterGroup({
        disableClusteringAtZoom: MAP_CONFIG.ZOOM_LEVELS.MARKERS_ONLY,
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        maxClusterRadius: 80,
        iconCreateFunction: createClusterIcon(area.style.fillColor)
      });
    });
    
    // Create polygons for areas
    const combinedPolygon = L.polygon(COMBINED_AREA.polygon, {
      color: COMBINED_AREA.style.color,
      fillColor: COMBINED_AREA.style.fillColor,
      fillOpacity: 0.2,
      weight: 2
    });
    
    const areaPolygons = {};
    CLUSTER_AREAS.forEach(area => {
      areaPolygons[area.name] = L.polygon(area.polygon, {
        color: area.style.color,
        fillColor: area.style.fillColor,
        fillOpacity: 0.2,
        weight: 2
      });
    });
    
    // Add trees to appropriate clusters based on location
    treeData.forEach(feature => {
      if (!feature.geometry || !feature.geometry.coordinates) return;
      
      const latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
      const marker = L.marker(latlng, { icon: treeIcon });
      
      // Add popup with basic info
      marker.bindPopup(`
        <div>
          <h3 class="font-bold">${feature.properties.common_name}</h3>
          <p class="text-sm italic">${feature.properties.botanical_name}</p>
          <p>Tag: ${feature.properties.tag_number}</p>
          <button class="mt-2 px-2 py-1 bg-primary text-white text-xs rounded">View Details</button>
        </div>
      `);
      
      // Handle click to show detailed info
      marker.on('click', () => {
        onSelectTree(feature);
      });
      
      // Add to combined cluster
      combinedCluster.addLayer(marker);
      
      // Add to area clusters if inside area
      CLUSTER_AREAS.forEach(area => {
        if (isPointInPolygon(latlng, area.polygon)) {
          areaClusters[area.name].addLayer(marker);
        }
      });
    });
    
    // Add all clusters and polygons to map
    combinedCluster.addTo(map);
    combinedPolygon.addTo(map);
    
    // Store references
    markersLayerRef.current = {
      combined: combinedCluster,
      areas: areaClusters
    };
    
    polygonLayersRef.current = {
      combined: combinedPolygon,
      areas: areaPolygons
    };
    
    // Set up zoom handler to show/hide layers
    const updateLayers = () => {
      const zoom = map.getZoom();
      
      if (zoom < MAP_CONFIG.ZOOM_LEVELS.SEPARATE) {
        // Show combined view
        map.addLayer(combinedCluster);
        map.addLayer(combinedPolygon);
        
        // Hide area views
        Object.values(areaClusters).forEach(cluster => {
          map.removeLayer(cluster);
        });
        
        Object.values(areaPolygons).forEach(polygon => {
          map.removeLayer(polygon);
        });
      } else {
        // Hide combined view
        map.removeLayer(combinedCluster);
        map.removeLayer(combinedPolygon);
        
        // Show area views
        Object.entries(areaClusters).forEach(([name, cluster]) => {
          map.addLayer(cluster);
        });
        
        if (zoom < MAP_CONFIG.ZOOM_LEVELS.MARKERS_ONLY) {
          Object.entries(areaPolygons).forEach(([name, polygon]) => {
            map.addLayer(polygon);
          });
        } else {
          Object.entries(areaPolygons).forEach(([name, polygon]) => {
            map.removeLayer(polygon);
          });
        }
      }
    };
    
    // Initialize layers
    updateLayers();
    
    // Set up zoom change handler
    map.on('zoomend', updateLayers);
    
    // Cleanup
    return () => {
      map.off('zoomend', updateLayers);
      map.removeLayer(combinedCluster);
      map.removeLayer(combinedPolygon);
      
      Object.values(areaClusters).forEach(cluster => {
        map.removeLayer(cluster);
      });
      
      Object.values(areaPolygons).forEach(polygon => {
        map.removeLayer(polygon);
      });
    };
  }, [map, treeData, onSelectTree]);
  
  return null;
}

// Helper function to create cluster icons
function createClusterIcon(color) {
  return function(cluster) {
    const count = cluster.getChildCount();
    let size, className;
    
    if (count < 100) {
      size = 40;
      className = 'custom-cluster-small';
    } else if (count < 500) {
      size = 50;
      className = 'custom-cluster-medium';
    } else {
      size = 60;
      className = 'custom-cluster-large';
    }
    
    return new L.DivIcon({
      html: `
        <div style="background-color: ${color}; width: 100%; height: 100%; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <span class="cluster-count">${count}</span>
          <span class="area-name">trees</span>
        </div>
      `,
      className: `custom-cluster ${className}`,
      iconSize: new L.Point(size, size)
    });
  };
}

// Helper function to check if a point is inside a polygon
function isPointInPolygon(point, polygon) {
  // Ray casting algorithm
  const x = point[1];
  const y = point[0];
  
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1];
    const yi = polygon[i][0];
    const xj = polygon[j][1];
    const yj = polygon[j][0];
    
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

export default TreeMap; 