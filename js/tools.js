/*@Params
    mime<string>
    requirement<string>
    header<string>NO(space)
    directive<string>
    append<string:link>NO(param)
*/

const TOOLS = [
    {
        mime:"wiki title",
        requirement:"Whenever you need to show a specific wikipedia page's overview for any purpose or grounding with wikipedia",
        header:"wiki_page",
        directive:`give a valid wikipedia title of the desired wikipedia page only for multiple wikipedia page use mutltiple codeblocks`,
        append:"./tools/wiki.html?title=",
        scale:4/3
    },
    {
        mime:"location",
        requirement:"Whenever you need to show a specific place's map",
        header:"map",
        directive:`give location of only a single place, for more locations use more codeblocks, Ex. Paris, London bridge, St. thomas academy goregaon(west), silicon valley etc.`,
        append:"./tools/maps.html?q=",
    },
    {
        mime:"index name",
        requirement:"Whenever you need to show a specific stock's graph",
        header:"trading_view",
        directive:`give proper index name with timeperiod(1D, 1M, 3M, 12M, 60M, ALL these are the only time periods which can be used) only of single stock only Ex. NASDAQ:AAPL|1D, NSE:NIFTY|1M, NASDAQ:GOOGL|3M, NASDAQ:SPACZZX|12M, BITSTAMP:BTCUSD|60M, TVC:GOLD|ALL`,
        append:"./tools/trading_view.html?index="
    },
    {
        mime:"latex code",
        requirement:"Whenever you need to show 2D graphical plot",
        header:"desmos_2Dplot_latex",
        // directive:"add a single valid latex expression in the codeblock, it can be a equation or a simple expression use x and y only no other variables",
        directive:`if you want multiple graphs in same plot add all the expression in the same codeblock seperated by a newline, for multiple plots with arbitrary amount of graphs in each use multiple codeblock with newline separating all the different expression of a given plot in the same codeblock. A 2D codeblock will always render equations on 2D space, So 3D is not allowed in 2D plots
        Important Consideration:- For a single plot that is single codeblock create the list of expression in such a way where there is high interactivity so that the graph is not just static bu the user can play with the values, Example:- for quadratic polynomial don't just add y = x*x but also add some sliders to tweak some things in the parabola, if equation of circle make it interactive so that user can change parameters, additionally in 2D plots make the interactivity better by using movable points
Types of expression(only these can be used, nothing else):-
single expression:- x*x
function:- f(x) = x*x
x-y expression (Cartesian co-ordinate):- y = x*x
r-\\theta expression (Polar co-ordinates):- r = \\cos(3*\\theta)
variables with adjustable sliders(initial value mandatory):- a = 5
movable points(all variables used in it should be decalared before):(a, a*a)
static points:(1, 5)
implicit:-x*x + y*y = 1
mathematical expression (only computation):- \\int_{0}^{1}x^{2}dx
NOTE:- Do not add any explanatory text like comments as comments are not supported
Special Tokens(Cannot be used as variables):-
\t1). Cartesian Co-ordinate:-(x, y) (x is horizontal axis and y is vertical axis)
\t2). Polar Co-ordinate:-(r, \\theta) do not give any range for \\theta it is not supported (r is radius and \\theta is angle)
Note:- Polar equations should not be implicit they have to be explicit in terms of r only.
therefore:-x, y, \\theta, r should not be used as variables or else the compiler will throw error
Variables:- Variables cannot be of more than one letter or else the compiler will throw error same is true for variable sub-scripts
Example(multiple graph in same plot):-
y = x*x
r = \\cos(3*\\theta)
f(x) = x*x
x*x
m=1
c=2
y=mx+c
a=5
(1, 5)
(a, a*a)
\\int_{0}^{1}x^{2}dx`,
        append:"./tools/desmos.html?q="
    },
    {
        mime:"latex code",
        requirement:"Whenever you need to show 3D graphical plot",
        header:"desmos_3Dplot_latex",
        // directive:"add a single valid latex expression in the codeblock, it can be a equation or a simple expression use x and y only no other variables",
        directive:`if you want multiple graphs in same plot add all the expression in the same codeblock seperated by a newline, for multiple plots with arbitrary amount of graphs in each use multiple codeblock with newline separating all the different expression of a given plot in the same codeblock. A 3D codeblock will always render equations on 3D space even if it is only 2D
Important Consideration:- For a single plot that is single codeblock create the list of expression in such a way where there is high interactivity so that the graph is not just static bu the user can play with the values, Example:- for quadratic polynomial don't just add y = x*x but also add some sliders to tweak some things in the parabola, if equation of circle make it interactive so that user can change parameters.
Types of expression(only these can be used, nothing else):-
single expression:- x*x + y*y
function:- f(x, y) = x*x + y*y
x-y-z expression (Cartesian co-ordinate):- z*z = x*x + y*y
r-\\theta-z expression (Cylindrical co-ordinate):- r =\\cos\\left(\\theta\\right)+z
\\rho-\\theta-\\phi expression (Spherical co-ordinate):- \\rho = \\cos\\left(2\\theta\\right)\\sin\\left(\\phi\\right)
variables with adjustable sliders(initial value mandatory):- a = 5
static points:(1, 5, 10)
implicit:-x*x + y*y + z*z = 1
mathematical expression (only computation):- \\int_{0}^{1}x^{2}dx
NOTE:- Do not add any explanatory text like comments as comments are not supported, and movable points are not supported
Special Tokens(Cannot be used as variables):-
\t1). Cartesian Co-ordinate:-x, y, z (x, y and z and mutually perpendicular axis)
\t2). Cylinderical Co-ordinate:-r, \\theta, z. do not give any range for \\theta it is not supported (r is radius, z vertical height and \\theta is angle)
\t2). Spherical Co-ordinate:-\\rho, \\theta, \\phi. do not give any range for \\theta or \\phi it is not supported (\\rho is radius, \\phi azimuthal angle and \\theta is polar angle).
NOTE:- In a equation if z is used with x and y then it will be treated as Cartesian co-ordinate if it is used with \\theta and r then it will be treated as cylindrical co-ordinates.
Also, Implicit equations are not allowed for Cylindrical Co-ordinates or Spherical Co-ordinates only explicit one it terms of anyone of the non-angular co-ordinates (Ex. Cylinrical:r, z & Spherical:\\rho)
therefore:-x, y, z , \\rho, \\phi, \\theta, r should not be used as variables or else the compiler will throw error
Variables:- Variables cannot be of more than one letter or else the compiler will throw error same is true for variable sub-scripts
Example(multiple graph in same plot):-
x*x + y*y
r =\\cos\\left(\\theta\\right)+z
\\rho = \\cos\\left(2\\theta\\right)\\sin\\left(\\phi\\right)
f(x, y) = x*x + y*y
z*z = x*x + y*y
a=5
x*x + y*y + z*z = a*a
(1, 5, 10)
\\int_{0}^{1}x^{2}dx`,
        append:"./tools/desmos3D.html?q="
    }
]