requirejs(['r-squared'], function(c) {
    var testPoints = [[0,0], [1,2]];
    console.assert(c.getIntercept(testPoints) == 0);
    console.assert(c.getSlope(testPoints) == 2);

    testPoints = [[0,2], [1,2]];
    console.assert(c.getIntercept(testPoints) == 2);
    console.assert(c.getSlope(testPoints) == 0);

    testPoints = [[0,2.5], [1,6]];
    console.assert(c.getIntercept(testPoints) == 2.5);
    console.assert(c.getSlope(testPoints) == 3.5);

    testPoints = [[0,0], [1,0]];
    regression = x => 3;
    console.assert(c.getSumSquares(testPoints, regression) == 18);
});
