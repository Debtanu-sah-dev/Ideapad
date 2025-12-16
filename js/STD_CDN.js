const STD_CDN = [
  {
    "name": "AgentScript",
    "description": "Agent-based modeling framework for browser simulations; use for emergent behavior, population dynamics, and interactive spatial agents.",
    "cdnlink": "https://unpkg.com/agentscript@latest/dist/agentscript.min.js"
  },
  {
    "name": "axios",
    "description": "Promise-based HTTP client for browsers; load CSV/JSON from remote sources, useful for data-driven simulation inputs and persistence.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/axios@1/dist/axios.min.js"
  },
  {
    "name": "babylonjs",
    "description": "Full-featured 3D engine for real-time visualizations, physics integration, and interactive scenes in browser-based simulations and games.",
    "cdnlink": "https://cdn.babylonjs.com/babylon.js"
  },
  {
    "name": "bignumber.js",
    "description": "Arbitrary-precision decimal arithmetic library, use when floating-point rounding errors must be avoided in numerical simulations.",
    "cdnlink": "https://unpkg.com/bignumber.js@latest/bignumber.js"
  },
  {
    "name": "cannon-es",
    "description": "Lightweight 3D rigid-body physics engine for browser use; handle collisions, constraints, and real-time mechanical simulations reliably.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js"
  },
  {
    "name": "Chart.js",
    "description": "Simple, responsive charting library for 2D charts, dashboards and quick analytics visualizations in simulations and experiments.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"
  },
  {
    "name": "concaveman",
    "description": "Compute concave hulls from point clouds quickly in browser; useful for spatial boundaries and shape approximation tasks.",
    "cdnlink": "https://unpkg.com/concaveman@latest/index.js"
  },
  {
    "name": "cytoscape.js",
    "description": "Graph and network visualization library for browser simulations; analyze topology, dynamics, and interactive graph-based behaviors efficiently.",
    "cdnlink": "https://unpkg.com/cytoscape@latest/dist/cytoscape.min.js"
  },
  {
    "name": "dat.gui",
    "description": "Lightweight GUI for parameter tuning; attach sliders and controls to simulation variables during development and demos.",
    "cdnlink": "https://unpkg.com/dat.gui@0.7.9/build/dat.gui.min.js"
  },
  {
    "name": "d3",
    "description": "Powerful data-driven document library for custom visualizations, complex animated plots, and binding simulation data to DOM or SVG.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"
  },
  {
    "name": "delaunator",
    "description": "Fast Delaunay triangulation library for mesh generation, interpolation, and spatial discretization tasks in browser-based numerical simulations.",
    "cdnlink": "https://unpkg.com/delaunator@5.0.0/delaunator.min.js"
  },
  {
    
    "name": "decimal.js",
    "description": "Arbitrary-precision decimal arithmetic library for deterministic, accurate calculations in simulations where IEEE floating-point errors are unacceptable.",
    "cdnlink": "https://cdnjs.cloudflare.com/ajax/libs/decimal.js/9.0.0/decimal.min.js"
  },
  {
    "name": "dsp.js",
    "description": "Signal processing utilities including filters and FFT helpers; use for audio, wave propagation, and time-series analysis.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/dspjs@1.0.0/dsp.min.js"
  },
  {
    "name": "earcut",
    "description": "Fast polygon triangulation utility for tessellating complex polygons into triangles for rendering and mesh operations.",
    "cdnlink": "https://unpkg.com/earcut@latest/dist/earcut.min.js"
  },
  {
    "name": "echarts",
    "description": "Feature-rich chart library supporting large datasets and interactive dashboards; good for simulation analytics and exploratory visualization.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/echarts@latest/dist/echarts.min.js"
  },
  {
    "name": "fft.js",
    "description": "Fast Fourier Transform implementation in JavaScript; useful for spectral analysis, convolution, and signal-processing in simulations.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/fft-js@0.0.12/index.min.js"
  },
  {
    "name": "FileSaver.js",
    "description": "Client-side file saving utility; export simulation results, CSVs or JSON from the browser with a single call.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/file-saver@latest/dist/FileSaver.min.js"
  },
  {
    "name": "Gemini",
    "description": "Multi-Modal AI for creating summaries, explanations, multi-modal understanding, chat-bot. Embed Gemini AI as a dialogue-agent inside the simulation to analyse data, propose scenarios and adapt behaviour in real-time",
    "cdnlink&Usage": `<script type="importmap">
        {
            "imports": {
              "@google/generative-ai": "https://esm.run/@google/generative-ai"
            }
          }
    </script>
    <script>
    //How to use GEMINI
    import { GoogleGenerativeAI} from "@google/generative-ai";
    const genAI = new GoogleGenerativeAI(API_KEY_INPUTTED_BY_USER_IN_THE_APPLICATION);
    const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});
    //Structured output EXAMPLE
    const schema = {
        model:"gemini-2.5-flash",
        generationConfig:{
                responseMimeType: 'application/json',
                responseSchema: {
                  "type": "object",
                  "properties": {
                    "STRING_VALUE": {
                      "type": "string"
                    },
                    "BOOLEAN_VALUE": {
                      "type": "boolean"
                    },
                    "NUMBER_VALUE": {
                      "type": "number"
                    },
                    "INTEGER_VALUE": {
                      "type": "integer"
                    },
                    "ENUM_VALUE": {
                      "type": "string",
                      "enum": [
                        "ENUM_VALUE_1",
                        "ENUM_VALUE_2",
                        "ENUM_VALUE_3"
                      ]
                    },
                    "OBJECT_VALUE": {
                      "type": "object",
                      "properties": {
                        "NESTED_STRING_VALUE": {
                          "type": "string"
                        },
                        "NESTED_REQUIRED_STRING_VALUE": {
                          "type": "string"
                        },
                        "NESTED_OBJECT": {
                          "type": "object",
                          "properties": {
                            "NESTED_NESTED_STRING_VALUE": {
                              "type": "string"
                            }
                          },
                          "propertyOrdering": [
                            "NESTED_NESTED_STRING_VALUE"
                          ],
                          "required": [
                            "NESTED_NESTED_STRING_VALUE"
                          ]
                        },
                        "NESTED_STRING_ARRAY": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        }
                      },
                      "propertyOrdering": [
                        "NESTED_STRING_VALUE",
                        "NESTED_REQUIRED_STRING_VALUE",
                        "NESTED_OBJECT",
                        "NESTED_STRING_ARRAY"
                      ],
                      "required": [
                        "NESTED_REQUIRED_STRING_VALUE"
                      ]
                    },
                    "STRING_ARRAY": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    },
                    "REQUIRED_STRING_VALUE": {
                      "type": "string"
                    },
                    "REQUIRED_STRING_ARRAY": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    },
                    "OBJECT_ARRAY": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "NESTED_STRING_VALUE": {
                            "type": "string"
                          },
                          "NESTED_REQUIRED_BOOLEAN_VALUE": {
                            "type": "boolean"
                          }
                        },
                        "propertyOrdering": [
                          "NESTED_STRING_VALUE",
                          "NESTED_REQUIRED_BOOLEAN_VALUE"
                        ],
                        "required": [
                          "NESTED_REQUIRED_BOOLEAN_VALUE"
                        ]
                      }
                    }
                  },
                  "propertyOrdering": [
                    "STRING_VALUE",
                    "BOOLEAN_VALUE",
                    "NUMBER_VALUE",
                    "INTEGER_VALUE",
                    "ENUM_VALUE",
                    "OBJECT_VALUE",
                    "STRING_ARRAY",
                    "REQUIRED_STRING_VALUE",
                    "REQUIRED_STRING_ARRAY",
                    "OBJECT_ARRAY"
                  ],
                  "required": [
                    "REQUIRED_STRING_VALUE",
                    "REQUIRED_STRING_ARRAY"
                  ]
                }
        }
    };
    // Ex.response
    /*
      {
        "REQUIRED_STRING_VALUE": "hello world",
        "REQUIRED_STRING_ARRAY": [
          "item 1",
          "item 2",
          "item 3"
        ],
        "BOOLEAN_VALUE": true,
        "ENUM_VALUE": "ENUM_VALUE_2",
        "INTEGER_VALUE": 42,
        "NUMBER_VALUE": 1.23,
        "OBJECT_ARRAY": [
          {
            "NESTED_REQUIRED_BOOLEAN_VALUE": false,
            "NESTED_STRING_VALUE": "object_array_string_1"
          },
          {
            "NESTED_REQUIRED_BOOLEAN_VALUE": true
          }
        ],
        "OBJECT_VALUE": {
          "NESTED_REQUIRED_STRING_VALUE": "required_nested_value",
          "NESTED_OBJECT": {
            "NESTED_NESTED_STRING_VALUE": "deeply_nested_content"
          },
          "NESTED_STRING_ARRAY": [
            "nested_array_element_A",
            "nested_array_element_B"
          ],
          "NESTED_STRING_VALUE": "optional_nested_string"
        },
        "STRING_ARRAY": [
          "optional_A",
          "optional_B"
        ],
        "STRING_VALUE": "optional_string_content"
      }
    */
    const modelWithStructuredOutput = genAI.getGenerativeModel(schema);
    async function generateContentWithStructuredOutput(contentArray = []){
      let content = await modelWithStructuredOutput.generateContent(contentArray);
      console.log(JSON.parse(content.response.text())) // <-- Output type is object
      //Remember .text() in content.response is a function so content.response.text.trim() is wrong therefore to access the text you have to do content.response.text() and then you can trim it by content.response.text().trim() or use any string function.
      return JSON.parse(content.response.text());
    }
    async function generateContent(contentArray = []){
      let content = await model.generateContent(contentArray);
      console.log(content.response.text()) // <-- Output type is string
      //Remember .text() in content.response is a function so content.response.text.trim() is wrong therefore to access the text you have to do content.response.text() and then you can trim it by content.response.text().trim() or use any string function.
      return content.response.text();
    }
    //Usage text to text
    generateContent(["Give recipe to make cake"]);
    //Usage (text, image) to text
    let imageObject = {
      inlineData: {
        data: DATA_URL_OF_IMAGE.split(",")[1],
        mimeType: "image/png",
      },
    }
    generateContent([imageObject, "Give recipe to make the dish shown in the image"]);
    // Note:Does not supports image generation or any type of media generation only text generation also ask the user for API_KEY, do not use prompt function, the DATA_URL can the data url of a image or the image content of a canvas via canvas.toDataURL(), you can't read the response as a stream and display in chunks because the cdn only supports giving only the final output so reading in chunk is not allowed.
    </script>`
  },
  {
    "name": "gl-matrix",
    "description": "Fast vector and matrix math utilities optimized for WebGL and graphics; ideal for transforms and linear algebra in simulations.",
    "cdnlink": "https://unpkg.com/gl-matrix@3.4.4/gl-matrix.js"
  },
  {
    "name": "gpu.js",
    "description": "Write data-parallel kernels that run on WebGL/GPU; accelerate numerically heavy loops and large-array computations in-browser.",
    "cdnlink": "https://unpkg.com/gpu.js@latest/dist/gpu-browser.min.js"
  },
  {
    "name": "jstat",
    "description": "Statistics library for distributions, tests, and common statistical functions; use for analysis and stochastic simulations.",
    "cdnlink": "https://unpkg.com/jstat@latest/dist/jstat.min.js"
  },
  {
    "name": "jszip",
    "description": "Create and read ZIP archives client-side; package simulation outputs, multiple result files, or model snapshots for download.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/jszip@3/dist/jszip.min.js"
  },
  {
    "name": "lil-gui",
    "description": "Modern lightweight GUI for tweaking simulation parameters with sliders, toggles and folders; good for demos and tuning.",
    "cdnlink": "https://unpkg.com/lil-gui@0.21.0/dist/lil-gui.umd.min.js"
  },
  {
    "name": "lodash",
    "description": "Utility library for arrays, objects, and functions; handy for data manipulation, sampling, and transformation in simulations.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"
  },
  {
    "name": "matter-js",
    "description": "2D rigid-body physics engine for realistic collisions, constraints, and educational physics simulations in browser environments and prototypes.",
    "cdnlink": "https://unpkg.com/matter-js@latest/build/matter.min.js"
  },
  {
    "name": "ml-matrix",
    "description": "Matrix operations and linear algebra utilities in JavaScript; use for small-to-medium sized numerical linear algebra tasks.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/ml-matrix@6.12.1/matrix.umd.min.js"
  },
  {
    "name": "ndarray",
    "description": "N-dimensional array data structure for numeric computing in JavaScript; foundational for PDE grids and array-heavy algorithms.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/ndarray@1.0.19/ndarray.js"
  },
  {
    "name": "ndarray-ops",
    "description": "Efficient elementwise operations for ndarray; use to implement numerical kernels and discretized operators inside simulations.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/ndarray-ops@1.2.2/ndarray-ops.min.js"
  },
  {
    "name": "numeric.js",
    "description": "Numerical computing library with ODE solvers and linear algebra; helpful for prototyping solvers and small scientific codes.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/numeric@1.2.6/numeric-1.2.6.min.js"
  },
  {
    "name": "oimo.js",
    "description": "Lightweight 3D physics engine focusing on rigid-body simulations; useful for simple 3D mechanical interactions in-browser.",
    "cdnlink": "https://unpkg.com/oimo@latest/build/oimo.min.js"
  },
  {
    "name":"p5.js",
    "description":"A beginner-friendly JS library for interactive graphics, animations and visuals; ideal for creative, physics or educational browser simulations.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/p5@1.11.5/lib/p5.js"
  },
  {
    "name": "papaparse",
    "description": "Fast, streaming CSV parser in browser; import/export simulation datasets, parameter sweeps, and time-series results easily.",
    "cdnlink": "https://unpkg.com/papaparse@latest/papaparse.min.js"
  },
  {
    "name": "planck.js",
    "description": "JavaScript Box2D port for precise 2D physics simulations, joints, and realistic collision handling in browser environments.",
    "cdnlink": "https://unpkg.com/planck-js@latest/dist/planck-with-testbed.min.js"
  },
  {
    "name": "plotly.js",
    "description": "Interactive scientific plotting library with 2D/3D charts and animations; ideal for exploratory simulation visualization and streaming.",
    "cdnlink": "https://cdn.plot.ly/plotly-3.3.0.min.js"
  },
  {
    "name": "poly-decomp.js",
    "description": "Utilities for convex polygon decomposition; useful for collision detection, simplifying shapes, and preparing geometry for physics engines.",
    "cdnlink": "https://unpkg.com/poly-decomp@latest/build/decomp.min.js"
  },
  {
    "name": "pixi.js",
    "description": "High-performance 2D WebGL renderer suitable for particle systems, sprite-based simulations, and smooth, GPU-accelerated visualizations in browser.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/pixi.js@latest/dist/pixi.min.js"
  },
  {
    "name": "regl",
    "description": "Functional WebGL abstraction for efficient custom shader pipelines; use when building bespoke GPU rendering or compute shaders.",
    "cdnlink": "https://unpkg.com/regl@latest/dist/regl.min.js"
  },
  {
    "name": "robust-point-in-polygon",
    "description": "Reliable point-in-polygon algorithm for complex polygons; useful for spatial queries, inclusion tests, and domain membership checks.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/robust-point-in-polygon@1.0.3/robust-pnp.min.js"
  },
  {
    "name": "seedrandom",
    "description": "Seedable pseudorandom number generator replacement for deterministic experiments; ensures reproducible stochastic sequences across simulation runs.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/seedrandom@latest/seedrandom.min.js"
  },
  {
    "name": "sigma.js",
    "description": "Graph drawing library optimized for large graphs; use for interactive network simulations and dynamic graph visualizations.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/sigma@latest/build/sigma.min.js"
  },
  {
    "name": "simple-statistics",
    "description": "Lightweight statistical utilities for regression, summaries, distributions, and hypothesis tests; good for analyzing simulation output quantitatively.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/simple-statistics@7/dist/simple-statistics.min.js"
  },
  {
    "name": "simjs",
    "description": "Discrete-event simulation utilities for events and queues; implement queuing systems, schedulers, and time-advanced simulations easily.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/simjs@2.0.3/sim.min.js"
  },
  {
    "name": "stats.js",
    "description": "Tiny performance monitor for FPS and timing; useful for profiling simulation rendering and runtime performance in-browser.",
    "cdnlink": "https://unpkg.com/stats.js@latest/build/stats.min.js"
  },
  {
    "name": "tensorflow.js",
    "description": "Browser-based ML and tensor computations; accelerate matrix-heavy tasks using WebGL backend for learning or numerics.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js"
  },
  {
    "name": "three.js",
    "description": "Widely used 3D rendering library for visualizing simulations, meshes, cameras, and advanced scene graphs in browser.",
    "cdnlink": `<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/"
  }
}
</script>`,
    "useImportMap":"true"
  },
  {
    "name": "turf.js",
    "description": "Geospatial analysis toolkit for coordinates, buffers, and spatial operations; ideal for geography-related simulations and spatial queries.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/@turf/turf@latest/turf.min.js"
  },
  {
    "name": "twgl.js",
    "description": "Tiny WebGL helper library simplifying buffer and shader management; use for custom GPU-oriented rendering or compute tasks.",
    "cdnlink": "https://cdnjs.cloudflare.com/ajax/libs/twgl.js/4.19.5/twgl.min.js"
  },
  {
    "name": "vega",
    "description": "Declarative visualization grammar enabling complex, interactive visualizations; useful for specifying reproducible simulation graphics and dashboards.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/vega@5/build/vega.min.js"
  },
  {
    "name": "vega-lite",
    "description": "Concise, high-level visualization grammar for rapidly creating common plots from simulation data with minimal specification effort.",
    "cdnlink": "https://cdn.jsdelivr.net/npm/vega-lite@5/build/vega-lite.min.js"
  }
]