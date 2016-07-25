# Snekpit
Classic Snake for many players at once. View the live demo at:
[https://snekpit.herokuapp.com](https://snekpit.herokuapp.com)

## About
Inspired by the continuous, colorful likes of Agar.io and Slither.io, Snekpit follows in their footsteps (Circle-wake? Snake trail?)

### Food
You have a small world on a 100x100 grid. Starting off as a single block, you'll need to eat these delicious foods to get larger:
![burger](https://github.com/ryanml/Snekp.it/blob/master/public/img/burger.png "burger")
![cake](https://github.com/ryanml/Snekp.it/blob/master/public/img/cake.png "cake")
![sushi](https://github.com/ryanml/Snekp.it/blob/master/public/img/sushi.gif "sushi")

### Survival
In order to keep alive, you'll need to avoid the grayed-out out of bounds areas. If your snake's head (first block segment) touches any part of another player, or any part of your body, that's it. Pick up a shield ![shield](https://github.com/ryanml/Snekp.it/blob/master/public/img/shield.png "shield") and you'll be colorfully immune from curling into yourself and crashing in to other players for about 10 seconds. You still won't be able to go out of bounds though.

### Set it up locally
Snekpit uses Node.js on the server side and is dependent on Express.js and Socket.io to make the magic happen.

First clone the repo:

`git clone https://github.com/ryanml/Snekp.it.git`

Navigate to the directory:

`cd Snekp.it`

Install dependencies:

`npm install`

Start the application:

`node app.js`

If all has gone well you'll see outputted:

`listening on port 3000`

The app will then be accessible at localhost:3000.

Enjoy!

![screenshot](https://github.com/ryanml/Snekp.it/blob/master/public/img/screenshot.png "screenshot")
