import {motion} from "framer-motion";
import Pickleball from "./../Pickleball.png";

const bounceTransition = {
    y: {
        duration: 0.2,
        ease: "easeOut",
        repeat: Infinity,
        repeatType: "reverse"
    }
};

const LoadingAnimation = () => {
  return (
    <div className='loading-wrapper'>
            <motion.img src={Pickleball} style={{height:'fit-content'}} className='loading-ball-style' transition={bounceTransition} animate={{
            y: ["100%", "-100%"]
        }}/>
    </div>
  )
}

export default LoadingAnimation