import compute_rhino3d.Util
import compute_rhino3d.Grasshopper as gh
import rhino3dm
import json

compute_rhino3d.Util.url = 'http://localhost:8081/'

pt1 = rhino3dm.Point3d(0, 0, 0)
circle = rhino3dm.Circle(pt1, 5)
angle = 20

# convert circle to curve and stringify
curve = json.dumps(circle.ToNurbsCurve().Encode())

# create list of input trees
curve_tree = gh.DataTree("RH_IN:curve")
curve_tree.Append([0], [curve])
rotate_tree = gh.DataTree("RH_IN:rotate")
rotate_tree.Append([0], [angle])
trees = [curve_tree, rotate_tree]

output = gh.EvaluateDefinition('workshop_step5.ghx', trees)
print(output)

# TODO: write output lines to 3dm for checking 