import { useEffect, useRef } from 'react';

function TreePopup({ tree, onClose }) {
  const modalRef = useRef(null);
  const properties = tree.properties;
  
  useEffect(() => {
    // Handle outside click to close modal
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    // Handle escape key to close modal
    function handleEscKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    
    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
      >
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {properties.common_name}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4">
          <p className="text-lg italic text-gray-600 mb-4">
            {properties.botanical_name}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold text-gray-700 mb-2">Identification</h3>
              <p><span className="font-medium">Tag Number:</span> {properties.tag_number}</p>
              {properties.alternate_tag && (
                <p><span className="font-medium">Alternative Tag:</span> {properties.alternate_tag}</p>
              )}
              {properties.quantity > 1 && (
                <p><span className="font-medium">Quantity:</span> {properties.quantity}</p>
              )}
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold text-gray-700 mb-2">Measurements</h3>
              {properties.height && (
                <p><span className="font-medium">Height:</span> {properties.height}</p>
              )}
              {properties.diameter && (
                <p><span className="font-medium">Diameter:</span> {properties.diameter}</p>
              )}
              {properties.crown_height && (
                <p><span className="font-medium">Crown Height:</span> {properties.crown_height}</p>
              )}
              {properties.crown_spread && (
                <p><span className="font-medium">Crown Spread:</span> {properties.crown_spread}</p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-bold text-gray-700 mb-2">Health Status</h3>
            <div className="relative pt-1">
              <div className="flex items-center justify-between">
                <div className="mb-1">
                  <span className="font-medium text-green-700">{properties.health || 'Not assessed'}</span>
                </div>
                {properties.last_update && (
                  <div className="text-sm text-gray-500">
                    Last updated: {properties.last_update}
                  </div>
                )}
              </div>
              {properties.health && (
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                  <div
                    style={{ 
                      width: properties.health.includes('80%') ? '80%' : 
                             properties.health.includes('60%') ? '60%' : 
                             properties.health.includes('40%') ? '40%' : 
                             properties.health.includes('20%') ? '20%' : 
                             properties.health.includes('0%') ? '0%' : '0%' 
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600"
                  ></div>
                </div>
              )}
            </div>
          </div>
          
          {properties.notes && (
            <div className="mb-4">
              <h3 className="font-bold text-gray-700 mb-2">Notes</h3>
              <p className="text-gray-700 whitespace-pre-line">{properties.notes}</p>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                Close
              </button>
              <a
                href={`/admin/trees/tree/${properties.tag_number}/change/`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
              >
                Edit in Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TreePopup; 