"""
Offset and trim
"""

import rhino3dm
import compute_rhino3d.Util
import compute_rhino3d.Intersection

compute_rhino3d.Util.authToken = ADD_TOKEN_HERE

points = []
points.append(rhino3dm.Point3d(0.417, 0.262, -10))
points.append(rhino3dm.Point3d(11.718, 1.645, 0))
points.append(rhino3dm.Point3d(0.656, 4.029, 0))
points.append(rhino3dm.Point3d(11.814, 8.178, 10))
curve1 = rhino3dm.Curve.CreateControlPointCurve(points, 3)

sphere = rhino3dm.Sphere(rhino3dm.Point3d(5, 5, 0), 5)
brep = sphere.ToBrep()

# create a 3dm file with results
model = rhino3dm.File3dm()
model.Objects.AddCurve(curve1)
model.Objects.AddSphere(sphere)

intersection_results = compute_rhino3d.Intersection.CurveBrep(curve1, brep, 0.01)
intersection_points = intersection_results[2]
for intersection in intersection_points:
    x = intersection["X"]
    y = intersection["Y"]
    z = intersection["Z"]
    model.Objects.AddPoint(x, y, z)

model.Write('workshop_step4.3dm')
