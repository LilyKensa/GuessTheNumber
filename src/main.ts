import "./style.css";
import rootHtml from "./root.html?raw";

$("#app").html(rootHtml);

// utils

function shakeScreen(strength = 5) {
  let duration = 15;
  let step = () => {
    duration--;
    if (duration < 0) {
      $("body").css("transform", "");
      return;
    }
    $("body").css(
      "transform", 
      `translate(${(Math.random() * 2 - 1) * strength}px, ${(Math.random() * 2 - 1) * strength}px)`
    );
    
    window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

// main

enum State {
  Opening,
  Title,
  Game
}

let state = State.Opening;

$(window).on("click", () => {
  if (state === State.Title) {
    $(".intro").css("display", "none");
    state = State.Game;
    genNumbers();
  }
});

$(window).on("keydown", (ev) => {
  if (state === State.Title && ev.key === "Enter") {
    $(".intro").css("display", "none");
    state = State.Game;
    genNumbers();
  }
});

function genNumbers() {
  $(".game").css("display", "");
  $(".guess").css("display", "none");

  let getNum = () => 1 + Math.floor(Math.random() * 100);

  let ans = getNum();

  let tossTimeout = -1;

  $(window).on("keydown.skipGen", (ev) => {
    if (ev.key === "Enter") {
      $(window).off("keydown.skipGen");
      clearTimeout(tossTimeout);

      $(".main-text").css({
        fontSize: "108px",
        transform: ""
      });

      guess(ans);
    }
  });
  
  let tossTimes = 50;
  let tossRandom = () => {
    tossTimes--;
    if (tossTimes < 0) {
      $(window).off("keydown.skipGen");

      $(".main-text").css({
        fontSize: "108px",
        transform: ""
      });
      $(".main-text").html("Number Generated!");
      shakeScreen();

      setTimeout(() => guess(ans), 1800);

      return;
    }

    $(".main-text").css({
      fontSize: `${146 - tossTimes}px`,
      transform: `rotate(${Math.random() * 12 - 6}deg)`
    });

    let n = getNum();
    $(".main-text").html(n.toString());

    tossTimeout = setTimeout(tossRandom, 25);
  }
  tossRandom();
}

function guess(ans: number) {
  $(".guess").css("display", "");

  $("#guess-input").attr("placeholder", "Type here...");

  $(".progress").css({
    "--left": "0%",
    "--right": "100%"
  });
  $(".progress-text.left").html("0");
  $(".progress-text.right").html("100");

  shakeScreen();
  $(".main-text").html("Take Your Guess!");

  let removeRedFrameTimeout = -1;
  let redFrame = () => {
    $("#guess-input").css("border-color", "red");

    clearTimeout(removeRedFrameTimeout);
    removeRedFrameTimeout = setTimeout(() => {
      $("#guess-input").css("border-color", "");
    }, 200);
  };

  let guessTimes = 0;

  let left = 0, right = 100;

  $("#guess-input").on("keydown", (ev) => {
    if (ev.key !== "Enter") return;
    
    let val = Number.parseInt($("#guess-input").val() as string);
    
    $("#guess-input").val("");

    if (Number.isNaN(val) || val > 100 || val < 1) {
      $("#guess-input").attr("placeholder", "Invalid number!");
      redFrame();
      return;
    }

    guessTimes++;

    if (val === ans) {
      $("#guess-input").off("keydown");
      hit(guessTimes);
      return;
    }

    $("#guess-input").attr("placeholder", `${val} was too ${val < ans ? "small" : "big"}`);

    if (val > left && val < ans) left = val;
    else if (val < right && val > ans) right = val;
    else return;

    let prop = val < ans ? "left" : "right";

    $(".progress").css(`--${prop}`, `${val}%`);
    jQuery(`.progress-text.${prop}`).html(`${val}`);

    if (right - left < 8) {
      $(".progress-text.left" ).css("--offset", "-18px");
      $(".progress-text.right").css("--offset", "18px");
    }
  });

  $("#guess-input").trigger("focus");
}

function hit(times: number) {
  $(".guess").css("display", "none");

  shakeScreen();
  confetti();

  $(".main-text").html("");

  let conclusion = `Hit in ${times} Tries!`, conclusionIndex = 0;

  let typeConclusion = () => {
    conclusionIndex++;
    if (conclusionIndex > conclusion.length) {
      setTimeout(() => {
        restart(200, true);
      }, 1200);
      return;
    }
    $(".main-text").html(conclusion.slice(0, conclusionIndex));
    setTimeout(typeConclusion, 40);
  }
  setTimeout(typeConclusion, 100);
}

function restart(delay = 0, re = false) {
  if (re) state = State.Title;

  $(".game").css("display", "none");
  $(".intro").css("display", "");

  $(".title").css({
    opacity: 0,
    transform: "scale(2)"
  });
  setTimeout(() => {
    $(".title").css({
      opacity: 1,
      transform: "scale(1)"
    });
    shakeScreen();
  }, delay);

  $(".description").html("&ZeroWidthSpace;");
  
  let description = "Tap Screen / Enter to Start", descriptionIndex = 0;
  
  let typeDescription = () => {
    descriptionIndex++;
    if (descriptionIndex > description.length) return;
    $(".description").html(description.slice(0, descriptionIndex));
    setTimeout(typeDescription, 25);
  }
  setTimeout(typeDescription, delay + 400);
}

// intro animation

$(".background").css({
  opacity: 0,
  transition: "800ms"
});
setTimeout(() => {
  $(".background").css({
    opacity: 1
  });
}, 200);
setTimeout(() => {
  $(".background").css({
    transition: "100ms"
  });
}, 1000);

restart(800);

setTimeout(() => {
  state = State.Title;
}, 1200);

// background

let mousePos = {
  x: window.innerWidth * .5,
  y: window.innerHeight * .5
};

$(window).on("mousemove", (ev) => {
  mousePos = {
    x: ev.pageX,
    y: ev.pageY
  }
});

function updateBackground() {
  let deltaX = mousePos.x - window.innerWidth  * .5,
      deltaY = mousePos.y - window.innerHeight * .5,
      rotateX = -(deltaY / window.innerHeight) * 5,
      rotateY =  (deltaX / window.innerWidth ) * 5;

  $(".background").css("--rotate", `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
}

// particles

interface Particle {
  el: HTMLDivElement,
  size: number,
  x: number,
  y: number,
  xv: number,
  yv: number,
  duration: number,
  age: number,
  rotation: number
}

let particles: Particle[] = [];

function spawnParticle(x: number, y: number, xv: number, yv: number, size: number = 8, duration: number = 800, color?: string) {
  let el = document.createElement("div");
  el.classList.add("particle-dust");
  document.querySelector(".particles")!.appendChild(el);

  $(el).css({
    width: size + "px",
    height: size + "px",
    position: "absolute",
    backgroundColor: color || "#eeeeee"
  });

  particles.push({
    x, y, xv, yv, size, duration,
    el,
    age: 0, 
    rotation: (Math.random() * 2 - 1) * 5,
  });
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; --i) {
    const p = particles[i];

    p.age++;
    if (p.age >= p.duration) {
      p.el.remove();
      particles.splice(i, 1);
      continue;
    }

    p.x += p.xv;
    p.y += p.yv;

    p.yv += 0.8;

    p.xv *= 0.98;
    p.yv *= 0.96;

    $(p.el).css({
      left: p.x - p.size + "px",
      top: p.y - p.size + "px",
      transform: `rotate(${p.rotation * p.age}deg)`
    })
  }
}

let colors = [
  "#eeeeee",
  "#ddbbff",
  "#bbaacc"
]
let randomParticleColor = () => colors[Math.floor(Math.random() * colors.length)];

function confetti() {
  let amount = 40;
  let spawn = () => {
    amount--;
    if (amount < 0) return;

    let angle = Math.random() * Math.PI * .5;
    spawnParticle(
      0, window.innerHeight, 
      Math.random() * Math.cos(angle) * 64, -Math.random() * Math.sin(angle) * 80, 
      8 + Math.random() * 5,
      800,
      randomParticleColor()
    );
    spawnParticle(
      window.innerWidth, window.innerHeight, 
      -Math.random() * Math.cos(angle) * 64, -Math.random() * Math.sin(angle) * 80, 
      8 + Math.random() * 5,
      800,
      randomParticleColor()
    );

    setTimeout(spawn, 5);
  };
  spawn();
}

function firework(amount = 1, density = 0.5) {
  for (let i = 0; i < amount; ++i) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 2 + Math.random() * 8;

    spawnParticle(
      mousePos.x + speed * Math.cos(angle) * 5 * density,
      mousePos.y + speed * Math.sin(angle) * 5 * density,
      speed * Math.cos(angle),
      speed * Math.sin(angle),
      8 + Math.random() * 5,
      800,
      randomParticleColor()
    );
  }
}

$(window).on("mousedown", () => {
  firework(5);
});

// tick

function tick() {
  updateBackground();
  updateParticles();

  window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);
