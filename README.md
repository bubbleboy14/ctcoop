# ctcoop
This package provides organizational management tools (in the form of web pages and components) for a cooperative.

# Back (Init Config)

    templates = "coopTemplates.py"
    copies = {
    	"css": ["custom.css"]
    }
    
    syms = {
    	"js": ["coop"],
    	"css": ["coop.css"],
    	"html": ["coop"]
    }
    model = {
    	"ctcoop.model": ["*"]
    }
    requires = ["ctdecide"]
    

# Front (JS Config)

## core.config.ctcoop
### Import line: 'CT.require("core.config");'
    {
    	"updates": {
    		"parent": "ctmain",
    		"order": "-modified",
    		"subject": "",
    		"on": {}
    	},
    	"cal": {},
    	"about": {
    		"members": {
    			"header": "Members",
    			"model": "member",
    			"filters": {}
    		},
    		"header": "Welcome",
    		"blurb": "lorem ipsum blah blah blah lorem ipsum blah blah blah lorem ipsum blah blah blah lorem ipsum blah blah blah lorem ipsum blah blah blah lorem ipsum blah blah blah"
    	},
    	"members": {
    		"model": "member",
    		"filters": {}
    	}
    }