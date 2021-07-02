

// initialize kaboom context
const k = kaboom({global:true});


function close_to(a,b) {
    return ((Math.abs(a.x - b.x) < 5 )  && (Math.abs(a.y - b.y) <5))
}





loadRoot("assets/");
loadSprite("ufo","ufo.png")
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

function chaser(target){
  return{
    add(){
      this.action(()=>{
        if (this.pos.x < target.pos.x) {
            this.move(20,0)
        }
        if (this.pos.x > target.pos.x ){
            this.move(-20,0)
        }
        if (this.pos.y < target.pos.y) {
            this.move(0,20)
        }
        if (this.pos.y > target.pos.y ){
            this.move(0,-20)
        }
      });
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
    let ship = add(["ship",sprite("ship") , pos(300,400),origin("center"),rotate(0),keyMove(30)]);




    loop(10 ,()=>{
            add(["ufo",sprite("ufo"),pos(-20,-20),chaser(ship)])
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
