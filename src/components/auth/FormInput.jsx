const FormInput = ({ label, error, ...props }) => {
  return (
    <div>
      {label && (
        <label className="block text-dark-900 font-medium mb-1">{label}</label>
      )}
      <input
        className="w-full border border-gray-300 rounded-xl px-4 py-3"
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
