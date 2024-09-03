import React, { useEffect, useRef } from 'react';

export const TwitterTimeline = ({twitterHandle}) => {
    const timelineRef = useRef(null);
  
    useEffect(() => {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      document.body.appendChild(script);
  
      script.onload = () => {
        if (window.twttr && timelineRef.current) {
          window.twttr.widgets.load(timelineRef.current);
        }
      };
  
      return () => {
        document.body.removeChild(script);
      };
    }, []);
  
    return (
      <div ref={timelineRef} style={{ overflowY: 'scroll', height: '500px' }}>
        <a 
          className="twitter-timeline" 
          data-dnt="true" 
          href={`https://twitter.com/${twitterHandle}?ref_src=twsrc%5Etfw`}
        >
          Tweets by {twitterHandle}
        </a>
      </div>
    );
  };