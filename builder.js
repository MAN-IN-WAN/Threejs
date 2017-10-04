/**
 * Created by mogwaili on 16/02/17.
 */

Math.degToRad = function (degrees) {
    return degrees * Math.PI / 180;
};


// Creation d'un objet permettant de stocker les infos sur les objets placé à l'ecran ainsi que leurs états...
//TODO : Verif typeObj
//TODO : Verif Coords
function MapItem (typeObj){
    this.parent = null;
    this.container = null;
    this.coords = {dimensions:{x:1,y:1,z:1},positions:{x:0,y:0,z:0}};
    this.typeObj = typeObj;
    this.threeObj = undefined;
    this.children = [];


    var dimensions = this.coords.dimensions || {x:1,y:1,z:1};
    var positions = this.coords.positions || this.coords;


    switch (this.typeObj){
        case 'cube':
            var geometry = new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z);
            var material = new THREE.MeshBasicMaterial({color: 0xff5555});

            var cube = new THREE.Mesh(geometry, material);

            this.threeObj = cube;

        break;

        case 'cloud':
            // texture
            var texture = new THREE.Texture();
            var loader = new THREE.ImageLoader( manager );
            loader.load( 'textures/UV_Grid_Sm.jpg', function ( image ) {
                texture.image = image;
                texture.needsUpdate = true;

            } );

            // model loader
            var onProgress = function ( xhr ) {
                if ( xhr.lengthComputable ) {
                    var percentComplete = xhr.loaded / xhr.total * 100;
                    console.log( Math.round(percentComplete, 2) + '% downloaded' );
                }
            };

            var onError = function ( xhr ) {
            };


            var objContainer = new THREE.Object3D();
            var loader = new THREE.OBJLoader( manager );
            var obj;
            loader.load( 'models/cloud2.obj', function ( object ) {
                // object.traverse( function ( child ) {
                //     if ( child instanceof THREE.Mesh ) {
                //         child.material.map = texture;
                //     }
                // } );
                obj=object;
                objContainer.add( object );

                //Recentre l'objet pour avoir des coordonnées en base 0
                var box = new THREE.Box3().setFromObject( obj );
                box.getCenter( obj.position ); // this re-sets the mesh position
                obj.position.multiplyScalar( - 1 );
                obj.castShadow =true;
                obj.receiveShadow = true;
                objContainer.rotation.x = -Math.PI/2

            }, onProgress, onError );

            this.threeObj = objContainer;
            break;

        case 'firewall':
            var firewall = new THREE.Object3D();

            var height = 0.5;
            var width = 1.3;
            var depth =0.5;
            var geometryb = new THREE.BoxGeometry(width, height, depth);
            //var materialb = new THREE.MeshLambertMaterial({color: 0xB0F2B6});
            var materialb = new THREE.MeshLambertMaterial({color: 0xcc3355});
            var bottom =0;
            var left =0;
            var rangs =5;
            var bpr =4;
            var bricks = new Array();
            for(var i =0; i<bpr*rangs;i++){
                if(i!=0 && !(i%bpr)) {
                    bottom += height;
                    left = 0;
                }
                if(!(i%(2*bpr))) left += width/2;
                bricks[i] = new THREE.Mesh(geometryb, materialb);
                bricks[i].position.x = left;
                bricks[i].position.y = bottom;
                firewall.add(bricks[i]);
                left += width+0.01;
            };
            firewall.castShadow = true;
            firewall.receiveShadow = true;

            firewall.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            } );
            firewall.translateX(-2.525);
            firewall.translateY(-1.225);
            var cont = new THREE.Object3D();
            cont.add(firewall);
            this.threeObj = cont;
            break;

        case 'link':
            var geometry = new THREE.CylinderGeometry( 0.2, 0.4, 20, 32 );
            var material = new THREE.MeshLambertMaterial( {color: 0xB0F2B6} );
            var cylinder = new THREE.Mesh( geometry, material );
            cylinder.rotation.x = 90*Math.PI/180;

            this.threeObj = cylinder;
            break;

        case 'hub':
        case 'switch':
            var switchub = new THREE.Object3D();
            var geometryhub = new THREE.BoxGeometry(2.5, 0.7, 2);
            //var materialhub= new THREE.MeshLambertMaterial({color: 0xB0F2B6});
            var materialhub= new THREE.MeshLambertMaterial({color: 0x55cc66});
            var hub = new THREE.Mesh(geometryhub, materialhub);
            switchub.add(hub);

            this.threeObj = switchub;
            break;

        case 'pc':
        case 'poste':
        case 'workstation':
            var poste = new THREE.Object3D();
            var geometrypc = new THREE.BoxGeometry(1.3, 2.5, 2.6);
            var materialpc= new THREE.MeshLambertMaterial({color: 0xB0F2B6});
            var pc = new THREE.Mesh(geometrypc, materialpc);


            var geometryscrb = new THREE.BoxGeometry(3, 2.5, 0.3);
            var materialscrb= new THREE.MeshLambertMaterial({color: 0xB0F2B6});
            var scrb = new THREE.Mesh(geometryscrb, materialscrb);

            var geometryscr = new THREE.BoxGeometry(2.8, 2.3, 0.2);
            var materialscr= new THREE.MeshLambertMaterial({color: 0xB0F2B6});
            var scr = new THREE.Mesh(geometryscr, materialscr);
            scr.position = new THREE.Vector3(0.1,0.1,0);

            poste.add(pc,scrb,scr);
            pc.position.set(2.8,0.1,0);
            scrb.position.set(0,0,0);
            scr.position.set(-0.1,0.1,-0.1);

            this.threeObj = poste;
            break;

        case 'serv':
        case 'server':
        case 'serveur':
            var serv = new THREE.Object3D();
            var geometryserv = new THREE.BoxGeometry(2.5, 2.5, 2);
