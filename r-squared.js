var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'react-dom', 'd3', 'katex'], function (require, exports, React, ReactDOM, d3, katex) {
    "use strict";
    var WIDTH = 500;
    var HEIGHT = 500;
    var MARGIN = 25;
    function getY(points) {
        return points.map(function (_a) {
            var x = _a[0], y = _a[1];
            return y;
        });
    }
    function getX(points) {
        return points.map(function (_a) {
            var x = _a[0], y = _a[1];
            return x;
        });
    }
    function getSlope(points) {
        var n = points.length;
        var _a = getStatistics(points), meanX = _a.meanX, meanY = _a.meanY, squareX = _a.squareX, s = _a.s;
        return ((s - n * meanX * meanY) / (squareX - n * meanX * meanX));
    }
    function getIntercept(points) {
        var n = points.length;
        var _a = getStatistics(points), meanX = _a.meanX, meanY = _a.meanY, squareX = _a.squareX, s = _a.s;
        return ((meanY * squareX - meanX * s) / (squareX - n * meanX * meanX));
    }
    function getMeanRegression(points) {
        if (!points.length) {
            return null;
        }
        return function (x) { return d3.mean(getY(points)); };
    }
    function getLinearRegression(points) {
        if (points.length < 2) {
            return null;
        }
        var intercept = getIntercept(points);
        var slope = getSlope(points);
        var cache = {};
        return function (x) {
            if (cache[x] === undefined) {
                cache[x] = intercept + x * slope;
            }
            return cache[x];
        };
    }
    function getSumSquares(points, regression) {
        var addSquares = function (prev, _a) {
            var x = _a[0], y = _a[1];
            var distance = regression(x) - y;
            return prev + distance * distance;
        };
        return points.reduce(addSquares, 0);
    }
    function getStatistics(points) {
        return {
            'meanX': d3.mean(getX(points)),
            'meanY': d3.mean(getY(points)),
            'squareX': getX(points).reduce(function (prev, p) { return prev + p * p; }, 0),
            's': points.reduce(function (prev, _a) {
                var x = _a[0], y = _a[1];
                return prev + x * y;
            }, 0),
        };
    }
    function Circle(_a) {
        var x = _a.x, y = _a.y, pointNumber = _a.pointNumber, changePoint = _a.changePoint;
        function addDragBehavior(element) {
            var drag = d3.behavior.drag().on('drag', function () {
                changePoint(pointNumber, d3.mouse(this));
            });
            var d3element = d3.select(element);
            d3element.call(drag);
        }
        return (React.createElement("circle", {cx: x, cy: y, r: "7", ref: function (element) { return addDragBehavior(element); }}));
    }
    function Rect(_a) {
        var x = _a.x, y = _a.y, f_x = _a.f_x, color = _a.color;
        var style = { fill: color, opacity: 0.5 };
        var distance = Math.abs(f_x - y);
        if (y > f_x) {
            y = f_x;
        }
        else {
            x = x - distance;
        }
        return (React.createElement("rect", {x: x, y: y, width: distance, height: distance, style: style}));
    }
    function Circles(_a) {
        var points = _a.points, changePoint = _a.changePoint;
        return (React.createElement("g", null, points.map(function (_a, i) {
            var x = _a[0], y = _a[1];
            return React.createElement(Circle, {key: i, x: x, y: y, changePoint: changePoint, pointNumber: i});
        })));
    }
    function Line(_a) {
        var regression = _a.regression, label = _a.label;
        if (!regression) {
            return null;
        }
        return (React.createElement("g", null, 
            React.createElement("text", {className: "katex label", x: (WIDTH + MARGIN) / 2, y: regression((WIDTH + MARGIN) / 2) - 15}, label), 
            React.createElement("line", {className: "regressionLine", x1: MARGIN, y1: regression(MARGIN), x2: WIDTH - MARGIN, y2: regression(WIDTH - MARGIN)})));
    }
    function Rects(_a) {
        var points = _a.points, regression = _a.regression, color = _a.color;
        if (!regression) {
            return null;
        }
        return (React.createElement("g", null, points.map(function (_a, i) {
            var x = _a[0], y = _a[1];
            return React.createElement(Rect, {key: i, x: x, y: y, f_x: regression(x), color: color});
        })));
    }
    function Axes() {
        return (React.createElement("g", null, 
            React.createElement("defs", null, 
                React.createElement("marker", {id: "arrow", viewBox: "0 -5 10 10", refX: "5", refY: "0", markerWidth: "5", markerHeight: "7", orient: "auto"}, 
                    React.createElement("path", {d: "M0,-5L10,0L0,5", className: "arrowHead"})
                )
            ), 
            React.createElement("line", {className: "arrow", markerEnd: "url(#arrow)", x1: MARGIN, y1: HEIGHT - MARGIN, x2: MARGIN, y2: MARGIN}), 
            React.createElement("text", {className: "katex", x: "0", y: MARGIN}, "y"), 
            React.createElement("line", {className: "arrow", markerEnd: "url(#arrow)", x1: MARGIN, y1: HEIGHT - MARGIN, x2: WIDTH - MARGIN, y2: HEIGHT - MARGIN}), 
            React.createElement("text", {className: "katex", x: WIDTH - MARGIN, y: HEIGHT}, "x")));
    }
    var RootComponent = (function (_super) {
        __extends(RootComponent, _super);
        function RootComponent() {
            _super.call(this);
            this.state = { points: [] };
            this.changePoint = this.changePoint.bind(this);
            this.addPoint = this.addPoint.bind(this);
            this.formula = katex.renderToString('R^2' + this.formulaTemplate('SS_\\text{res}', 'SS_\\text{tot}'));
        }
        RootComponent.prototype.render = function () {
            var points = this.state.points;
            var meanRegression = getMeanRegression(points);
            var linearRegression = getLinearRegression(points);
            var formula = this.formula;
            if (linearRegression) {
                var sumSquaresMean = getSumSquares(points, meanRegression) / 10;
                var sumSquaresLinear = getSumSquares(points, linearRegression) / 10;
                var rSquare = 1 - sumSquaresLinear / sumSquaresMean;
                formula += ' ' + katex.renderToString(this.formulaTemplate(sumSquaresLinear.toFixed(2), sumSquaresMean.toFixed(2)) +
                    ' = ' + rSquare.toFixed(2));
            }
            return (React.createElement("div", null, 
                React.createElement("svg", {width: WIDTH, height: HEIGHT, onClick: this.addPoint}, 
                    React.createElement(Axes, null), 
                    React.createElement(Rects, {points: points, regression: meanRegression, color: "red"}), 
                    React.createElement(Line, {regression: meanRegression, label: "y"}), 
                    React.createElement(Circles, {points: points, changePoint: this.changePoint})), 
                React.createElement("svg", {width: WIDTH, height: HEIGHT, onClick: this.addPoint}, 
                    React.createElement(Axes, null), 
                    React.createElement(Rects, {points: points, regression: linearRegression, color: "blue"}), 
                    React.createElement(Line, {regression: linearRegression, label: "f"}), 
                    React.createElement(Circles, {points: points, changePoint: this.changePoint})), 
                React.createElement("div", {id: "calculate-r-square", dangerouslySetInnerHTML: { __html: formula }})));
        };
        RootComponent.prototype.formulaTemplate = function (sumResiduals, sumTotal) {
            return " = 1 - \\frac{\\color{blue}{" + sumResiduals + "}}{\\color{red}{" + sumTotal + "}} ";
        };
        RootComponent.prototype.addPoint = function (event) {
            var point = [event.nativeEvent.offsetX, event.nativeEvent.offsetY];
            if (!event.defaultPrevented) {
                this.setState({ points: this.state.points.concat([point]) });
            }
        };
        RootComponent.prototype.changePoint = function (i, point) {
            this.state.points[i] = point;
            this.setState({ points: this.state.points });
        };
        return RootComponent;
    }(React.Component));
    var mainElement = document.getElementById("main");
    ReactDOM.render(React.createElement(RootComponent, null), mainElement);
    return {
        getIntercept: getIntercept,
        getSlope: getSlope,
        getSumSquares: getSumSquares,
    };
});
