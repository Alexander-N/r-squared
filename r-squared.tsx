
"use strict";
import React = require('react');
import ReactDOM = require('react-dom');
import d3 = require('d3');
import katex = require('katex');

const WIDTH = 500;
const HEIGHT = 500;
const MARGIN = 25;

type Points2d = Array<[number, number]>;
type regressionFunction = (x: number) => number;

function getY(points: Points2d): Array<number> {
  return points.map( ([x, y]) => y );
}

function getX(points: Points2d): Array<number>  {
  return points.map( ([x, y]) => x );
}

function getSlope(points: Points2d): number {
  const n = points.length;
  let {meanX, meanY, squareX, s} = getStatistics(points);
  return ((s - n*meanX*meanY) / (squareX - n*meanX*meanX));
}

function getIntercept(points: Points2d): number {
  const n = points.length;
  let {meanX, meanY, squareX, s} = getStatistics(points);
  return ((meanY*squareX - meanX*s) / (squareX - n*meanX*meanX))
}

function getMeanRegression(points: Points2d): regressionFunction {
  if (!points.length) {
    return null;
  }
  // Always return the mean
  return x => d3.mean(getY(points));
}

function getLinearRegression(points: Points2d): regressionFunction {
  if (points.length < 2) {
    return null;
  }
  const intercept = getIntercept(points);
  const slope = getSlope(points);
  let cache = {};
  return function(x: number): number {
    if (cache[x] === undefined) {
      cache[x] = intercept + x*slope;
    }
    return cache[x];
  };
}

function getSumSquares(points: Points2d, regression: Function): number {
  const addSquares = (prev, [x, y]) => {
      const distance: number = regression(x) - y;
      return prev + distance*distance;
  };
  return points.reduce(addSquares , 0);
}

function getStatistics(points: Points2d): IStatistics {
  return {
    'meanX': d3.mean(getX(points)),
    'meanY': d3.mean(getY(points)),
    'squareX': getX(points).reduce((prev, p) => prev + p*p, 0),
    's': points.reduce((prev, [x, y]) => prev + x*y, 0),
  };
}

function Circle({x, y, pointNumber, changePoint}: ICircleProps): JSX.Element {
  function addDragBehavior(element): void {
    const drag = d3.behavior.drag().on('drag', function() {
      changePoint(pointNumber, d3.mouse(this));
    });
    const d3element = d3.select(element);
    d3element.call(drag);
  }
  return (
    <circle cx={x} cy={y} r="7" ref={element => addDragBehavior(element)}>
    </circle>
  );
}

function Rect({x, y, f_x, color}: IRectProps): JSX.Element {
  const style = {fill: color, opacity: 0.5};
  const distance = Math.abs(f_x - y);
  if (y > f_x) {
    y = f_x;
  } else {
    x = x - distance;
  }
  return (
    <rect x={x} y={y} width={distance} height={distance} style={style}>
    </rect>
  );
}

function Circles({points, changePoint}: ICirclesProps): JSX.Element {
  return (
    <g>
      {points.map(
        ([x, y], i) => <Circle key={i} x={x} y={y} changePoint={changePoint} pointNumber={i} />
      )}
    </g>
  );
}

function Line({regression, label}: ILineProps): JSX.Element {
  if (!regression) {
    return null;
  }
  return (
  <g>
    <text
      className="katex label"
      x={(WIDTH + MARGIN) / 2}
      y={regression((WIDTH + MARGIN) / 2) - 15}
    >
      {label}
    </text>
    <line
      className="regressionLine"
      x1={MARGIN}
      y1={regression(MARGIN)}
      x2={WIDTH - MARGIN}
      y2={regression(WIDTH - MARGIN)}
    />
  </g>
);
}

function Rects({points, regression, color}: IRectsProps): JSX.Element {
  if (!regression) {
    return null;
  }
  return (
    <g>
      {points.map(
        ([x, y], i) => <Rect key={i} x={x} y={y} f_x={regression(x)} color={color} />
      )}
    </g>
  );
}

