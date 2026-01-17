const SearchInput = ({ placeholder = "Tìm kiếm...", value, onChange, onSubmit }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <div className="mb-4">
      <input 
        type="text" 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-full bg-white shadow-md px-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
      />
    </div>
  );
};

export default SearchInput;
