"""
AEC Tech 2019 Workshop
Step 2: Use compute.rhino3d to find curve intersections
"""

import rhino3dm
import compute_rhino3d.Util
import compute_rhino3d.Intersection

compute_rhino3d.Util.authToken = ADD_TOKEN_HERE

points = []
points.append(rhino3dm.Point3d(0.417, 0.262, 0))
points.append(rhino3dm.Point3d(11.718, 1.645, 0))
points.append(rhino3dm.Point3d(0.656, 4.029, 0))
points.append(rhino3dm.Point3d(11.814, 8.178, 0))
curve1 = rhino3dm.Curve.CreateControlPointCurve(points, 3)

circle = rhino3dm.Circle(rhino3dm.Point3d(5, 5, 0), 5)
curve2 = circle.ToNurbsCurve()

# create a 3dm file with results
model = rhino3dm.File3dm()
model.Objects.AddCurve(curve1)
model.Objects.AddCurve(curve2)

intersection_results = compute_rhino3d.Intersection.CurveCurve(curve1, curve2, 0.01, 0.01)

for intersection in intersection_results:
    x = intersection["PointA"]["X"]
    y = intersection["PointA"]["Y"]
    z = intersection["PointA"]["Z"]
    model.Objects.AddPoint(x, y, z)

model.Write('aec_workshop_step2.3dm')
