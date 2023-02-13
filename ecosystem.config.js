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
                  "PAGE_ACCESS_TOKEN": "EAAIyDpi6ehgBAK1fUISDBfBPWeN5NEBiy9Cu1SswHbJ1EF6FlsrGtix6WfHYFDcmuSxFbZB4fcOH6BkBPgvrJMQh1AVLSfQIHLjCFZBhc0amHeZC76llfrNdreZC4uhnNfk1g3JIaFvZB8bp3oLv6vbo4Lyw7W5gg78yyZBviiUmT0XodOIRKqSfqKaPGTfZAQw7qd3Sd9gFwZDZD",
                  "APP_SECRET": "154040616e23b6fa113d15eea3abbe09",
                  "VERIFY_TOKEN": "test_faq_token",
                  "LOCALE": "pt_BR",
                  "CONTROLDESK_HOST": "https://dev.controldesk.com.br/api"            
		},
		env_production: {
			"PORT": 3001,
                  "APP_ID": 617988226710040,
                  "PAGE_ID": 114738226879078,
                  "PAGE_ACCESS_TOKEN": "EAAIyDpi6ehgBAK1fUISDBfBPWeN5NEBiy9Cu1SswHbJ1EF6FlsrGtix6WfHYFDcmuSxFbZB4fcOH6BkBPgvrJMQh1AVLSfQIHLjCFZBhc0amHeZC76llfrNdreZC4uhnNfk1g3JIaFvZB8bp3oLv6vbo4Lyw7W5gg78yyZBviiUmT0XodOIRKqSfqKaPGTfZAQw7qd3Sd9gFwZDZD",
                  "APP_SECRET": "154040616e23b6fa113d15eea3abbe09",
                  "VERIFY_TOKEN": "test_faq_token",
                  "LOCALE": "pt_BR",
                  "CONTROLDESK_HOST": "http://dev.controldesk.com.br/api"  
		}
	}],
};