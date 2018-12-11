import m from "mithril";
import tagl from "tagl-mithril";
import fn from "./fn";

const { canvas } = tagl(m);

let space_width = innerWidth * 15;
let space_height = innerHeight * 15;
let space_depth = 100;
let frust = 0.3;

let numberOfStars = 2040;

let rrr = 0;

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
    x: rrr * (Math.random() * 1 - 0.5),
    y: rrr * (Math.random() * 1 - 0.5),
    z: rrr * Math.random() - 0.5
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

let mypos = () => {
  x, y, z, rx, ry, rz;
};

const vMat = ({ x, y, z, rx, ry, rz }) => {
  let ca = Math.cos(rz);
  let cb = Math.cos(ry);
  let cc = Math.cos(rx);
  let sa = Math.sin(rz);
  let sb = Math.sin(ry);
  let sc = Math.sin(rx);

  let rows = [
    [ca * cb, ca * sb * sc - sa * cc, ca * sb * cc + sa * sc, x],
    [sa * cb, sa * sb * sc + ca * cc, sa * sb * cc - ca * sc, y],
    [-sb, cb * sc, cb * cc, z][(0, 0, 0, 1)]
  ];

  let a = rows[0][0]*x + rows[1][0]*y+rows[2][0]*z;
  let b = rows[0][1]*x + rows[1][1]*y+rows[2][1]*z;
  let c = rows[0][2]*x + rows[1][2]*y+rows[2][2]*z;

  let inv = [
      [rows[0][0],rows[1][0],rows[2][0],-a],
      [rows[0][1],rows[1][1],rows[2][1],-b],
      [rows[0][2],rows[1][2],rows[2][2],-c],
  ];

  return {
    toView: ({ x, y, z }) => {
      let result = {
        x: inv[0][0] * x + inv[0][1] * y + inv[0][2] * y - inv[0][3],
        y: inv[1][0] * x + inv[1][1] * y + inv[1][2] * y - inv[1][3],
        z: inv[2][0] * x + inv[2][1] * y + inv[2][2] * y - inv[2][3]
      };

      return result;
    }
  };
};

const grad2rad = a => a / 180 * Math.PI;


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
  oncreate(vnode) {
    console.log(vnode.dom);
    this.ctx = vnode.dom.getContext("2d");
    this.clear();
  }
  clear() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, innerWidth, innerHeight);
  }
  onbeforeupdate(vnode) {
    this.clear();

    stars.forEach(s => {
      this.ctx.beginPath();

      let z__ = 15 / s.pos.z();
      if (s.pos.z() < 1) s.pos = point(s.pos.x(), s.pos.y(), 100);
      let cx =
        (s.pos.x() - innerWidth * 0.5) / s.pos.z() / frust + innerWidth * 0.5;
      let cy =
        (s.pos.y() - innerHeight * 0.5) / s.pos.z() / frust + innerHeight * 0.5;
      this.ctx.arc(cx, cy, z__, 0, 2 * Math.PI);
      this.ctx.fillStyle = "white";
      this.ctx.fill();
    });
  }

  view(vnode) {
    return canvas.$canvas({
      width: innerWidth,
      height: innerHeight
    });
  }
}

m.mount(document.body, Space);
