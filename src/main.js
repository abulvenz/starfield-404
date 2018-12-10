import m from "mithril";
import tagl from "tagl-mithril";
import fn from "./fn";

const { svg, circle, text, g } = tagl(m);

let space_width = innerWidth * 15;
let space_height = innerHeight * 15;
let space_depth = 100;
let frust = 0.3;

let numberOfStars = 404;

//* Set to 0 for no fade, set to 1 for fade in effect. */
let darkness = 1;

let title = "Not found";

const point = ({ x, y, z }) => {
  let _x = x;
  let _y = y;
  let _z = z;
  return {
    x: () => _x,
    y: () => _y,
    z: () => _z,
    str: () => _x + ", " + _y + ", " + _z,
    add: p => {
      _x += p.x();
      _y += p.y();
      _z += p.z();
    },
    trim: () => {
      _z =
        _z < 1
          ? _z + space_depth - 1
          : _z > space_depth
          ? _z - space_depth - 1
          : _z;
    }
  };
};

const star = () => {
  let _pos = point({
    x: (Math.random() - 0.5) * space_width,
    y: (Math.random() - 0.5) * space_height,
    z: Math.random() * space_depth + 1
  });
  let _vel = point({
    x: 0 * (Math.random() * 1 - 0.5),
    y: 0 * (Math.random() * 1 - 0.5),
    z: -0.5
  });
  return {
    pos: _pos,
    vel: _vel,
    str: () => `[ ${_pos.str()} | ${_vel.str()} ]`,
    move: () => {
      _pos.add(_vel);
      _pos.trim();
    }
  };
};

const stars = fn.range(0, numberOfStars).map(star);

const iterate = () => {
  stars.forEach(star => {
    star.move();
  });
  darkness -= 0.01;
  darkness = Math.max(0, darkness);
  m.redraw();
};

setInterval(iterate, 50);

class Star {
  view(vnode) {
    let s = vnode.attrs.star;
    let z__ = 15 / s.pos.z();
    if (s.pos.z() < 1) s.pos = point(s.pos.x(), s.pos.y(), 100);
    return circle({
      cx: (s.pos.x() - innerWidth * 0.5) / s.pos.z() / frust + innerWidth * 0.5,
      cy:
        (s.pos.y() - innerHeight * 0.5) / s.pos.z() / frust + innerHeight * 0.5,
      stroke: "lightgray",
      "stroke-width": z__ * 0.5,
      "stroke-opacity": 0.3,
      fill: "white",
      "fill-opacity": 0.7,
      r: z__
    });
  }
}

class Space {
  view(vnode) {
    return svg(
      {
        width: innerWidth,
        height: innerHeight,
        style: `background-color:rgb(${darkness * 255},${darkness *
          255},${darkness * 255})`
      },
      stars.map((star, idx) => m(Star, { key: idx, star: star })),
      g(
        {},
        text(
          {
            x: "50%",
            y: "50%",
            style: "font: bold 160px sans-serif;",
            stroke: "lightgray",
            "stroke-opacity": 0.3,
            "text-anchor": "middle",
            "fill-opacity": 0
          },
          "404"
        ),
        text(
          {
            x: "50%",
            y: "75%",
            style: "font: bold 36px sans-serif;",
            stroke: "lightgray",
            "stroke-opacity": 0.3,
            "text-anchor": "middle",
            "fill-opacity": 0
          },
          "Empty Space"
        ),
        text(
          {
            x: "50%",
            y: "15%",
            style: "font: bold 36px sans-serif;",
            stroke: "lightgray",
            "stroke-opacity": 0.3,
            "text-anchor": "middle",
            "fill-opacity": 0
          },
          title || "Empty Space"
        )
      )
    );
  }
}

m.mount(document.body, Space);
