// Scene Declartion
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// This defines the initial distance of the camera, you may ignore this as the camera is expected to be dynamic
camera.applyMatrix4(new THREE.Matrix4().makeTranslation(-5, 30, 130));
camera.lookAt(0, -4, 1)


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


// helper function for later on
function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

// function that calculates the fair play score
function calculate_fair_play_score() {
    let numOfRedCards = 0;
    let numOfYellowCards = 0;
    let numOfVARCards = 0;

    for (const card of cardsHitList) {
        if (card.type == 'Red') {
            numOfRedCards++;
        } else if (card.type == 'Yellow') {
            numOfYellowCards++;
        } else{
            numOfVARCards++;
        }
    }

    let numerator = - (numOfYellowCards + 10 * numOfRedCards);
    let score = 100 * (2 ** (numerator / 10));
    return score + numOfVARCards * 10;
}

// function that checks for collision between the ball and the card
function checkColision(ball, card){
    if (!card.visible) {
        return false;
    }
    const cardBox = new THREE.Box3().setFromObject(card);

    // Calculate the bounding sphere of the ball
    const ballSphere = new THREE.Sphere();
    ball.geometry.computeBoundingSphere();
    ballSphere.copy(ball.geometry.boundingSphere).applyMatrix4(ball.matrixWorld);

    // Check for intersection
    return ballSphere.intersectsBox(cardBox);
}


let COUNTER = 1;
const STEPS = 3000;


// Here we load the cubemap and pitch images, you may change it

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  'src/pitch/right.jpg',
  'src/pitch/left.jpg',
  'src/pitch/top.jpg',
  'src/pitch/bottom.jpg',
  'src/pitch/front.jpg',
  'src/pitch/back.jpg',
]);
scene.background = texture;


// TODO: Texture Loading
// We usually do the texture loading before we start everything else, as it might take processing time
const textureLoader = new THREE.TextureLoader();
const ballTexture = textureLoader.load("src/textures/soccer_ball.jpg");
const redCardTexture = textureLoader.load("src/textures/red_card.jpg");
const yellowCardTexture = textureLoader.load("src/textures/yellow_card.jpg");
const argentinaFlagTexture = textureLoader.load('src/textures/argentina_flag.png');
const varTexture = textureLoader.load('src/textures/var_card.jpg');



// TODO: Add Lighting
const origin = new THREE.Object3D();
origin.position.set(0,0,0);
const target = new THREE.Object3D();
target.position.set(0,0,100);
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight1.position.set(0,50,50);
directionalLight1.target = origin;
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight2.position.set(0,50,50);
directionalLight2.target = target;
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);

scene.add(directionalLight1);
scene.add(directionalLight2);
scene.add(ambientLight);

// TODO: Goal
// You should copy-paste the goal from the previous exercise here
//rendering of the goal skeleton
let goal = new THREE.Object3D();

const goal_material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF} );

// shrink_matrix is used to shrink the goal
const shrink_matrix = new THREE.Matrix4();
shrink_matrix.makeScale(0.95,0.95,0.95);

// crrosbar 
const crossbar_matrix = new THREE.Matrix4();
const crossbar_rotation_matrix = new THREE.Matrix4();
const crossbar_translation_matrix = new THREE.Matrix4();

crossbar_rotation_matrix.makeRotationZ(degrees_to_radians(90));
crossbar_translation_matrix.makeTranslation(0,19.5,0);
crossbar_matrix.multiplyMatrices(crossbar_translation_matrix, crossbar_rotation_matrix);

const crossbar_geometry = new THREE.CylinderGeometry(1, 1, 120, 15);
const crossbar = new THREE.Mesh(crossbar_geometry, goal_material);

crossbar.applyMatrix4(crossbar_matrix);

// posts 
const post1_matrix = new THREE.Matrix4();
const post1_translation_matrix = new THREE.Matrix4();
post1_translation_matrix.makeTranslation(59.5,0,0);
post1_matrix.multiply(post1_translation_matrix);

const post2_matrix = new THREE.Matrix4();
const post2_translation_matrix = new THREE.Matrix4();
post2_translation_matrix.makeTranslation(-59.5,0,0);
post2_matrix.multiply(post2_translation_matrix);

