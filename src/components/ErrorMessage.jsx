function ErrorMessage({ 
  title = 'Error', 
  message, 
  onRetry, 
  onDismiss,
  type = 'error' // 'error', 'warning', 'info'
}) {
  const typeStyles = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      message: 'text-red-700',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      message: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }
  };

  const styles = typeStyles[type];
  const iconMap = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`rounded-md p-4 border ${styles.container}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className={`text-lg ${styles.icon}`}>
            {iconMap[type]}
          </span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {title}
          </h3>
          {message && (
            <div className={`mt-2 text-sm ${styles.message}`}>
              <p>{message}</p>
            </div>
          )}
          {(onRetry || onDismiss) && (
            <div className="mt-4 flex space-x-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={`text-white px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.button}`}
                >
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.icon} hover:bg-gray-100`}
              >
                <span className="sr-only">Dismiss</span>
                <span className="h-5 w-5">✕</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PageError({ title, message, onRetry }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <ErrorMessage 
          title={title}
          message={message}
          onRetry={onRetry}
          type="error"
        />
      </div>
    </div>
  );
}

export function InlineError({ message, onDismiss }) {
  return (
    <div className="mb-4">
      <ErrorMessage 
        title="Error"
        message={message}
        onDismiss={onDismiss}
        type="error"
      />
    </div>
  );
}

export default ErrorMessage;