// copy from here and put into localstorage and key should be (bestBrain) => {"levels":[{"inputs":[0,0,0,0.020765352174127782,0.47004202746860335],"outputs":[1,0,1,0,1,1],"biases":[-0.08959689871898856,0.033850355285274206,-0.6056795613497429,0.2430799069700147,-0.3620021682941318,-0.2581759788207748],"weights":[[0.055115270487030354,0.4227008733829707,0.06106810244049482,0.35159855271411883,0.05299408912212733,0.1258800804550952],[-0.047200300476404035,0.5000783074131092,-0.07438166144020089,0.24001935255740983,-0.12081386432084265,0.5907629124086244],[-0.32898368800750216,-0.22953967686599383,0.06962783457304872,0.008346952779185027,-0.45691173415398034,-0.1429578840896915],[0.1996116931539425,-0.14567084419690562,-0.017080707786123417,0.19270686635852707,0.13026735567084285,-0.5511877992892849],[0.49457673096983584,-0.1885630785570111,0.3454157604054238,-0.18913333686987416,-0.1558613260704207,-0.4340010849671459]]},{"inputs":[1,0,1,0,1,1],"outputs":[1,0,0,0],"biases":[-0.2196288541547525,0.43889642624584396,-0.19792351910258943,0.12154097296072777],"weights":[[-0.45623790753413057,0.059655691155807586,-0.5047467379230228,-0.10668895384907136],[0.1737621318473599,-0.1494767089233192,-0.044374257542772313,-0.23588954109009677],[0.6121417051255016,0.11232272845431976,-0.14514009921095314,0.31832155752768554],[0.18805362752113225,-0.12259836507595226,0.15300010187551422,0.2612453945409938],[0.04710246831149123,0.35022388329154375,0.22435551358329076,-0.3595905447085482],[0.024570463474304832,-0.1615868465822261,0.1581020211512501,-0.4624687818552607]]}]}




const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);


const N = 5;  //Ai Cars count.
const trafficSpawnDistance = 10000;  //how much distance traffic should be.
const trafficSpawnCount = 50;  // how much traffic should be spawn in trafficSpawnDistance.


const cars = generateCars(N);
// let bestCars=cars[0];
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {

        cars[i].brain = JSON.parse(
            localStorage.getItem("bestBrain"));
            if(i!=0){
                NeuralNetwork.mutate(cars[i].brain,0.1)
            }
    }
};

const traffic = [
    // new Car(road.getLaneCenter(getRandomLane()), -100, 30, 50, "DUMMY", 2,getRandomColor()),
    // new Car(road.getLaneCenter(getRandomLane()), -300, 30, 50, "DUMMY", 2,getRandomColor()),
    // new Car(road.getLaneCenter(getRandomLane()), -300, 30, 50, "DUMMY", 2,getRandomColor()),
    // new Car(road.getLaneCenter(getRandomLane()), -500, 30, 50, "DUMMY", 2,getRandomColor()),
    // new Car(road.getLaneCenter(getRandomLane()), -700, 30, 50, "DUMMY", 2,getRandomColor()),
    // new Car(road.getLaneCenter(getRandomLane()), -700, 30, 50, "DUMMY", 2,getRandomColor()),
    // new Car(road.getLaneCenter(getRandomLane()), -900, 30, 50, "DUMMY", 2,getRandomColor()),
    // new Car(road.getLaneCenter(getRandomLane()), -900, 30, 50, "DUMMY", 2,getRandomColor()),
];



function getRandomMathValue() {
    let values = [];
    for (let i = 200; i <= trafficSpawnDistance; i += 200) {
        values.push(i);
    }
    for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }
    function getRandomValue() {
        if (values.length === 0) {
            return null; // No more values left
        }
        return values.pop();
    }
    return getRandomValue;
};

const getRandomMathValueFunction = getRandomMathValue();

for (let i = 0; i < trafficSpawnCount; i++) {
    let randomValue = getRandomMathValueFunction();
    let Value= -randomValue;
    traffic.push(new Car(road.getLaneCenter(getRandomLane()), Value, 30, 50, "DUMMY", 1,getRandomColor()))
};








animate();


function save() {
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCars.brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function generateCars(N) {
    const cars = [];
    for (let i = 0; i < N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI")); //THE MAIN CAR HERE
    };
    return cars;
}

function animate(time) {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }

    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    bestCars = cars.find(
        c => c.y == Math.min(
            ...cars.map(c => c.y)
        ));

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCars.y + carCanvas.height * 0.7);

    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, "red");
    }
    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx, "blue");

    }
    carCtx.globalAlpha = 1;
    bestCars.draw(carCtx, "blue", true);


    carCtx.restore();

    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCars.brain);
    requestAnimationFrame(animate);
}