const post_geometry = new THREE.CylinderGeometry(1, 1, 40, 15);
const post1 = new THREE.Mesh( post_geometry, goal_material );
const post2 = new THREE.Mesh( post_geometry, goal_material );

post1.applyMatrix4(post1_matrix);
post2.applyMatrix4(post2_matrix);

// back supports
const back_support1_matrix = new THREE.Matrix4();
const back_support1_translation_matrix = new THREE.Matrix4();
const back_support1_rotation_matrix = new THREE.Matrix4();
back_support1_rotation_matrix.makeRotationX(degrees_to_radians(30));
back_support1_translation_matrix.makeTranslation(59.5,0,-11.547);
back_support1_matrix.multiplyMatrices(back_support1_translation_matrix, back_support1_rotation_matrix);

const back_support2_matrix = new THREE.Matrix4();
const back_support2_translation_matrix = new THREE.Matrix4();
const back_support2_rotation_matrix = new THREE.Matrix4();
back_support2_rotation_matrix.makeRotationX(degrees_to_radians(30));
back_support2_translation_matrix.makeTranslation(-59.5,0,-11.547);
back_support2_matrix.multiplyMatrices(back_support2_translation_matrix, back_support2_rotation_matrix);

const back_support_geometry = new THREE.CylinderGeometry( 1, 1, 46.188, 15 );
const back_support1 = new THREE.Mesh( back_support_geometry, goal_material );
const back_support2 = new THREE.Mesh( back_support_geometry, goal_material );

back_support1.applyMatrix4(back_support1_matrix);
back_support2.applyMatrix4(back_support2_matrix);

// add the skeleton to the goal
goal.add(post1);
goal.add(post2);
goal.add(crossbar);
goal.add(back_support1);
goal.add(back_support2);

//rendering the net
const back_net_matrix = new THREE.Matrix4();
const back_net_translation_matrix = new THREE.Matrix4();
const back_net_rotation_matrix = new THREE.Matrix4();
back_net_rotation_matrix.makeRotationX(degrees_to_radians(30));
back_net_translation_matrix.makeTranslation(0,0,-11.547);
back_net_matrix.multiplyMatrices(back_net_translation_matrix, back_net_rotation_matrix);

const back_net_geometry = new THREE.PlaneGeometry( 120, 46.188 );
const nets_material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF, side: THREE.DoubleSide, transparent: true, opacity: 0.4} );
const back_net = new THREE.Mesh( back_net_geometry, nets_material );

back_net.applyMatrix4(back_net_matrix);

goal.add( back_net );

//rendering the goal sides nets
const triangle_shape = new THREE.Shape();
triangle_shape.moveTo(0, 0);
triangle_shape.lineTo(0, 40);
triangle_shape.lineTo(23.094, 0);
triangle_shape.lineTo(0, 0);

const triangle_rotation_matrix = new THREE.Matrix4();
triangle_rotation_matrix.makeRotationY(degrees_to_radians(90));

const triangle1_matrix = new THREE.Matrix4();
const triangle1_translation_matrix = new THREE.Matrix4();
triangle1_translation_matrix.makeTranslation(-59.5,-20,0);
triangle1_matrix.multiplyMatrices(triangle1_translation_matrix, triangle_rotation_matrix);

const triangle2_matrix = new THREE.Matrix4();
const triangle2_translation_matrix = new THREE.Matrix4();
triangle2_translation_matrix.makeTranslation(59.5,-20,0);
triangle2_matrix.multiplyMatrices(triangle2_translation_matrix, triangle_rotation_matrix);

const triangle_geometry = new THREE.ShapeGeometry( triangle_shape );
const triangle1 = new THREE.Mesh( triangle_geometry, nets_material );
const triangle2 = new THREE.Mesh( triangle_geometry, nets_material );

triangle1.applyMatrix4(triangle1_matrix);
goal.add( triangle1 );

triangle2.applyMatrix4(triangle2_matrix);
goal.add( triangle2 );

// rings of the goal
const ring1_matrix = new THREE.Matrix4();
const ring1_translation_matrix = new THREE.Matrix4();
const ring1_rotation_matrix = new THREE.Matrix4();
ring1_rotation_matrix.makeRotationX(degrees_to_radians(90));
ring1_translation_matrix.makeTranslation(0,-20,0)
ring1_matrix.multiplyMatrices(ring1_translation_matrix, ring1_rotation_matrix)

