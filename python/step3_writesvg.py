"""
Output to svg instead of 3dm
"""

import rhino3dm
import compute_rhino3d.Util
import compute_rhino3d.Intersection
import svgwrite

compute_rhino3d.Util.authToken = ADD_TOKEN_HERE

points = []
points.append(rhino3dm.Point3d(0.417, 0.262, 0))
points.append(rhino3dm.Point3d(11.718, 1.645, 0))
points.append(rhino3dm.Point3d(0.656, 4.029, 0))
points.append(rhino3dm.Point3d(11.814, 8.178, 0))
curve1 = rhino3dm.Curve.CreateControlPointCurve(points, 3)

circle = rhino3dm.Circle(rhino3dm.Point3d(5, 5, 0), 5)
curve2 = circle.ToNurbsCurve()

intersection_results = compute_rhino3d.Intersection.CurveCurve(curve1, curve2, 0.01, 0.01)

intersection_points = []
for intersection in intersection_results:
    x = intersection["PointA"]["X"]
    y = intersection["PointA"]["Y"]
    z = intersection["PointA"]["Z"]
    intersection_points.append(rhino3dm.Point3d(x, y, z))


def curve_to_svg(curve, svg, scale):
    domain = curve.Domain
    for i in range(100):
        t0 = domain.T0 + (domain.T1-domain.T0) * (i/100.0)
        t1 = domain.T0 + (domain.T1-domain.T0) * ((i+1)/100.0)
        pt0 = curve.PointAt(t0)
        pt1 = curve.PointAt(t1)
        svg.add(svg.line((pt0.X*scale, pt0.Y*scale), (pt1.X*scale, pt1.Y*scale), stroke=svgwrite.rgb(10, 10, 16, '%')))


scale_factor = 50
dwg = svgwrite.Drawing('workshop_step3.svg')
curve_to_svg(curve1, dwg, scale_factor)
curve_to_svg(curve2, dwg, scale_factor)

for point in intersection_points:
    dwg.add(dwg.circle((point.X*scale_factor, point.Y*scale_factor), 0.1*scale_factor,  stroke=svgwrite.rgb(10, 10, 16, '%')))

dwg.save()

