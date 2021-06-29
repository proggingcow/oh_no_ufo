
    
// initialize kaboom context
const k = kaboom({global:true});


function close_to(a,b) {
    return ((Math.abs(a.x - b.x) < 5 )  && (Math.abs(a.y - b.y) <5))
}





loadRoot("assets/");
loadSprite("coin","coin.png");
loadSprite("ship","ship.png");
loadSprite("alien","alien.png",{
    sliceX:3,
    anims:{
        move:{from:0,to:1},
    },

});

const wayPoints=[{x:600,y:50},{x:50,y:350},{x:10,y:10},{x:1,y:1}];
const way2 = [ { x:100,y:500}, {x:500,y:100}];

function waypoints(wps,speed) {
    let index = 0;
    let next_wp = wps[index];
    return {
        add (){
            this.action(()=> {
                if (this.pos.x < next_wp.x) {
                    this.move(speed,0)
                }
                if (this.pos.x > next_wp.x ){
                    this.move(-speed,0)
                } 
                if (this.pos.y < next_wp.y) {
                    this.move(0,speed)
                }
                if (this.pos.y > next_wp.y ){
                    this.move(0,-speed)
                } 
                if (close_to(this.pos,next_wp)) {
                    index = (index +1) % wps.length;
                    next_wp = wps[index];
                }
            })
        }
    };
}

function spinner(speed) {
   return {
       add() {
            this.action(()=>{
                this.angle += speed * dt();
            })
        }
   }
}

function keyMove(dist){
    return {
        add(){
            keyPress("up" ,()=>{
                this.pos.y -=dist;
            });  
            keyPress("down",()=>{
                this.pos.y +=dist;
            });
            keyPress("right",()=>{
                this.pos.x += dist;
            });
            keyPress("left",()=>{
                this.pos.x -= dist;
            });
        }
    }
}



// define a scene
const s1 = k.scene("main", () => {
    // add a text at position (100, 100)
    const ohi = k.add([
        text("Aliennnnns", 32),
        pos(100, 100),
    ]);


    const al = add(["alien",sprite("alien"),pos(60,10),origin("center"),waypoints(wayPoints,300)]);
    al.animSpeed = 0.2;
    al.play("move");


    add(["ship",sprite("ship") , pos(300,400),origin("center"),rotate(0),keyMove(30)]);


    

    loop(4 ,()=>{
        add(["coin",sprite("coin"),pos(10,10),waypoints(wayPoints,100),rotate(0),spinner(2),origin("center")]);
    });
    keyPress("space",()=>{go("two")})
});

const s2 = k.scene("two",() => {
    k.add([
        k.text("This two",32),
        k.pos(100,200),
    ]);
    keyPress("space",()=>{go("main")})
});


// start the game
k.start("main");

