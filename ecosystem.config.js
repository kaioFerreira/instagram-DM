module.exports = {
	apps: [{
		name: "instagram-dm",
		script: 'app.js',
		watch: false,
		exec_mode: "fork",
		node_args: "--trace-warnings --max-old-space-size=2048 --nouse-idle-notification",
		env: {
                  "PORT": 3001,
                  "APP_ID": 617988226710040,
                  "PAGE_ID": 114738226879078,
                  "PAGE_ACCESS_TOKEN": "kaio",
                  "APP_SECRET": "154040616e23b6fa113d15eea3abbe09",
                  "VERIFY_TOKEN": "test_faq_token",
                  "LOCALE": "pt_BR",
                  "CONTROLDESK_HOST": "https://dev.controldesk.com.br/api"            
		},
		env_production: {
			"PORT": 3001,
                  "APP_ID": 617988226710040,
                  "PAGE_ID": 114738226879078,
                  "PAGE_ACCESS_TOKEN": "kaio1",
                  "APP_SECRET": "154040616e23b6fa113d15eea3abbe09",
                  "VERIFY_TOKEN": "test_faq_token",
                  "LOCALE": "pt_BR",
                  "CONTROLDESK_HOST": "http://dev.controldesk.com.br/api"  
		}
	}],
};