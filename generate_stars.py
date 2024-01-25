import xml.etree.ElementTree as ET, urllib.request, gzip, io
import json
url = "https://github.com/OpenExoplanetCatalogue/oec_gzip/raw/master/systems.xml.gz"
oec = ET.parse(gzip.GzipFile(fileobj=io.BytesIO(urllib.request.urlopen(url).read())))
 
stars = []
for star in oec.findall(".//star"):
    radius = star.findtext("radius");
    name = star.findtext("name");

    # don't save if the radius of the star is unknown
    if radius == None or radius == "":
        continue
    stars.append({"name":name,"radius": radius} );

stars = sorted(stars, key=lambda x: float(x['radius']))
print(stars)
with open("dist/stars.json", 'w') as json_file:
    json.dump(stars, json_file, indent=2)
