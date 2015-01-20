You can create images like so:

Define the image's reference name: 

[header]: http://runetime.local/img/header.png

And then make the image:

![RuneTime Header][header]

The `!` denotes an image.  The first brackets `[description of image]` is what the image will be replaced with if the image doesn't exist, and the second brackets `[reference name]` is the image's name defined before.  In this case we used `header` as the reference namesince the picture is the RuneTime header image.

![you can call this anything you want][header]

Using reference names, if you have a large post with multiple pictures, you can define the image's URL and reference name somewhere in your post all in one block so it's all organized like so:

![RuneTime Pic 1][http://google.com/picture1]
![RuneTime Pic 2][http://google.com/picture2]
![RuneTime Pic 3][http://google.com/picture3]
![RuneTime Pic 4][http://google.com/picture4]

(rest of your post here, making images along the way using the references above).