import React, { useState } from 'react';
import { Card, CardBody, CardFooter, Button, Chip, Tooltip } from '@nextui-org/react';
import styles from '../styles/DishCard.module.css';

const DishCard = ({ dish, onEdit, onDelete, index, isDeleting, deletingId }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`star-${i}`} className={styles.star}>★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half-star" className={styles.star}>✭</span>);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className={styles.star} style={{color: '#d1d5db'}}>☆</span>);
    }
    
    return (
      <div className={styles.starRating}>
        {stars}
        <span className="ml-1 text-xs text-gray-500">({rating.toFixed(1)})</span>
      </div>
    );
  };
  
  // Get genre badges with custom styling
  const renderGenreBadges = (genres) => {
    return genres.map((genre, index) => {
      let badgeClass = '';
      
      switch(genre.toLowerCase()) {
        case 'spicy':
          badgeClass = styles.spicyBadge;
          break;
        case 'sweet':
          badgeClass = styles.sweetBadge;
          break;
        default:
          badgeClass = '';
      }
      
      return (
        <span key={index} className={`${styles.categoryBadge} ${badgeClass}`}>
          {genre}
        </span>
      );
    });
  };
  
  // Calculate delay for staggered animation
  const animationDelay = `${0.1 + (index % 9) * 0.1}s`;
  
  return (
    <div 
      className={styles.dishCardContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card 
        className={`${styles.dishCard} ${isHovered ? styles.hovered : ''}`} 
        style={{ animationDelay }}
      >
        {/* Availability indicator */}
        <div className={`${styles.availabilityIndicator} ${dish.Available ? styles.available : styles.unavailable}`} 
              title={dish.Available ? "Available" : "Unavailable"}></div>
        
        {/* Dish type icon */}

        
        <CardBody className={styles.dishCardBody}>
          <div className={styles.dishHeader}>
            <div>
              <h3 className={styles.dishName}>{dish.Name}</h3>
              <p className={styles.dishPrice}>₹{dish.Price}</p>
            </div>
            <div className={styles.dishBadges}>
              <Chip 
                color={dish.Available ? "success" : "danger"} 
                size="sm"
                variant="flat"
              >
                {dish.Available ? "Available" : "Unavailable"}
              </Chip>
              {dish['Type of Dish'].includes('Veg') ? (
                <Chip color="success" size="sm" variant="flat">Veg</Chip>
              ) : (
                <Chip color="danger" size="sm" variant="flat">Non-Veg</Chip>
              )}
            </div>
          </div>
          
          <p className={styles.dishDescription}>{dish.Discription || "No description available"}</p>
          
          <div className={styles.dishDetails}>
            <div className={styles.detailsRow}>
              <span className={styles.detailLabel}>Cooking Time:</span>
              <span>{dish['Cooking Time'] || "Not specified"}</span>
            </div>
            
            <div className={styles.detailsRow}>
              <span className={styles.detailLabel}>Rating:</span>
              {renderStars(dish.Rating)}
            </div>
            
            {dish['Genre of Taste'] && dish['Genre of Taste'].length > 0 && (
              <div className={styles.tagContainer}>
                {renderGenreBadges(dish['Genre of Taste'])}
              </div>
            )}
          </div>
        </CardBody>
        
        <CardFooter className={styles.dishCardFooter}>
          <Tooltip content="Edit this dish">
            <Button 
              size="sm" 
              variant="bordered" 
              color="primary"
              onPress={() => onEdit(dish)}
              className={styles.editButton}
              startContent={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              }
            >
              Edit
            </Button>
          </Tooltip>
          
          <Tooltip content="Delete this dish">
            <Button 
              size="sm" 
              variant="bordered" 
              color="danger"
              onPress={() => onDelete(dish['DishId'])}
              className={styles.deleteButton}
              isLoading={isDeleting && deletingId === dish['DishId']}
              startContent={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              }
            >
              Delete
            </Button>
          </Tooltip>
        </CardFooter>
      </Card>
      
      {/* 3D effect for hover */}
      <div className={`${styles.cardShadow} ${isHovered ? styles.shadowActive : ''}`}></div>
    </div>
  );
};

export default DishCard;