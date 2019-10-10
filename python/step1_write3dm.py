"""
Create two curves and save them to a 3dm file
"""

import rhino3dm

points = []
points.append(rhino3dm.Point3d(0.417, 0.262, 0))
points.append(rhino3dm.Point3d(11.718, 1.645, 0))
points.append(rhino3dm.Point3d(0.656, 4.029, 0))
points.append(rhino3dm.Point3d(11.814, 8.178, 0))
curve1 = rhino3dm.Curve.CreateControlPointCurve(points, 3)

circle = rhino3dm.Circle(rhino3dm.Point3d(5, 5, 0), 5)
curve2 = circle.ToNurbsCurve()

model = rhino3dm.File3dm()
model.Objects.AddCurve(curve1)
model.Objects.AddCurve(curve2)
model.Write('workshop_step1.3dm')

