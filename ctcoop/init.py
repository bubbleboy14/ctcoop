templates = "coopTemplates.py"
copies = {
	"css": ["custom.css"]
}

syms = {
	".": ["_coop.py"]
	"js": ["coop"],
	"css": ["coop.css"],
	"html": ["coop"]
}
model = {
	"ctcoop.model": ["*"]
}
routes = {
	"/_coop": "_coop.py"
}
requires = ["ctdecide"]
