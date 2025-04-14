import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import Stats from 'three/addons/libs/stats.module.js';
import { gsap } from "gsap";
import { Howl } from 'howler';
import { initApp } from './app';

// Device detection function
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth < 768;
}

// Initialize the app with the device type
const isMobile = isMobileDevice();
console.log(`${isMobile ? 'Mobile' : 'Desktop'} device detected`);

// Start your application with the device information
initApp(isMobile);