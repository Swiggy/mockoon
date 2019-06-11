'use strict';

const fs = require('fs');

let rawdata = fs.readFileSync('test.json');
let charlesJson = JSON.parse(rawdata);

let finalMockJson = {};
finalMockJson.routes = []
for (let i = 0; i < charlesJson.length; i++) {
    const response = charlesJson[i]
    if (response.status == "COMPLETE") {
        const route = {}
        route["method"] = response.method.toLowerCase();
        route["uuid"] = guid()
        route["documentation"] = ""
        let path = response.path
        if (path.startsWith("/")) {
            path = path.substr(1)
        }
        if (response.query != null || response.query != undefined) {
            route["endpoint"] = path + "?" + response.query
        } else {
            route["endpoint"] = path
        }
        // console.log(route.endpoint.replace(/ /g, '%20'))
        route["body"] = JSON.parse(JSON.stringify(response.response.body.text))
        route.latency = 0
        route.statusCode = response.response.status.toString()
        route.headers = []
        // console.log(header.name)
        response.request.header.headers.forEach(header => {
            const headerConverted = {}
            headerConverted.uuid = guid()
            headerConverted.key = header["name"]
            headerConverted.value = header["value"]
            route.headers.push(headerConverted)
        });
        route.file = null
        route.duplicates = []
        finalMockJson.routes.push(route)
    }
}
console.log(JSON.stringify(finalMockJson.routes))



/*
*   function to generate random uuids
*/
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}