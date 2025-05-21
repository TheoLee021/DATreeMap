function About() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">About De Anza Campus Tree Map</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-4">Project Overview</h2>
        <p className="mb-4">
          The De Anza Campus Tree Map is an interactive digital catalog of trees located on the 
          De Anza College campus. This project aims to document and raise awareness about the 
          diverse tree species that contribute to our campus ecosystem.
        </p>
        <p>
          By mapping and cataloging these trees, we hope to promote environmental stewardship 
          and provide a valuable resource for students, faculty, and community members interested 
          in learning more about urban forestry and campus biodiversity.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-primary mb-3">Our Mission</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Document and catalog all tree species on campus</li>
            <li>Monitor tree health and growth over time</li>
            <li>Educate the community about local biodiversity</li>
            <li>Provide data for environmental research</li>
            <li>Support campus sustainability initiatives</li>
          </ul>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-primary mb-3">How to Use the Map</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Zoom in to see individual trees</li>
            <li>Click on tree markers for detailed information</li>
            <li>Use the filter panel to search for specific trees</li>
            <li>Different zoom levels show campus regions</li>
            <li>Tree health status is color-coded for easy reference</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-4">Get Involved</h2>
        <p className="mb-4">
          We welcome contributions from students, faculty, and community members who are 
          interested in helping with tree identification, data collection, and map maintenance.
        </p>
        <p>
          If you'd like to get involved or have information about trees that should be 
          added to our database, please contact the Environmental Monitoring Society 
          or the Biology Department.
        </p>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-primary mb-4">Acknowledgments</h2>
        <p className="mb-4">
          This project was developed by the Environmental Monitoring Society in collaboration 
          with the Biology Department and the Office of College Operations.
        </p>
        <p>
          Special thanks to all students and faculty who have contributed to the data collection 
          and development of this resource.
        </p>
      </div>
    </div>
  );
}

export default About;