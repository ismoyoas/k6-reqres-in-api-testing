// Import K6 and reporter libraries
import { check, group } from "k6";
import http from "k6/http";

// Base Variable
const testing_url = "https://reqres.in/api/users";
const payload_create = JSON.stringify({ name: "morpheus", job: "leader" });
const payload_update = JSON.stringify({ name: "morpheus", job: "zion resident" });

// Testing
export default function(){
    // POST API method to https://reqres.in/api/users
    group("Reqres.in POST API", ()=>{

        // Create request
        let request_body = http.post(testing_url, payload_create, {
            headers: {
                "Content-Type": "application/json",
            }
        });

        // Validating response body
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

    // PUT API method to https://reqres.in/api/users/2
    group("Reqres.in PUT API", ()=>{
        
        // Create request
        let request_body = http.put(testing_url+"/2", payload_update, {
            headers: {
                "Content-Type": "application/json",
            }
        });

        // Validating response body
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