interface ICircleProps extends React.Props<any> {
  x: number;
  y: number;
  changePoint: Function;
  pointNumber: number;
}
interface ICirclesProps extends React.Props<any> {
  changePoint: Function;
  points: Array<[number, number]>;
}
interface ILineProps extends React.Props<any> {
  regression: Function;
  label: string;
}
interface IRectProps extends React.Props<any> {
  x: number;
  y: number;
  f_x: number;
  color: string;
}
interface IRectsProps extends React.Props<any> {
  points: Array<[number, number]>;
  regression: Function;
  color: string;
}
interface IRootState {
  points: Array<[number, number]>;
}
interface IPointSquaresProps extends React.Props<any> {
  points: Array<[number, number]>;
  regression: Function;
  changePoint: Function;
  color: string;
}
interface IStatistics {
  meanX: number;
  meanY: number;
  squareX: number;
  s: number;
}
