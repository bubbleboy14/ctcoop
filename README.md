# ctcoop
This package provides organizational management tools (in the form of web pages and components) for a cooperative.

# Back (Init Config)

    templates = "coopTemplates.py"
    copies = {
    	"css": ["custom.css"]
    }
    
    syms = {
    	".": ["_coop.py"],
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
    	},
    	"needs": {
    		"gal": {
    			"nobutts": false,
    			"items": null,
    			"sets": null
    		},
    		"blurz": {
    			"phone": ["what's your phone number?", "phone # please"],
    			"email": ["what's your email address?", "email address please"],
    			"name": ["what do you go by?", "what is your name?"],
    			"address": ["where do you live?", "what is your address?"]
    		},
    		"reflections": {
    			"need": {
    				"reflection": "offering",
    				"doit": "i'll do it",
    				"button": "need something else?",
    				"closed": "someone is doing it!",
    				"follow": "thanks! we'll follow up :)",
    				"please": "please tell us what you need",
    				"prompt": "Please describe what you need assistance with",
    				"description": ["what do you need help with?", "how can we assist you?"]
    			},
    			"offering": {
    				"reflection": "need",
    				"doit": "yes please!",
    				"button": "want to offer something else?",
    				"closed": "that's it!",
    				"follow": "thanks! you're the best!",
    				"please": "please describe the resource",
    				"prompt": "Please describe the resource that you would like to offer",
    				"description": ["what would you like to offer?", "please describe your offering"]
    			}
    		},
    		"prompts": {
    			"save": "your acceptance of this request will remove it from this message board. how would you like to save this information?",
    			"carrier": "please select your carrier",
    			"phone": "please enter your phone number",
    			"email": "please enter your email address",
    			"phone_or_email": "please enter a phone # or email",
    			"form": "please enter your name, as well as your phone # and/or email"
    		},
    		"fnames": ["name", "phone", "email", "address"],
    		"carriers": ["at&t", "verizon", "tmobile", "sprint"]
    	},
    	"offerings": {
    		"password": null
    	}
    }