import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container-main py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="btn btn-primary px-8 py-3 text-lg font-medium"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage; 