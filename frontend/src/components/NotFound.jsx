import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-2xl text-gray-700 mb-8">Page Not Found</p>
      <p className="text-lg text-gray-600 text-center max-w-lg mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition shadow-md"
      >
        Return to Map
      </Link>
    </div>
  );
}

export default NotFound; 