function Axes(): JSX.Element {
  return (
    <g>
      <defs>
        <marker id="arrow" viewBox="0 -5 10 10" refX="5" refY="0" markerWidth="5" markerHeight="7"
        orient="auto">
          <path d="M0,-5L10,0L0,5" className="arrowHead"></path>
        </marker>
      </defs>
      <line
        className="arrow"
        markerEnd="url(#arrow)"
        x1={MARGIN}
        y1={HEIGHT - MARGIN}
        x2={MARGIN}
        y2={MARGIN}>
      </line>
      <text className="katex" x="0" y={MARGIN}>y</text>
      <line
        className="arrow"
        markerEnd="url(#arrow)"
        x1={MARGIN}
        y1={HEIGHT - MARGIN}
        x2={WIDTH - MARGIN}
        y2={HEIGHT - MARGIN}>
      </line>
      <text className="katex" x={WIDTH - MARGIN} y={HEIGHT}>x</text>
    </g>
  );
}

class RootComponent extends React.Component<{}, IRootState> {
  private formula: string;

  public constructor() {
    super();
    this.state = {points: []};
    this.changePoint = this.changePoint.bind(this);
    this.addPoint = this.addPoint.bind(this);
    this.formula = katex.renderToString(
      'R^2' + this.formulaTemplate('SS_\\text{res}', 'SS_\\text{tot}')
    );
  }

  public render(): JSX.Element {
    const points: Points2d = this.state.points;
    const meanRegression: Function = getMeanRegression(points);
    const linearRegression: Function = getLinearRegression(points);
    let formula: string = this.formula;

    if (linearRegression) {
      // Fill in the numbers for the general formula
      const sumSquaresMean: number = getSumSquares(points, meanRegression) / 10;
      const sumSquaresLinear: number = getSumSquares(points, linearRegression) / 10;
      const rSquare: number =  1 - sumSquaresLinear / sumSquaresMean;
      formula += ' ' + katex.renderToString(
        this.formulaTemplate(sumSquaresLinear.toFixed(2), sumSquaresMean.toFixed(2)) +
        ' = ' + rSquare.toFixed(2)
      );
    }

    return (
      <div>
        <svg width={WIDTH} height={HEIGHT} onClick={this.addPoint}>
          <Axes />
          <Rects points={points} regression={meanRegression} color="red" />
          <Line regression={meanRegression} label="y" />
          <Circles points={points} changePoint={this.changePoint} />
        </svg>
        <svg width={WIDTH} height={HEIGHT} onClick={this.addPoint}>
          <Axes />
          <Rects points={points} regression={linearRegression} color="blue" />
          <Line regression={linearRegression} label="f" />
          <Circles points={points} changePoint={this.changePoint} />
        </svg>
        <div id="calculate-r-square" dangerouslySetInnerHTML={ {__html: formula} }></div>
      </div>
    );
  }

  private formulaTemplate(sumResiduals: string, sumTotal: string): string {
    return ` = 1 - \\frac{\\color{blue}{${sumResiduals}}}{\\color{red}{${sumTotal}}} `;
  }

  private addPoint(event) {
    const point: [number, number] = [event.nativeEvent.offsetX, event.nativeEvent.offsetY];
    // Supress the click action if the element is being dragged
    if (!event.defaultPrevented) {
      this.setState({points: this.state.points.concat([point])});
    }
  }

  private changePoint(i: number, point: [number, number]): void {
    this.state.points[i] = point;
    this.setState({points: this.state.points});
  }
}

const mainElement = document.getElementById("main");
ReactDOM.render(<RootComponent/>, mainElement);

// Export these functions for tests
export = {
  getIntercept: getIntercept,
  getSlope: getSlope,
  getSumSquares: getSumSquares,
};
