// Import K6 and reporter libraries
import { check, group, sleep } from "k6";
import http from "k6/http";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

// Base variable
const testing_url = "https://reqres.in/api/users"; // url yang diuji
const payload_create = JSON.stringify({ name: "morpheus", job: "leader" });
const payload_update = JSON.stringify({ name: "morpheus", job: "zion resident" });

// Testing requirement
export let options = {
    vus: 1000, // test using 1000 virtual users
    iterations: 3500, // running in 3500 iterations
    thresholds:{
        "http_req_duration": ["p(95)<2000"], // set threshold request duration to lessthan 2 seconds
    }
};

// Main test
export default function(){
    group("Reqres.in POST API", ()=>{
        let request_body = http.post(testing_url, payload_create, {
            headers: {
                "Content-Type": "application/json",
            }
        });
        check(request_body, {
            "response status code is 201 (CREATED)":
            (response) => response.status === 201,
            "response body not empty":
            (response) => response.json.length > 0,
            "response body has 'name' property":
            (response) => response.json().hasOwnProperty("name"),
            "response body has 'id' property":
            (response) => response.json().hasOwnProperty("id"),
            "response body has 'job' property":
            (response) => response.json().hasOwnProperty("job"),
            "'name' value in response body equal to request 'name'":
            (response) => response.body.name === payload_create.name,
            "'job' value in response body equal to request 'job'":
            (response) => response.body.job === payload_create.job,
        });
    });
    sleep(1);

    group("Reqres.in PUT API", ()=>{
        let request_body = http.put(testing_url+"/2", payload_update, {
            headers: {
                "Content-Type": "application/json",
            }
        });
        check(request_body, {
            "response status code is 200 (OK)":
            (response) => response.status === 200,
            "response body not empty":
            (response) => response.json.length > 0,
            "response body has 'name' property":
            (response) => response.json().hasOwnProperty("name"),
            "response body has 'job' property":
            (response) => response.json().hasOwnProperty("job"),
            "'name' value in response body equal to request 'name'":
            (response) => response.body.name === payload_update.name,
            "'job' value in response body not equal to previous 'job' value":
            (response) => response.body.job === payload_update.job,
        });
    });
    sleep(1);
};

// Export test result as performance_test_result.html
export function handleSummary(data){
    return {
        "performance_test_result.html": htmlReport(data),
        stdout: textSummary(data, {
            indent: " ",
            enableColors: true
        }),
        "performance_test_result.json": JSON.stringify(data, null, 2),
    };
};