const Banner = ({ img, title, buttonText, onButtonClick }) => {
  return (
    <div className="relative">
      <img 
        src={img} 
        alt={title}
        className="rounded-2xl w-full h-60 object-cover shadow-lg" 
      />
      <div className="absolute bottom-6 left-6 text-white font-bold text-3xl drop-shadow-xl">
        {title}
      </div>
      <button 
        onClick={onButtonClick}
        className="absolute bottom-4 left-6 bg-primary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-600 transition-colors"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default Banner;
