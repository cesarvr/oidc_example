var express = require('express')
let qs  = require('querystring')
let oauth = require('./lib/oauth')

var app = express()
const PORT = 8080
const SSO  = process.env['SSO']  || `sso-cvaldezr-dev.apps.sandbox-m3.1530.p1.openshiftapps.com`
const HOST = process.env['HOST'] || `login-cvaldezr-dev.apps.sandbox-m3.1530.p1.openshiftapps.com`

console.log('SSO instance: ', SSO)
console.log('Current HOST: ', HOST)

function buildURL() {

    const realm = 'test'

    let params = qs.stringify({
        response_type: 'code%20id_token%20token',
        client_id: 'my-app',
        scope: 'email',
        state: '1234556',
        redirect_uri: `https://${HOST}/post_token`
    })

    return `https://${SSO}/auth/realms/${realm}/protocol/openid-connect/auth?${params}`
}

function buildLoginPage({URL}) {
    return `<!DOCTYPE HTML>
            <html>
              <head>
                <title>Hello OIDC</title>
              </head>
              <body>
                <h1> Register </h1>
                <a href="${URL}">Login</a>
              </body>
            </html>`
}

app.get('/', (req, res) => {
    let page = buildLoginPage({ URL: buildURL() })
    res.send(page)
})

app.get('/post_token', (req, res) => {
    if(req.query.code){
        //if we got the code we can allow the user to use the service. 
        oauth.exchangeToken(req.query.code)
             .then(resp => res.send(`<h1>Willkommen!</h1>`))
             .catch(err => res.send(`<p>Something went wrong!!</p>`))
    }else {
        console.log('Not token supplied...', Date.now())
        res.status(401).send(`<h2> Not Token </h2>`)
    }
})

// convention over configuration -> 8080
var server = app.listen(PORT)

console.log(`listening for request in ${PORT}`)
