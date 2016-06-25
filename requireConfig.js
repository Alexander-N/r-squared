require.config({
    baseUrl: "",
    paths: {
        "d3": "https://d3js.org/d3.v3.min",
        "react": "https://fb.me/react-15.0.1",
        "react-dom": "https://fb.me/react-dom-15.0.1",
        "katex": "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.6.0/katex.min",
    }
});
require(["r-squared"]);
require(["tests"]);
