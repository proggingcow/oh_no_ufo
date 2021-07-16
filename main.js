

// initialize kaboom context
const k = kaboom({global:true});


function close_to(a,b) {
    return ((Math.abs(a.x - b.x) < 5 )  && (Math.abs(a.y - b.y) <5))
}

function angler(friction){
  friction ??= 0;
  let aVel = 0;
  return{
    add(){
      this.action(()=>{
        aVel *= 1-(dt() *friction);
        if (Math.abs(aVel)<0.3) {aVel=0};
        this.angle += aVel*dt();
      })
    },
    push_aVel(push){
      aVel += push;
    }
  }
}

function vel(friction){
  friction ??= 0;
  let x =0;
  let y =0;
  return{
    add(){
      this.action(()=> {
        x *= 1-(dt() *friction);
        y *= 1-(dt() *friction);
        if (Math.abs(x)<1) {x=0};
        if (Math.abs(y)<1) {y=0};
        this.move(x,y)

      })
    },
    push_vel(dx,dy){
      x+=dx
      y+=dy
    }
  }
}

function boundsCheck(bounds, f){
  f ??= ()=>{go("two")};
  return{
    add(){
      this.action(()=>{
      if (this.pos.x > bounds.x + bounds.w) {f(this)};
      if (this.pos.x < bounds.x) {f(this)};
      if (this.pos.y > bounds.y + bounds.h) {f(this)};
      if (this.pos.y < bounds.y) {f(this)};
    });
    }
  }
}


loadRoot("assets/");
loadSprite("ufo","ufo.png")
loadSprite("coin","coin.png");
loadSprite("ship","ship.png");
loadSprite("background","background.png")
loadSprite("alien","alien.png",{
    sliceX:3,
    anims:{
        move:{from:0,to:1},
    },

});

const wayPoints=[{x:600,y:50},{x:50,y:350},{x:10,y:10},{x:1,y:1}];
const way2 = [ { x:100,y:500}, {x:500,y:100}];
const edge = {x:0,y:0,w:640,h:480}

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

function keyMove(dist,rot){
    return {
        add(){
            keyDown("up" ,()=>{
                this.push_vel(-dist * Math.sin(this.angle),-dist * Math.cos(this.angle));
            });
            keyDown("down",()=>{
                this.push_vel(dist * Math.sin(this.angle),dist * Math.cos(this.angle));
            });
            keyDown("right",()=>{
                this.push_aVel(-rot);
            });
            keyDown("left",()=>{
                this.push_aVel(rot);
            });
        }
    }
}



// define a scene
const s1 = k.scene("main", () => {
    let background = add([sprite("background"),pos(0,0)])
    let ship = add(["ship",sprite("ship") ,scale(2,3), pos(300,400),origin("center"),rotate(0),vel(2),keyMove(5,0.5),boundsCheck(edge),angler(4)]);


    ship.collides("ufo",()=>{
      go("two")
    });

    loop(10 ,()=>{
            add(["ufo",sprite("ufo"),pos(-20,-20),chaser(ship),origin("center")])
    });
    keyPress("space",()=>{go("two")})
});

const s2 = k.scene("two",() => {
    let background = add([sprite("background"),pos(0,0)])
    k.add([
        k.text("game over",32),
        k.pos(100,200),
    ]);
    keyPress("space",()=>{go("main")})
});


// start the game
k.start("main");
