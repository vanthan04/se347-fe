import { useState } from 'react';

const ServiceCard = ({ name, img, onFavoriteClick, isFavorited = false }) => {
  const [isFavorite, setIsFavorite] = useState(isFavorited);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onFavoriteClick) {
      onFavoriteClick(!isFavorite, { name, img });
    }
  };

  return (
    <div className="service-item relative" data-name={name} data-img={img}>
      <img 
        src={img} 
        alt={name}
        className="rounded-xl w-full h-48 object-cover" 
      />
      <button 
        className="heart-btn absolute top-2 right-2 cursor-pointer hover:scale-110 transition-transform"
        onClick={handleHeartClick}
        aria-label="Favorite"
      >
        <span 
          className={`material-symbols-outlined text-3xl ${
            isFavorite ? 'text-red-500' : 'text-white'
          }`}
          style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          favorite
        </span>
      </button>
      <p className="mt-1 text-sm font-medium">{name}</p>
    </div>
  );
};

export default ServiceCard;
