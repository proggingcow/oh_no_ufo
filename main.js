

// initialize kaboom context
const k = kaboom({global:true});


function close_to(a,b) {
    return ((Math.abs(a.x - b.x) < 5 )  && (Math.abs(a.y - b.y) <5))
}

function hitCircleCircle(a,b){
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  let d2 =dx*dx+dy*dy;
  let dr = a.r + b.r;
  return dr*dr > d2;
}

function hitCircleBox(c,b){
  if (c.x+c.r < b.x)return false;
  if (c.y+c.r < b.y)return false;
  if (c.x-c.r > b.x+b.w)return false;
  if (c.y-c.r > b.y+b.h)return false;
  if ( c.x > b.x &&  c.y> b.y && c.x < b.x + b.w && c.y < b.y +b.h)return true;

}


function trueCollides(a,b){
  if (! a.boundSet) {return true}
  if (! )
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
    push_aVel(pushf (! )){
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
loadSprite("space_end","where_in_space.png")
loadSprite("exploded","exploded.png")
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



function smallBounds(points){
  //points [{angle, dist, size}]
  return {
    function boundSet(){
      let res = [];
      let a = this.angle ?? 0;
      for(i in points){
        let p = points[i];
        let a2 = a + (p.angle ?? 0);
        let x = this.pos.x - p.dist * Math.sin(a2);
        let y = this.pos.y - p.dist * Math.cos(a2);
        res.push({x:x,y:y,size:p.size});
      }
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

//this: rect(10,40),color(1,1,0),area(vec2(-5,-10),vec2(10,10)),

// define a scene
const s1 = k.scene("main", () => {
    let background = add([sprite("background"),pos(0,0)])
    let ship = add(["ship",sprite("ship") ,scale(2,3), pos(300,400),origin("center"),rotate(0),vel(2),keyMove(5,0.5),boundsCheck(edge,()=>{go("left",score)}),angler(4)]);
    let score = add(["score",text("score=0",30),pos(0,2),{n:0}]);
    function addScore(n){
      score.n+=n;
      score.text = `score=${score.n}`;
    }

    ship.collides("ufo",()=>{rect(10,40),color(1,1,0),area(vec2(-5,-10),vec2(10,10)),
      if (! trueCollides(a,b)) return ;

      go("exploded",score)
    });

    collides("ufo","ufo",(a,b)=>{
      addScore(1)
      destroy(a)
      destroy(b)
    });

    loop(5 ,()=>{
            let e= Math.floor(Math.random() * 4);
            let p = pos(0,0);
            switch (e){
              case 0 : p = pos(Math.random()* 680-20,-20);
              break;
              case 1 : p = pos(Math.random()*680-20,500);
              break;
              case 2 : p = pos(-40,Math.random()*520-40);
              break;
              default: p = pos(680,Math.random()*520-20);
            }
            add(["ufo",sprite("ufo"),p,chaser(ship),origin("center")])
    });
    keyPress("space",()=>{go("two",score)})
});

const s2 = k.scene("two",(score) => {
    let background = add([sprite("background"),pos(0,0)])
    let fScore = add(["score",text(`final score=${score.n}`,30),pos(0,2)])
    k.add([
        k.text("game stoped",32),
        k.pos(320,240),
        k.origin("center")
    ]);
    keyPress("space",()=>{go("main")})
});
const s3 = k.scene("exploded",(score) => {
    let background = add([sprite("exploded"),pos(0,0)])
    let fScore = add(["score",text(`final score=${score.n}`,30),pos(0,2)])
    k.add([
        k.text("game over",32),
        k.pos(320,240),
        k.origin("center")
    ]);
    keyPress("space",()=>{go("main")})
});
const sl = k.scene("left",(score) => {
    let background = add([sprite("space_end"),pos(0,0)])
    let fScore = add(["score",text(`final score=${score.n}`,30),pos(0,2)])
    k.add([
        k.text("game over",32),
        k.pos(320,240),
        k.origin("center")
    ]);
    keyPress("space",()=>{go("main")})
});
const ss = k.scene("ss",() => {
    let background = add([sprite("background"),pos(0,0)])
    k.add([
        k.text("start game:space",32),
        k.pos(320,240),
        k.origin("center")
    ]);
    keyPress("space",()=>{go("main")})
});


// start the game
k.start("ss");
