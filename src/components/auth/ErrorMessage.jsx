const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="text-red-500 text-sm mb-4 bg-red-100 p-3 rounded-lg border border-red-300">
      {message}
    </div>
  );
};

export default ErrorMessage;
