import React from "react";
import "./PathAnimation.css";

const PathAnimation = () => {
  return (
    <div className="animation-container">
      <svg width="200" height="200" className="animation-path">
        <path
          d="M100 0C70.8719 0 0 70.87 0 100C0 129.13 70.8719 200 100 200C129.127 200 200 129.128 200 100C200 70.872 129.128 0 100 0Z"
          fill="none"
          stroke="#836EF9"
          strokeWidth="1"
          opacity="0.3"
        />
      </svg>
      
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="moving-div"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15.9999 0C11.3795 0 0 11.3792 0 15.9999C0 20.6206 11.3795 32 15.9999 32C20.6203 32 32 20.6204 32 15.9999C32 11.3794 20.6205 0 15.9999 0ZM13.5066 25.1492C11.5582 24.6183 6.31981 15.455 6.85083 13.5066C7.38185 11.5581 16.545 6.31979 18.4933 6.8508C20.4418 7.38173 25.6802 16.5449 25.1492 18.4934C24.6182 20.4418 15.455 25.6802 13.5066 25.1492Z' fill='%23836EF9'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain'
          }}
        />
      ))}
    </div>
  );
};

export default PathAnimation;