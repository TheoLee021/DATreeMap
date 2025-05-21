import { useState } from 'react';

function FilterPanel({ onApplyFilters, totalCount }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filters, setFilters] = useState({
    common_name: '',
    tag_number: '',
    height_min: '',
    height_max: '',
  });
  const [filteredCount, setFilteredCount] = useState(totalCount);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = onApplyFilters(filters);
    setFilteredCount(result.filteredCount);
  };

  const handleReset = () => {
    const resetFilters = {
      common_name: '',
      tag_number: '',
      height_min: '',
      height_max: '',
    };
    setFilters(resetFilters);
    const result = onApplyFilters(resetFilters);
    setFilteredCount(result.filteredCount);
  };

  return (
    <div className="absolute top-4 right-4 z-10 bg-white rounded-md shadow-lg overflow-hidden w-72">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 font-medium text-primary-dark hover:bg-gray-100 transition"
      >
        {isExpanded ? 'Hide Filters' : 'Show Filters'}
      </button>
      
      {isExpanded && (
        <div className="p-4">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Filter Trees</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block font-medium text-gray-700 mb-1">
                Common Name
              </label>
              <input
                type="text"
                name="common_name"
                value={filters.common_name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                placeholder="e.g. Oak, Pine"
              />
            </div>
            
            <div className="mb-3">
              <label className="block font-medium text-gray-700 mb-1">
                Tag Number
              </label>
              <input
                type="text"
                name="tag_number"
                value={filters.tag_number}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                placeholder="e.g. 101, 305"
              />
            </div>
            
            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-1">
                Height (ft)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="height_min"
                  value={filters.height_min}
                  onChange={handleInputChange}
                  className="w-1/2 p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  placeholder="Min"
                />
                <input
                  type="number"
                  name="height_max"
                  value={filters.height_max}
                  onChange={handleInputChange}
                  className="w-1/2 p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  placeholder="Max"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-primary text-white py-2 rounded hover:bg-primary-dark transition"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
              >
                Reset
              </button>
            </div>
          </form>
          
          <div className="mt-3 text-center text-sm text-gray-600">
            Showing {filteredCount} of {totalCount} trees
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterPanel; 