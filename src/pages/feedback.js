import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@nextui-org/react';
import styles from '../styles/Feedback.module.css';

function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
    
    // Complete animation after initial load
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3000/feedback/restro-1');
      if (!response.ok) {
        throw new Error('Failed to fetch feedbacks');
      }
      
      const data = await response.json();
      // Add rating field if not present in API response
      const processedData = data.map(feedback => ({
        ...feedback,
        rating: feedback.rating || Math.floor(Math.random() * 5) + 1, // Random rating if not present
        date: feedback.date || new Date().toISOString().split('T')[0] // Current date if not present
      }));
      setFeedbacks(processedData);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError('Failed to load feedbacks. Please try again.');
      
      // Fallback to mock data
      const mockFeedbacks = [
        {
          'Feedback Id': 'FB-1',
          'Feedback': 'Absolutely amazing food! The butter chicken was perfectly spiced and the naan was fresh and warm. Service was quick and friendly. Will definitely come back!',
          'Order Id': 'ORDER-1',
          'Customer Id': 'CUSTOMER-1',
          rating: 5,
          date: '2024-06-15'
        },
        {
          'Feedback Id': 'FB-2',
          'Feedback': 'Good experience overall. The pasta was delicious but the wait time was a bit long. Staff was apologetic and offered a complimentary dessert.',
          'Order Id': 'ORDER-2',
          'Customer Id': 'CUSTOMER-2',
          rating: 4,
          date: '2024-06-14'
        },
        {
          'Feedback Id': 'FB-3',
          'Feedback': 'The pizza was okay but not exceptional. Crust was a bit too thin for my liking. The ambiance was nice though.',
          'Order Id': 'ORDER-3',
          'Customer Id': 'CUSTOMER-3',
          rating: 3,
          date: '2024-06-13'
        },
        {
          'Feedback Id': 'FB-4',
          'Feedback': 'Outstanding service! The chef personally came to check if we liked the special dish. Every course was perfectly prepared. A memorable dining experience!',
          'Order Id': 'ORDER-4',
          'Customer Id': 'CUSTOMER-4',
          rating: 5,
          date: '2024-06-12'
        },
        {
          'Feedback Id': 'FB-5',
          'Feedback': 'The food was cold when it arrived and the soup was too salty. However, the manager handled our complaint professionally and offered a discount.',
          'Order Id': 'ORDER-5',
          'Customer Id': 'CUSTOMER-5',
          rating: 2,
          date: '2024-06-11'
        }
      ];
      
      setFeedbacks(mockFeedbacks);
    } finally {
      setLoading(false);
    }
  };

  // Filter feedbacks based on rating
  const getFilteredFeedbacks = () => {
    let filtered = feedbacks.filter(feedback => {
      // Search filter
      if (searchTerm && !feedback.Feedback.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Rating filter
      if (filter === 'excellent' && feedback.rating !== 5) return false;
      if (filter === 'good' && feedback.rating !== 4) return false;
      if (filter === 'average' && feedback.rating !== 3) return false;
      if (filter === 'poor' && (feedback.rating !== 2 && feedback.rating !== 1)) return false;
      
      return true;
    });

    // Sort by date (most recent first)
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Get stats
  const getStats = () => {
    const total = feedbacks.length;
    const excellent = feedbacks.filter(f => f.rating === 5).length;
    const good = feedbacks.filter(f => f.rating === 4).length;
    const average = feedbacks.filter(f => f.rating === 3).length;
    const poor = feedbacks.filter(f => f.rating <= 2).length;
    const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / total;

    return { total, excellent, good, average, poor, avgRating: avgRating || 0 };
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`${styles.star} ${i <= rating ? styles.filled : styles.empty}`}
          viewBox="0 0 24 24"
          width="20"
          height="20"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }
    return <div className={styles.starRating}>{stars}</div>;
  };

  // Get rating label and color
  const getRatingInfo = (rating) => {
    switch (rating) {
      case 5: return { label: 'Excellent', color: '#22c55e' };
      case 4: return { label: 'Good', color: '#3b82f6' };
      case 3: return { label: 'Average', color: '#f59e0b' };
      case 2: return { label: 'Poor', color: '#ef4444' };
      case 1: return { label: 'Very Poor', color: '#dc2626' };
      default: return { label: 'No Rating', color: '#6b7280' };
    }
  };

  const stats = getStats();
  const filteredFeedbacks = getFilteredFeedbacks();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.feedbackLoader}>
          <svg className={styles.loaderSvg} viewBox="0 0 100 100">
            <circle className={styles.loaderCircle} cx="50" cy="50" r="40" />
            <path className={styles.loaderHeart} d="M50,25 C50,25 35,10 25,25 C15,40 50,65 50,65 C50,65 85,40 75,25 C65,10 50,25 50,25 Z" />
          </svg>
          <div className={styles.loadingText}>Loading customer feedback...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.feedbackPage}>
      {/* Animated Background */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.floatingShape} style={{ '--delay': '0s', '--duration': '20s' }}></div>
        <div className={styles.floatingShape} style={{ '--delay': '5s', '--duration': '25s' }}></div>
        <div className={styles.floatingShape} style={{ '--delay': '10s', '--duration': '30s' }}></div>
        <div className={styles.floatingShape} style={{ '--delay': '15s', '--duration': '22s' }}></div>
      </div>

      {/* Header Section */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>
              Customer Feedback
              <svg className={styles.titleIcon} viewBox="0 0 24 24" width="40" height="40">
                <path className={styles.heartPath} d="M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z" />
              </svg>
            </h1>
            <p className={styles.pageSubtitle}>Discover what our customers are saying about their dining experience</p>
          </div>
          
          <div className={styles.overallRating}>
            <div className={styles.ratingDisplay}>
              <span className={styles.avgRating}>{stats.avgRating.toFixed(1)}</span>
              {renderStars(Math.round(stats.avgRating))}
            </div>
            <p className={styles.ratingText}>Based on {stats.total} reviews</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.excellentStat}`}>
            <div className={styles.statIcon}>
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path d="M9,11H15l-3-3V2H9V8L6,11H9M7,18A1,1 0 0,0 8,19H16A1,1 0 0,0 17,18V12H7V18Z" fill="currentColor"/>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.excellent}</div>
              <div className={styles.statLabel}>Excellent</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.goodStat}`}>
            <div className={styles.statIcon}>
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" fill="currentColor"/>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.good}</div>
              <div className={styles.statLabel}>Good</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.averageStat}`}>
            <div className={styles.statIcon}>
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6Z" fill="currentColor"/>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.average}</div>
              <div className={styles.statLabel}>Average</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.poorStat}`}>
            <div className={styles.statIcon}>
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17C10.89,17 10,16.1 10,15C10,13.89 10.89,13 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17M18,11H6A6,6 0 0,1 12,5A6,6 0 0,1 18,11Z" fill="currentColor"/>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.poor}</div>
              <div className={styles.statLabel}>Poor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <div className={styles.searchContainer}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" fill="currentColor"/>
          </svg>
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All Reviews
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'excellent' ? styles.active : ''}`}
            onClick={() => setFilter('excellent')}
          >
            Excellent
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'good' ? styles.active : ''}`}
            onClick={() => setFilter('good')}
          >
            Good
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'average' ? styles.active : ''}`}
            onClick={() => setFilter('average')}
          >
            Average
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'poor' ? styles.active : ''}`}
            onClick={() => setFilter('poor')}
          >
            Poor
          </button>
        </div>
      </div>

      {/* Feedback Cards */}
      <div className={styles.feedbackGrid}>
        {filteredFeedbacks.length === 0 ? (
          <div className={styles.noFeedback}>
            <svg className={styles.noFeedbackIcon} viewBox="0 0 24 24" width="80" height="80">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,7A2,2 0 0,1 14,9A2,2 0 0,1 12,11A2,2 0 0,1 10,9A2,2 0 0,1 12,7M12,17C9.33,17 7.12,15.5 6.31,13.44C6.76,12.59 8.69,12 12,12C15.31,12 17.24,12.59 17.69,13.44C16.88,15.5 14.67,17 12,17Z" fill="currentColor"/>
            </svg>
            <h3>No feedback found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredFeedbacks.map((feedback, index) => {
            const ratingInfo = getRatingInfo(feedback.rating);
            return (
              <Card 
                key={feedback['Feedback Id']} 
                className={`${styles.feedbackCard} ${animationComplete ? styles.visible : ''}`}
                style={{ '--delay': `${index * 0.1}s` }}
              >
                <CardBody className={styles.cardBody}>
                  <div className={styles.feedbackHeader}>
                    <div className={styles.customerInfo}>
                      <div className={styles.customerAvatar}>
                        {feedback['Customer Id'].split('-')[1]}
                      </div>
                      <div className={styles.customerDetails}>
                        <div className={styles.customerId}>Customer {feedback['Customer Id']}</div>
                        <div className={styles.orderId}>Order {feedback['Order Id']}</div>
                      </div>
                    </div>
                    
                    <div className={styles.ratingSection}>
                      {renderStars(feedback.rating)}
                      <span 
                        className={styles.ratingLabel}
                        style={{ color: ratingInfo.color }}
                      >
                        {ratingInfo.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.feedbackContent}>
                    <p className={styles.feedbackText}>&ldquo;{feedback.Feedback}&rdquo;</p>
                  </div>
                  
                  <div className={styles.feedbackFooter}>
                    <div className={styles.feedbackDate}>
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M9,10V12H7V10H9M13,10V12H11V10H13M17,10V12H15V10H17M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H6V1H8V3H16V1H18V3H19M19,19V8H5V19H19M5,6H19V5H5V6Z" fill="currentColor"/>
                      </svg>
                      {new Date(feedback.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    
                    <div 
                      className={styles.ratingBadge}
                      style={{ backgroundColor: `${ratingInfo.color}20`, color: ratingInfo.color }}
                    >
                      {feedback.rating}/5
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })
        )}
      </div>

      {/* Floating Hearts Animation */}
      <div className={styles.floatingHearts}>
        {[...Array(6)].map((_, i) => (
          <svg
            key={i}
            className={styles.floatingHeart}
            style={{ '--delay': `${i * 2}s`, '--duration': `${8 + i}s` }}
            viewBox="0 0 24 24"
            width="20"
            height="20"
          >
            <path d="M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z" fill="currentColor"/>
          </svg>
        ))}
      </div>
    </div>
  );
}

export default Feedback;