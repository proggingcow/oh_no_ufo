

// initialize kaboom context
const k = kaboom({global:true});


function close_to(a,b) {
    return ((Math.abs(a.x - b.x) < 5 )  && (Math.abs(a.y - b.y) <5))
}

function getArea(e){
  const a = e.area;
  return {
    x:e.pos.x + a.p1.x,
    y:e.pos.y + a.p1.y,
    w:a.p2.x - a.p1.x,
    h:a.p2.y-a.p2.y
  }
}

function hitPointBox(p,b){
  if (p.x < b.x)return false;
  if (p.y < b.y)return false;
  if (p.x > b.x+b.w)return false;
  if (p.y > b.y+b.h)return false;
  return true;
}

function hitCircleCircle(a,b){
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  let d2 =dx*dx+dy*dy;
  let dr = a.r + b.r;
  return dr*dr > d2;
}

function hitCircleBox(c,b){

  if (hitPointBox(c,{
    x:b.x-c.r,
    y:b.y,
    w:b.w+2*c.r,
    h:b.h
  })) return true;
  if (hitPointBox(c,{
    x:b.x,
    y:b.y-c.r,
    w:b.w,
    h:b.h+2*c.r
  }))return true;

  //circle on touching corners
  if (hitCircleCircle(c,{x:b.x,y:b.y,r:0})) return true;
  if (hitCircleCircle(c,{x:b.x+b.w,y:b.y,r:0})) return true;
  if (hitCircleCircle(c,{x:b.x,y:b.y+b.h,r:0})) return true;
  if (hitCircleCircle(c,{x:b.x+b.w,y:b.y+b.h,r:0})) return true;


  return false
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

function vel(friction,x,y){
  friction ??= 0;
  x ??=0;
  y ??=0;
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
loadSprite("explode","explode.png",{
  sliceX:8,
  anims:{
    move:{from:0,to:7}
  }
});
loadSprite("exp","exp.png",{
  sliceX:2,
  anims:{
    move:{from:0,to:1}
  }
});
loadSprite("space_end","where_in_space.png")
loadSprite("exploded","exploded.png")
loadSprite("ufo","ufo.png")
loadSprite("coin","coin.png");
loadSprite("ship","ship.png");
loadSprite("background","background.png")
loadSprite("cufo","comander_ufo.png")
loadSound("gh","gustav_hello.mp3")
loadSound("boom","crash.mp3")
loadSound("ting","ting.mp3")
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

function health(hp,f){
  hp ??= 1;
  f ??= (a)=>{destroy(a)}
  return {

    attack(n){
      hp -= n
      if (hp == 0){
        f(this)
      }
    }
  };
}

function ttl(time){
  return{
    add(){
      this.action(() =>{
        time -= dt()
        if (time <= 0){destroy(this)}
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

function tracker(target,angle,dist){
  return {
    add(){
      action(()=>{
        let a = angle + (target.angle??0);
        this.pos.x =target.pos.x - dist*Math.sin(a);
        this.pos.y = target.pos.y - dist*Math.cos(a);
      })
    }
  }
}

//this: rect(10,40),color(1,1,0),area(vec2(-5,-10),vec2(10,10)),

// define a scene
const s1 = k.scene("main", () => {
    let background = add([sprite("background"),pos(0,0)])
    let un = 11
    let ship = add(["ship",sprite("ship"), pos(320,280),
                  origin("center"),rotate(0),vel(2),keyMove(5,0.5),
                  boundsCheck(edge,()=>{go("left",score)}),angler(4)
                  ]);
    add(["hbox",pos(0,0),tracker(ship,0,20),area(vec2(-7,-7),vec2(7,7)),origin("center")])
    add(["hbox",pos(0,0),tracker(ship,Math.PI,25),area(vec2(-7,-7),vec2(7,7)),origin("center")])
    add(["hbox",pos(0,0),tracker(ship,0,0),area(vec2(-7,-7),vec2(7,7)),origin("center")])




    let score = add(["score",text("score=0",30),pos(0,2),{n:0}]);
    function addScore(n){
      score.n+=n;
      score.text = `score=${score.n}`;
    }

    function dieScore(s){
      return (a)=>{
        let ex = add([sprite("explode",{animSpeed:0.1}),ttl(0.8),pos(a.pos.x,a.pos.y),origin("center"),"crash"])
        ex.play("move")
        destroy(a);
        addScore(s);
      }
    }

    collides("hbox","exp", (h,e) =>{
      play("ting")
      addScore(3)
      destroy(e)
    });
    collides("ufo","cufo", (u,c) =>{
      let ex = add([sprite("explode",{animSpeed:0.1}),ttl(0.8),pos(u.pos.x,u.pos.y),origin("center"),"crash"])
      ex.play("move")
      destroy(u)
      c.attack(1)
      play("boom")
    });
    collides("crash","hbox", (c,h)=>{
      go("exploded",score)
    });
    collides("cufo","cufo", (u,c) =>{
      play("boom")
      u.attack(1)
      c.attack(1)
    });
    collides("ufo","ufo",(a,b)=>{
      play("boom")
      addScore(1)
      let ex = add([sprite("explode",{animSpeed:0.1}),ttl(0.8),pos(a.pos.x,a.pos.y),origin("center"),"crash"])
      ex.play("move")
      ex = add([sprite("explode",{animSpeed:0.1}),ttl(0.8),pos(b.pos.x,b.pos.y),origin("center"),"crash"])
      ex.play("move")
      destroy(a)
      destroy(b)
    });

    {
      let h = 1
      loop(60 ,()=>{
        if (h === 1) {
          h++
          return;
        }
        let e = Math.floor(Math.random() * 4);
        let p = pos(0,0);
        switch (e){
          case 0 : p = pos(Math.random()* 680-20,-20);
          break;
          case 1 : p = pos(Math.random()*680-20,500);
          break;
          case 2 : p = pos(-40,Math.random()*520-20);
          break;
          default: p = pos(680,Math.random()*520-20);
        }
        add([p,chaser(ship),sprite("cufo"),origin("center"),"cufo","crash",health(h,dieScore(h)),area(vec2(-30,-13),vec2(30,13))])
        h += 1
      });
    }

    loop(2 ,()=>{
      let e = Math.floor(Math.random()*15)
      if (e === 0){
        let n = Math.floor(Math.random() * 4);
        let p = pos(0,0);
        let sx = 0
        let sy = 0
        switch (n){
          case 0 :
          p = pos(Math.random()* 680-20,-20);
          sy = 100
          break;
          case 1 :
          p = pos(Math.random()*680-20,500);
          sy = -100;
          break;
          case 2 :
          p = pos(-20,Math.random()*520-20);
          sx=100
          break;
          default:
          p = pos(660,Math.random()*520-20);
          sx = -100
        }
        let a = add([p,"exp",sprite("exp",{animSpeed:0.5}),origin("center"),vel(0,sx,sy),ttl(7)]);
        a.play("move");
      }

    });

    loop(5 ,()=>{
            if(un < 11.5 && un > 0.5){
              un = 0
              return;
            }
            let e= Math.floor(Math.random() * 4);
            let p = pos(0,0);
            switch (e){
              case 0 : p = pos(Math.random()* 680-20,-20);
              break;
              case 1 : p = pos(Math.random()*680-20,500);
              break;
              case 2 : p = pos(-40,Math.random()*520-20);
              break;
              default: p = pos(680,Math.random()*520-20);
            }
            add(["ufo",sprite("ufo"),p,chaser(ship),"crash",origin("center"),area(vec2(-30,-13),vec2(30,13))])
            un += 1
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
    play("boom")
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
    play("gh")
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
