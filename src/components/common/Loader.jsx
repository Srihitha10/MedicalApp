import React from "react";

const Loader = ({ size = "medium", message = "Loading..." }) => {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`animate-spin rounded-full border-t-4 border-blue-500 border-opacity-50 border-b-4 border-blue-700 ${sizeClasses[size]}`}
      ></div>
      {message && (
        <p className="mt-4 text-gray-600 text-sm md:text-base">{message}</p>
      )}
    </div>
  );
};

export default Loader;
