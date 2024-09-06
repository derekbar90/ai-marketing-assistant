import React, { useEffect, useRef } from 'react';

export const TwitterTimeline = ({ twitterHandle }) => {
    const timelineRef = useRef(null);
  
    useEffect(() => {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      document.body.appendChild(script);
  
      script.onload = () => {
        if (window.twttr && timelineRef.current) {
          // Clear the existing content
          timelineRef.current.innerHTML = '';
          // Create a new anchor element
          const anchor = document.createElement('a');
          anchor.className = 'twitter-timeline';
          anchor.setAttribute('data-dnt', 'true');
          anchor.href = `https://twitter.com/${twitterHandle}?ref_src=twsrc%5Etfw`;
          anchor.textContent = `Tweets by ${twitterHandle}`;
          // Append the new anchor to the container
          timelineRef.current.appendChild(anchor);
          // Load the new timeline
          window.twttr.widgets.load(timelineRef.current);
        }
      };
  
      return () => {
        document.body.removeChild(script);
      };
    }, [twitterHandle]); // Add twitterHandle to the dependency array
  
    return (
      <div ref={timelineRef} style={{ overflowY: 'scroll', height: '200px' }}></div>
    );
  };