startworld() at 36 is the major big function, returns pause, pose, 
and stop. 

5 has dirs, which is just the 4 compass directions, then 12-331 is
just a canvas helper that breaks strings into lines via pixel width

startworld takes a quality key and spawn pose. 37-39 gets three and
the quality from quality.js, and the host element. 41-47 creates the
webglrenderer and passes in the antialiasing from the quality preset,
then appends that to the canvas. 49-52 makes the scene and gives it a
light gray background and fog. 

the camera's just a perspective camera (54-55). 57-70 is the resize
path that sets the pixel ration from the quality times scale, gets
called every window resize. 

image files don't exist: the images are just tex(). this'll change when 
we have actual images. 

90-95 set up the bookkeeping arrays (rooms, byID, walls, paints, and spin)

97-134 is mkroom. Rooms are just plain objects with bounds, name, wall 
color, floor color, a three.group and a list of light poos. 

136-141 remove matrixautoupdate, bakes it and parents a mesh to the 
room group (this is for performance)

143-157 is wallbox; give it two endpoints and it pushes an axis aligned 
collision rect into walls. 

159-168 is the major stuff for paintings and signs, defines dec so 
there's no z-fighting, and defines a shortcut for meshbasicmaterial.

192-205 makes the atrium, gives it 4 doors and a light pool in the center

207-426 wings.foreach gens each of the wings from the same template. 
The wings and artwork list come from the data.js, and it computes the 
direction and perpendicular vector, so all the furniture can be 
wing-local and rotated automatically. this whollllle thing is 
essentially just the same thing and I kinda don't want to go through 
them all. 

428-478 is all the hidden room and model

489-522 is the centerpiece in the atrium

549-712 is a per-room loop that draws the floor with a Q.tex resolution,
two meter slabs with seeded random tint. 

723-741 is player state, spawn is z=7 if no pose is passed, which just 
puts you in the atrium looking to the center. 

collision is just simple circle-rectangle stuff, snapping if you're 
in a wall, etc etc.

786-792 is just an event listener and records its removal so it 
cleans up nicely. 

798-815 is all the keydown listeners, 817-831 is keyup, 833-857 is 
pointer lock and 859-881 is the look controls (pitch is clamped obviously).

883-928 is the joystick for touch devices, 929 is the resize. 

931-948 is the hud and minimap, not much to say here

992-1135 are all the frame loop, 998-1025 for movement, 1027-1031 
spinning sculputres, 1033 updates the current room, 1035-1052 show the 
room name on enter. 1054-1084 does the raycast for the read button. 1087 
is the camera, and 1089 is renders.

we do NOT care about the rest of the js.