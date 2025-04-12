import React from 'react';

const AnimatedLoader = () => {
  const loaderStyle = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '300px',
      padding: '20px',
    },
    loaderWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
    },
    loader: {
      display: 'inline-block',
      position: 'relative',
      width: '80px',
      height: '80px',
    },
    circle: (index) => ({
      position: 'absolute',
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      background: `rgb(${59 + (index * 20)}, ${130 - (index * 10)}, ${246 - (index * 15)})`,
      animation: 'lds-chase 2.5s linear infinite',
      animationDelay: `${index * -0.3}s`,
    }),
    text: {
      marginTop: '20px',
      color: '#4b5563',
      fontWeight: 500,
      textAlign: 'center',
      fontSize: '0.875rem',
      maxWidth: '240px',
    },
  };

  return (
    <div style={loaderStyle.container}>
      <div style={loaderStyle.loaderWrapper}>
        <div style={loaderStyle.loader}>
          {[...Array(6)].map((_, index) => (
            <div 
              key={index} 
              style={loaderStyle.circle(index)}
              className="animate-circle"
            />
          ))}
        </div>
      </div>
      <style jsx global>{`
        @keyframes lds-chase {
          0% {
            transform: rotate(0deg) translateY(-30px) rotate(0deg);
          }
          50% {
            transform: rotate(180deg) translateY(-30px) rotate(-180deg);
          }
          100% {
            transform: rotate(360deg) translateY(-30px) rotate(-360deg);
          }
        }
        .animate-circle:nth-child(1) { animation-delay: 0s; }
        .animate-circle:nth-child(2) { animation-delay: -0.3s; }
        .animate-circle:nth-child(3) { animation-delay: -0.6s; }
        .animate-circle:nth-child(4) { animation-delay: -0.9s; }
        .animate-circle:nth-child(5) { animation-delay: -1.2s; }
        .animate-circle:nth-child(6) { animation-delay: -1.5s; }
      `}</style>
      <div style={loaderStyle.text}>
        Loading your dashboard data... 
        <div className="mt-2">Just brewing up some fresh insights!</div>
      </div>
    </div>
  );
};

export default AnimatedLoader;