const ring2_matrix = new THREE.Matrix4();
const ring2_translation_matrix = new THREE.Matrix4();
const ring2_rotation_matrix = new THREE.Matrix4();
ring2_rotation_matrix.makeRotationX(degrees_to_radians(90));
ring2_translation_matrix.makeTranslation(0,-20,0)
ring2_matrix.multiplyMatrices(ring2_translation_matrix, ring2_rotation_matrix)

const ring3_matrix = new THREE.Matrix4();
const ring3_translation_matrix = new THREE.Matrix4();
const ring3_rotation_matrix = new THREE.Matrix4();
ring3_rotation_matrix.makeRotationX(degrees_to_radians(60));
ring3_translation_matrix.makeTranslation(0,-23.094,0)
ring3_matrix.multiplyMatrices(ring3_translation_matrix, ring3_rotation_matrix)

const ring4_matrix = new THREE.Matrix4();
const ring4_translation_matrix = new THREE.Matrix4();
const ring4_rotation_matrix = new THREE.Matrix4();
ring4_rotation_matrix.makeRotationX(degrees_to_radians(60));
ring4_translation_matrix.makeTranslation(0,-23.094,0)
ring4_matrix.multiplyMatrices(ring4_translation_matrix, ring4_rotation_matrix)

const ring_geometry = new THREE.TorusGeometry( 1, 1, 15, 40 );
const ring1 = new THREE.Mesh( ring_geometry, goal_material );
const ring2 = new THREE.Mesh( ring_geometry, goal_material );
const ring3 = new THREE.Mesh( ring_geometry, goal_material );
const ring4 = new THREE.Mesh( ring_geometry, goal_material );

ring1.applyMatrix4(ring1_matrix);
post1.add( ring1 );

ring2.applyMatrix4(ring2_matrix);
post2.add( ring2 );

ring3.applyMatrix4(ring3_matrix);
back_support1.add( ring3 );

ring4.applyMatrix4(ring4_matrix);
back_support2.add( ring4 );


//Create flag on top of the goal
const flag = new THREE.Object3D();
// stick of the flag
const stick_matrix = new THREE.Matrix4();
const stick_translation_matrix = new THREE.Matrix4();
stick_translation_matrix.makeTranslation(59,30,0);
stick_matrix.multiply(stick_translation_matrix);
const stick_geometry = new THREE.CylinderGeometry(1, 1, 20, 15);
const stick_material = new THREE.MeshPhongMaterial( {color: 0x000000});
const stick = new THREE.Mesh( stick_geometry, stick_material );
stick.applyMatrix4(stick_matrix);
// flag plane
const flag_plane_matrix = new THREE.Matrix4();
const flag_plane_translation_matrix = new THREE.Matrix4();
const flag_plane_rotation_matrix = new THREE.Matrix4();
flag_plane_translation_matrix.makeTranslation(40,50,0);
flag_plane_matrix.multiplyMatrices(flag_plane_translation_matrix, flag_plane_rotation_matrix);
const flag_plane_material = new THREE.MeshPhongMaterial({ map: argentinaFlagTexture, side: THREE.DoubleSide });
const flag_plane_geometry = new THREE.PlaneGeometry( 40, 20 );
const flag_plane = new THREE.Mesh( flag_plane_geometry, flag_plane_material );
flag_plane.applyMatrix4(flag_plane_matrix);

// build the flag
flag.add(stick);
flag.add(flag_plane);

// add the flag to the goal
goal.add(flag);

// add the goal to the scene
scene.add(goal);

// TODO: Ball
// You should add the ball with the soccer.jpg texture here
const ballGeometry = new THREE.SphereGeometry( 2.5, 30, 15 );
const ballMaterial = new THREE.MeshPhongMaterial({ map: ballTexture });
const ball = new THREE.Mesh( ballGeometry, ballMaterial );

ball.position.set(0, 0, 100);

scene.add( ball );


// TODO: Bezier Curves
const centerForwardRoute = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3( 0, 0, 100 ),
    new THREE.Vector3( 0, 50, 50 ),
    new THREE.Vector3( 0, 0, 0 )
);

