

// initialize kaboom context
const k = kaboom({global:true});


function close_to(a,b) {
    return ((Math.abs(a.x - b.x) < 5 )  && (Math.abs(a.y - b.y) <5))
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
        this.move(x,y)

      })
    },
    push_vel(dx,dy){
      x+=dx
      y+=dy
    }
  }
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
            keyDown("up" ,()=>{
                this.push_vel(0,-dist);
            });
            keyDown("down",()=>{
                this.push_vel(0,dist);
            });
            keyDown("right",()=>{
                this.push_vel(dist,0);
            });
            keyDown("left",()=>{
                this.push_vel(-dist,0);
            });
        }
    }
}



// define a scene
const s1 = k.scene("main", () => {
    let ship = add(["ship",sprite("ship") ,scale(2,3), pos(300,400),origin("center"),rotate(0),vel(2),keyMove(5)]);


    ship.collides("ufo",()=>{
      go("two")
    });

    loop(10 ,()=>{
            add(["ufo",sprite("ufo"),pos(-20,-20),chaser(ship),origin("center")])
    });
    keyPress("space",()=>{go("two")})
});

const s2 = k.scene("two",() => {
    k.add([
        k.text("game over",32),
        k.pos(100,200),
    ]);
    keyPress("space",()=>{go("main")})
});


// start the game
k.start("main");