//            var materialserv= new THREE.MeshLambertMaterial({color: 0xB0F2B6});
            var materialserv= new THREE.MeshLambertMaterial({color: 0xffaa77});
            var serv1 = new THREE.Mesh(geometryserv, materialserv);
            serv.add(serv1);
            var geometrysp1 = new THREE.SphereGeometry( 0.1, 32, 32 );
            var materialsp1 = new THREE.MeshLambertMaterial( {color: 0xff0000} );
            var sphere1 = new THREE.Mesh( geometrysp1, materialsp1 );
            var geometrysp2 = new THREE.SphereGeometry( 0.1, 32, 32 );
            var materialsp2 = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
            var sphere2 = new THREE.Mesh( geometrysp2, materialsp2 );
            sphere1.position.z = -1;
            sphere1.position.x = -0.2;
            sphere2.position.z = -1;
            sphere2.position.x = 0.2;
            var sphere3 = sphere1.clone();
            var sphere4 = sphere2.clone();
            sphere3.position.x = 0.6;
            sphere4.position.x = -0.6;
            serv.add(sphere1,sphere2,sphere3,sphere4);

            this.threeObj = serv;
            break;

        default:
            var geometry = new THREE.BoxGeometry(1, 1, 1);
            var material = new THREE.MeshBasicMaterial({color: 0xB0F2B6});
            var cube = new THREE.Mesh(geometry, material);

            this.threeObj = cube;
    }
    //Ajout d'un sous objet
    this.add = function (mi){
        var container = new THREE.Object3D();
        mi.container = container;
        this.threeObj.add(container);
        container.add(mi.threeObj);
        this.children.push(mi);
    };

    this.compute = function () {
        //recalcul des coordonnées
        if (this.typeObj=='firewall'){
            //alors décalage de hauteur
            var nb = this.children.length;
            var angle = 25;
            var distance = 10;
        }else if (this.typeObj=='cloud') {
            //alors décalage d'angle
            var nb = this.children.length;
            var angle = 75;
            var distance = 10;
        }else{
            //alors décalage d'angle
            var nb = this.children.length;
            var angle = 30;
            var distance = 12;
        }
        /** compute **/
        var startangle = -((nb-1)*angle/2);
        for (var i in this.children){
            console.log('compute ',i,nb,startangle + i*angle,startangle);
            //if (i%2)var dist = distance*2; else var dist = distance;
            var dist = distance;
            this.children[i].threeObj.position.z = dist;
            if (!this.children[i].cylinder) {
                var geometry = new THREE.CylinderGeometry(0.2, 0.2, dist, 32);
                var material = new THREE.MeshLambertMaterial({color: 0xB0F2B6});
                var cylinder = new THREE.Mesh(geometry, material);
                cylinder.translateZ(dist / 2);
                cylinder.rotation.x = 90 * Math.PI / 180;
                this.children[i].cylinder = cylinder;
            }
            this.children[i].container.add(cylinder);
            if (this.typeObj=='firewall')
                this.children[i].container.rotation.x = Math.degToRad(startangle + i*angle);
            else
                this.children[i].container.rotation.y = Math.degToRad(startangle + i*angle);
            this.children[i].compute();
        }
    };

    //Affiche l'objet ( toutes les scenes )
    this.show = function(){
        this.threeObj.visible = true;
    };

    //Cache l'objet ( toutes les scenes )
    this.hide = function(){
        this.threeObj.visible = false;
    };

    //Definit le container de rotation
    this.setContainer = function (cont) {
        this.container = container;
    };
    //Deplace l'objet
    //TODO : Verif coords
    this.move = function(coords){
        this.threeObj.position.x= coords['x'];
        this.threeObj.position.y= coords['y'];
        this.threeObj.position.z= coords['z'];
    };
    this.move(positions);
}