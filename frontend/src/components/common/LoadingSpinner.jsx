const LoadingSpinner = ({ message = "Loading...", size = "medium", className = "" }) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-16 h-16"
  };

  const spinnerClass = `animate-spin rounded-full border-4 border-gray-300 border-t-black ${sizeClasses[size]} ${className}`;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={spinnerClass}></div>
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;