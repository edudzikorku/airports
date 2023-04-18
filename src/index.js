import "three";
import "three-globe";
import ThreeGlobe from "three-globe";
import { WebGLRenderer, Scene } from "three";
import {
  PerspectiveCamera,
  Line,
  LineBasicMaterial,
  BufferGeometry,
  Vector3, Color,
  AmbientLight,
  DirectionalLight,
  PointLight, SphereGeometry,
  MeshBasicMaterial, Mesh, TextureLoader
} from "three";

import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

import { Lensflare, LensflareElement } from "three/examples/jsm/objects/Lensflare.js";

// set up the scene
const scene = new Scene();
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('globe').appendChild(renderer.domElement);

const globe = new ThreeGlobe()
    .globeImageUrl('./img/nasa_night_lights.jpg')
    .bumpImageUrl('./img/earth-topology.png')

scene.add(globe);


const origin = "./data/la_int_airport.geojson";
const destination = "./data/la_int_airport_flight.geojson";

fetch(origin)
  .then(response => response.json())
  .then(sourceData => {
    fetch(destination)
        .then(response => response.json())
        .then(destinationData => {
          const sourceCoordinates = sourceData.features[0].geometry.coordinates;
          destinationData.features.forEach(destinationFeature => {
            if (destinationFeature && destinationFeature.geometry && destinationFeature.geometry.coordinates) {
              const destinationCoordinates = destinationFeature.geometry.coordinates;
              const flightPath = new Line(
                new BufferGeometry().setFromPoints([
                  new Vector3().fromArray(sourceCoordinates),
                  new Vector3().fromArray(destinationCoordinates)
                ]),
  
                new LineBasicMaterial({ color:0xff0000 })
              );
              globe.add(flightPath);
              // create a lensflare for the glowing light effect
              const lensFlare = new Lensflare();
              lensFlare.addElement(new LensflareElement(
                new TextureLoader().load("./firefly/PointIconImages/3.png"),
                100, 0, new Color(0xff6600)));
              
              // create a glowing light as a point light
              const light = new PointLight(0xff6600, 1, 10);
              light.add(lensFlare);
              light.position.fromArray(destinationCoordinates);
              globe.add(light);
            }
          });
          // create camera
          const camera = new PerspectiveCamera(
            75, //Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
            );
          // set initial camera position 
          camera.position.set(0, 0, 200);
          
          // set camera controls
          const controls = new TrackballControls(camera, renderer.domElement);

          // create sphere geometry for ripple effect
          const rippleGeometry = new SphereGeometry(2, 32, 32);

          // create material for ripple effect
          const rippleMaterial = new MeshBasicMaterial({ color: 0xff0000 });

          // create mesh for ripple effect
          const rippleMesh = new Mesh(rippleGeometry, rippleMaterial);

          // set initial scale for ripple mesh
          rippleMesh.scale.set(0, 0, 0);

          // set position of ripple mesh to source coordinates
          rippleMesh.position.fromArray(sourceCoordinates);

          // add ripple mesh to globe
          globe.add(rippleMesh);

          // set animation function to handle updates and render loop
          const animate = () => {
            requestAnimationFrame(animate);

            // rotate globe
            globe.rotation.y += 0.001;

            // update scale of ripple mesh to create pulsating effect
            rippleMesh.scale.set(
              Math.abs(Math.sin(Date.now() * 0.001)) * 2,
              Math.abs(Math.sin(Date.now() * 0.001)) * 2,
              Math.abs(Math.sin(Date.now() * 0.001)) * 2
            );
            // update controls
            controls.update();
            renderer.render(scene, camera);
          };

          // call animation function to begin render loop

          animate()
        })
        .catch(error => {
          console.error("Failed to fetch destination data:", error);
        });
  })
  .catch(error => {
    console.error("Failed to fetch origin data:", error);
  });


  // const tbControls = new THREE.TrackballControls(camera, renderer.domElement);
  // tbControls.minDistance = 101;
  // tbControls.rotateSpeed = 5;
  // tbControls.zoomSpeed = 0.8;

  // // Kick-off renderer
  // (function animate() { // IIFE
  //   // Frame cycle
  //   tbControls.update();
  //   renderer.render(scene, camera);
  //   requestAnimationFrame(animate);
  // })();

// fetch("./airports/la_int_airport.geojson")
//   .then(response => response.json())
//   .then(sourData => {
//     // create the globe
//     const globe = new ThreeGlobe()
//       .globeImageUrl('./img/nasa_night_lights.jpg')
//       .bumpImageUrl('./img/earth-topology.png')
    
//     const sourceCoordinates = sourData.features[0].geometry.coordinates;


//     // create a bubble at the source airport
//     const bubbleSource = ThreeGlobe.bubble()
//         .radius(0.3)
//         .position(sourceCoordinates)
//         .color('blue')
//         .label('Source')
//         .labelSize("0.15")
//         .labelDotRadius(0.05)
//         .labelDotStrokeWidth(0.01)
//         .labelDotStrokeColor('black')
//     globe.add(bubbleSource);

//     fetch("./airports/la_int_airport_flight.geojson")
//         .then(response => response.json())
//         .then(destinationData => {
//           destinationData.features.forEach(feature => {
//             const destinationCoordinates = feature.geometry.coordinates;
//             const path = ThreeGlobe.path()
//                 .points([sourceCoordinates, destinationCoordinates])
//                 .color('red')
//                 .strokeWidth(0.01);
//             globe.add(path)
//           });
//         })
//         .catch(error => console.error(error));
//       scene.add(globe);
//   })
//   .catch(error => console.error(error));

