import {
  WaterColorBrush,
  WaterDrop,
  BugBrush,
  MilkyWayBrush,
} from "./brush/index.js";
import { rgbToHsl, hexToRgb, clearCanvas } from "./utils.js";
import { brushType } from "./type.js";

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

const moistureLevelElement = document.querySelector(".moistureLevel");
const brushSizeElement = document.querySelector(".brushSize");

const colorPicker = document.getElementById("colorPicker");
const brushSelector = document.getElementById("brushSelector");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isDragging = false;
let selectedBrushType = brushSelector.value;

const mouse = {
  x: undefined,
  y: undefined,
};

const selectedColor = {
  h: 0,
  s: undefined, // 아직 사용 안함
  l: undefined, // 아직 사용 안함
};

let waterColorCircles = [];
const bugBrushes = [];
const milkyWays = [];
let waterDrops = [];

const brushFunctions = {};

const buildBrushFunctions = () => {
  switch (selectedBrushType) {
    case brushType.WaterColorBrush:
      brushFunctions.animate = () => {
        waterColorCircles.forEach((waterColorCircle) => {
          waterColorCircle.update();
          waterColorCircle.draw();
        });
        waterColorCircles = waterColorCircles.filter(
          (waterColorCircle) => !waterColorCircle.isFading
        );

        new WaterColorBrush({
          ctx,
          mouse,
          moistureLevel: Number(moistureLevelElement.value),
          brushSize: Number(brushSizeElement.value),
          selectedColor,
        }).cursor({ size: Number(brushSizeElement.value) * 1.5 });
      };
      brushFunctions.click = () => {
        waterColorCircles.push(
          new WaterColorBrush({
            ctx,
            mouse,
            moistureLevel: Number(moistureLevelElement.value),
            brushSize: Number(brushSizeElement.value),
            selectedColor,
          })
        );
      };
      brushFunctions.drag = () => {
        const brushVoulumn = 5; // 브러쉬를 풍성하게. 높을수록 많은 양
        for (let i = 0; i < brushVoulumn; i++) {
          waterColorCircles.push(
            new WaterColorBrush({
              ctx,
              mouse,
              moistureLevel: Number(moistureLevelElement.value),
              brushSize: Number(brushSizeElement.value),
              selectedColor,
            })
          );
        }
      };
      break;

    case brushType.BugBrush:
      brushFunctions.animate = () => {
        bugBrushes.forEach((i) => i.update());
        bugBrushes.forEach((i) => i.draw(ctx));
      };
      brushFunctions.drag = () => {
        bugBrushes.push(
          new BugBrush({ x: mouse.x, y: mouse.y, selectedColor })
        );
      };
      break;

    case brushType.WaterDrop:
      brushFunctions.animate = () => {
        waterDrops.forEach((waterDrop) => {
          waterDrop.update();
          waterDrop.draw();
        });
        waterDrops = waterDrops.filter(
          (waterDrop) => !waterDrop.isOutOfCanvas()
        );

        new WaterDrop({
          ctx,
          mouse,
          canvas,
        }).cursor({ size: 40 });
      };
      brushFunctions.click = () => {
        waterDrops.push(
          new WaterDrop({
            ctx,
            mouse,
            canvas,
            waterDrops,
          })
        );
      };
      let timer = 0;
      const interval = 20;
      brushFunctions.drag = () => {
        timer++;
        if (timer >= interval) {
          timer = 0;
          waterDrops.push(
            new WaterDrop({
              ctx,
              mouse,
              canvas,
              waterDrops,
            })
          );
        }
      };
      break;

    case brushType.MilkyWayBrush:
      brushFunctions.animate = () => {
        milkyWays.forEach((i) => i.update());
        milkyWays.forEach((i) => i.draw(ctx));
      };
      brushFunctions.drag = () => {
        milkyWays.push(new MilkyWayBrush({ x: mouse.x, y: mouse.y }));
      };
      break;
  }
};

const animate = () => {
  clearCanvas({ ctx, canvas });
  brushFunctions.animate?.();
  requestAnimationFrame(animate);
};

animate();
buildBrushFunctions();

const handleClickAction = (e) => {
  isDragging = true;

  mouse.x = e.x;
  mouse.y = e.y;

  brushFunctions.click?.();
};

const handleMoveAction = (e) => {
  mouse.x = e.x;
  mouse.y = e.y;

  if (!isDragging) return;

  brushFunctions.drag?.();
};

const handleReleaseAction = () => {
  isDragging = false;
};

function updateColor() {
  const color = colorPicker.value;
  const hslColor = rgbToHsl(hexToRgb(color));

  selectedColor.h = hslColor[0];
  selectedColor.s = hslColor[1];
  selectedColor.l = hslColor[2];
}

canvas.addEventListener("mousedown", (e) => handleClickAction(e));
canvas.addEventListener("mousemove", (e) => handleMoveAction(e));
canvas.addEventListener("mouseup", () => handleReleaseAction());

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  e.x = e.changedTouches[0].pageX;
  e.y = e.changedTouches[0].pageY;
  handleClickAction(e);
});
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  e.x = e.changedTouches[0].pageX;
  e.y = e.changedTouches[0].pageY;
  handleMoveAction(e);
});
canvas.addEventListener("touchend", () => handleReleaseAction());

brushSelector.addEventListener("change", (e) => {
  selectedBrushType = e.target.value;
  buildBrushFunctions();
  clearCanvas({ ctx, canvas });
});

colorPicker.addEventListener("change", () => updateColor());

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