const rightWingerRoute = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3( 0, 0, 100 ),
    new THREE.Vector3( 50, 0, 50 ),
    new THREE.Vector3( 0, 0, 0 )
);

const leftWingerRoute = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3( 0, 0, 100 ),
    new THREE.Vector3( -50, 0, 50 ),
    new THREE.Vector3( 0, 0, 0 )
);

const routesList = [leftWingerRoute, centerForwardRoute, rightWingerRoute];


// TODO: Camera Settings
// Set the camera following the ball here
const cameraMovement = new THREE.Matrix4().makeTranslation(0, 0, -0.02);


// TODO: Add collectible cards with textures
class Card extends THREE.Mesh {
    constructor(type, texture) {
        let geometry = new THREE.BoxGeometry(8, 10, 1);
        let material = new THREE.MeshPhongMaterial({ map: texture });

        // Call the parent constructor
        super(geometry, material);

        // Additional properties
        this.type = type;
    }
}

const redCard1 = new Card('Red', redCardTexture);
const redCard2 = new Card('Red', redCardTexture);
const redCard3 = new Card('Red', redCardTexture);
const yellowCard1 = new Card('Yellow', yellowCardTexture);
const yellowCard2 = new Card('Yellow', yellowCardTexture);
const yellowCard3 = new Card('Yellow', yellowCardTexture);
const varCard1 = new Card('VAR', varTexture);
const varCard2 = new Card('VAR', varTexture);
const varCard3 = new Card('VAR', varTexture);

const cardPos1 = rightWingerRoute.getPoint(0.1);
const cardPos2 = centerForwardRoute.getPoint(0.5);
const cardPos3 = rightWingerRoute.getPoint(0.3);
const cardPos4 = leftWingerRoute.getPoint(0.15);
const cardPos5 = leftWingerRoute.getPoint(0.7);
const cardPos6 = leftWingerRoute.getPoint(0.6);
const cardPos7 = leftWingerRoute.getPoint(0.4);
const cardPos8 = centerForwardRoute.getPoint(0.2);
const cardPos9 = rightWingerRoute.getPoint(0.5);


yellowCard1.position.copy(cardPos1);
redCard1.position.copy(cardPos3);
yellowCard2.position.copy(cardPos2);
redCard2.position.copy(cardPos4);
yellowCard3.position.copy(cardPos5);
redCard3.position.copy(cardPos6);
varCard1.position.copy(cardPos7);
varCard2.position.copy(cardPos8);
varCard3.position.copy(cardPos9);

const cardsList = [yellowCard1, redCard1, varCard1 ,yellowCard2, redCard2, varCard2, yellowCard3, redCard3, varCard3];

for (const card of cardsList) {
    scene.add(card);
}

let currentRouteIndex = 1;
let gameStart = false;

let cardsHitList = [];

// TODO: Add keyboard event
// We wrote some of the function for you
const handle_keydown = (e) => {
	if(e.code == 'ArrowLeft') {
		currentRouteIndex = (currentRouteIndex + 2) % 3;
	} else if (e.code == 'ArrowRight') {
        currentRouteIndex = (currentRouteIndex + 1) % 3;
	} else if (e.code == 'Enter') {
        gameStart = true;
    }
}
document.addEventListener('keydown', handle_keydown);


function animate() {
	requestAnimationFrame( animate );

	// TODO: Animation for the ball's position
	if (gameStart) {
        const ballRotationMatrixY = new THREE.Matrix4().makeRotationY(degrees_to_radians(2));
        const ballRotationMatrixX = new THREE.Matrix4().makeRotationX(degrees_to_radians(2));

        ball.applyMatrix4(ballRotationMatrixY);
        ball.applyMatrix4(ballRotationMatrixX);

        if (COUNTER <= STEPS) {
            let point = routesList[currentRouteIndex].getPoint(COUNTER / STEPS);
            ball.position.copy(point);
            camera.applyMatrix4(cameraMovement);
            COUNTER++;
        } else {
            let score = calculate_fair_play_score();
            alert("You're FairPlay score is " + score);
            gameStart = false;
        }
    }

	// TODO: Test for card-ball collision
	for (const card of cardsList) {
        if (checkColision(ball, card)) {
            card.visible = false;
            cardsHitList.push(card);
        }
    }

	
	renderer.render( scene, camera );

}
animate()