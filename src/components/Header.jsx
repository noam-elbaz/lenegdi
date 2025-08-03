import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Header({ user }) {
  const { signOut } = useAuth();
  const location = useLocation();

  // Determine which admin tab is active based on route
  const getActiveTabFromRoute = () => {
    switch (location.pathname) {
      case '/upload':
      case '/login': // /login defaults to upload when logged in
        return 'upload';
      case '/manage':
        return 'manage';
      case '/analytics':
        return 'analytics';
      default:
        return null; // No tab active when not on admin routes
    }
  };

  const currentActiveTab = getActiveTabFromRoute();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-stretch h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 cursor-pointer">
              <div className="text-left">
                <h1 className="text-xl font-semibold text-gray-900">L'Negdi Tamid</h1>
                <span className="text-sm text-gray-500">Audio Classes</span>
              </div>
            </Link>
          </div>

          <div className="flex items-stretch space-x-6">
            {/* Admin tabs - shown when user is logged in */}
            {user && (
              <nav className="flex space-x-6">
                {[
                  { id: 'upload', label: 'Upload', route: '/upload' },
                  { id: 'manage', label: 'Manage', route: '/manage' },
                  { id: 'analytics', label: 'Analytics', route: '/analytics' }
                ].map(tab => (
                  <Link
                    key={tab.id}
                    to={tab.route}
                    className={`flex items-center whitespace-nowrap px-1 border-b-2 font-medium text-sm ${currentActiveTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </nav>
            )}

            <div className="flex items-center">
              {/* Auth buttons */}
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Log out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;