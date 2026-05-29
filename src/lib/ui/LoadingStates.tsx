/**
 * Loading State Components
 * Production-ready loading placeholders and skeletons
 */

/**
 * Login/Auth Loading State
 */
export function AuthLoadingState() {
  return (
    <div className="animate-pulse">
      <div className="space-y-4">
        {/* Email input skeleton */}
        <div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>

        {/* Password input skeleton */}
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>

        {/* Submit button skeleton */}
        <div className="h-10 bg-gray-300 rounded mt-6"></div>

        {/* Loading text */}
        <div className="text-center">
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard Loading State
 */
export function DashboardLoadingState() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-96"></div>
      </div>

      {/* Content cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-6 h-32"></div>
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-100 rounded h-20"></div>
        ))}
      </div>
    </div>
  );
}

/**
 * Appointment Booking Loading State
 */
export function AppointmentBookingLoadingState() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Doctor list skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>

      {/* Date/Time selection skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>

      {/* Submit button skeleton */}
      <div className="h-10 bg-gray-300 rounded mt-6"></div>
    </div>
  );
}

/**
 * List Loading Skeleton
 */
export function ListLoadingState({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-lg h-20"></div>
      ))}
    </div>
  );
}

/**
 * Spinner Component
 */
export function Spinner({ size = 'md', text = 'Loading...' }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
}

/**
 * Loading Overlay Component
 */
export function LoadingOverlay({ show = false, text = 'Loading...' }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 shadow-xl">
        <Spinner size="lg" text={text} />
      </div>
    </div>
  );
}

/**
 * Failed State Component with Retry
 */
export function FailedState({
  title,
  message,
  onRetry,
  isRetrying = false,
}: {
  title: string;
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}) {
  return (
    <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
      <div className="text-5xl text-red-600 mb-2">⚠</div>
      <h3 className="font-semibold text-lg text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded transition"
      >
        {isRetrying ? (
          <>
            <Spinner size="sm" />
            Retrying...
          </>
        ) : (
          '↻ Retry'
        )}
      </button>
    </div>
  );
}

/**
 * Empty State Component
 */
export function EmptyState({
  icon = '📭',
  title,
  message,
  action,
}: {
  icon?: string;
  title: string;
  message: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}) {
  return (
    <div className="text-center p-8">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>

      {action && (
        <div>
          {action.href ? (
            <a
              href={action.href}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition"
            >
              {action.label}
            </a>
          ) : (
            <button
              onClick={action.onClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
