/**
 * Created by mogwaili on 03/03/17.
 */

var container; //Div qui contient le scene
var camera, renderer, controls; //Elemes de rendu thresjs
var manager;
var textures;
var ambient, directionalLight1, directionalLight2; //Lightings

//Initialise la scene
function initScene(mainDiv, camPosition, camFocus){
    campPosition = camPosition || {x:-10,y:20,z:30};
    camFocus = camFocus || {x:0,y:0,z:20};

    container = document.createElement( 'div' );
    document.getElementById(mainDiv).appendChild( container );

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.x = campPosition.x;
    camera.position.y = campPosition.y;
    camera.position.z = campPosition.z;
    camera.lookAt(new THREE.Vector3(camFocus.x,camFocus.y,camFocus.z));
    //camera.rotation.x = -Math.PI/2;



    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
    ambient = new THREE.AmbientLight( 0x101030 );
    scene.add( ambient );

    directionalLight1 = new THREE.DirectionalLight( 0xffeedd);
    directionalLight1.position.set( 0, 1, 1 );
    directionalLight1.castShadow =true;
    directionalLight1.shadow.mapSize.width = 512;  // default
    directionalLight1.shadow.mapSize.height = 512; // default
    directionalLight1.shadow.camera.near = 0.5;       // default
    directionalLight1.shadow.camera.far = 500      // default
    scene.add( directionalLight1 );

    directionalLight2 = new THREE.DirectionalLight( 0x88aaff,0.4 );
    directionalLight2.position.set( -1, 1, -1 );
    directionalLight2.castShadow =true;
    directionalLight2.shadow.mapSize.width = 512;  // default
    directionalLight2.shadow.mapSize.height = 512; // default
    directionalLight2.shadow.camera.near = 0.5;       // default
    directionalLight2.shadow.camera.far = 500      // default
    scene.add( directionalLight2);

    manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        console.log( item, loaded, total );
    };

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0xffffff, 0);
    renderer.shadowMap.Enabled = true;

    container.appendChild( renderer.domElement );

    //controls
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target = new THREE.Vector3(0,0,20);
    controls.enablePan = false;
    controls.maxPolarAngle =  Math.PI/2; // prevent the camera from going under the ground
    controls.minDistance = 30; // the minimum distance the camera must have from center
    controls.maxDistance = 150; // the maximum distance the camera must have from center
    controls.zoomSpeed = 0.3; // control the zoomIn and zoomOut speed
    controls.rotateSpeed = 0.3; // control the rotate speed
    controls.autoRotate = true;
    //controls.addEventListener( 'change', render );

    //Recalcule la scene toutes les x msecondes
    animate();

    return scene;
}



function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}
function getCenterBoundingBox(object3D) {
    var avVect = null;
    var occ = 0;
    function getBoundingBox (obj,parent) {
        if (obj.type === "Object3D") {
            for (var i in obj.children){
                getBoundingBox(obj.children[i],obj);
            }
            return;
        }
        obj.geometry.computeBoundingBox();
        occ ++;
        if (avVect === null) {
            avVect = parent.localToWorld(obj.geometry.boundingBox.getCenter())
        } else {
            avVect.add(parent.localToWorld(obj.geometry.boundingBox.getCenter()));
        }
    };
    getBoundingBox(object3D);
    avVect.x /= occ;
    avVect.y /= occ;
    avVect.z /= occ;
    console.log(avVect,occ);
    return avVect;
}
function getCenterPoint(obj) {
    return getCenterBoundingBox(obj);
}
var objCenter = new THREE.Vector3(0,0,0);
function centerCamera(obj) {
    //dans un premier temps on position la cible de la camera sur le centre du réseau
    objCenter = getCenterPoint(obj.threeObj);
    camera.position.x = objCenter.x;
    camera.position.y = objCenter.y;
    camera.position.z = objCenter.z;
    console.log('center',objCenter,obj.threeObj.worldToLocal(new THREE.Vector3(0,0,0)));
}
function animate()  {
    controls.target = objCenter;
    requestAnimationFrame( animate );
    render();
}

function render() {
    controls.update();
    renderer.render( scene, camera );
}

//Construit le canvas depuis le json
/*

 var config = {
     devices: [
         {
             name: "firewall",
             type: "firewall",
             networks: [
                 {
                 name: "192.168.1.0/24",
                 gateway: "192.168.0.254",
                 devices: [
                     {
                         name: "test pc 1",
                         type: 'workstation',
                         ip: "192.168.1.12"
                     },
                     {
                         name: "test pc 2",
                         type: 'workstation',
                         ip: "192.168.1.13"
                     },
                     {
                         name: "test serveur",
                         type: 'server',
                         ip: "192.168.1.1"
                     }
                     ]
                 }
             ]
         }
     ]
 };

 */
function buildFromConfig(config,internet){
    //routeur
     for (var f in config.devices){
         var dev = new MapItem(config.devices[f].type);
         internet.add(dev);
         //switch
         for (var n in config.devices[f].networks){
             var sw = new MapItem('switch');
             dev.add(sw);
             buildFromConfig(config.devices[f].networks[n],sw);
         }
     }
}

function parseNetwork(network,origin,boxes){
    if(origin.length == 0) return false;
    var links = network.links;

    var temp = [];
    for(var i = 0; i< origin.length; i++){
        links.forEach(function(elem){
            if(elem.origin == origin[i]){
                temp.push(elem.dest);
                boxes[elem.dest] = new THREE.Object3D();
                boxes[elem.origin].add(boxes[elem.dest])
            }
        });
    }

    parseNetwork(network,temp,boxes);
}