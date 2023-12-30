# K6 reqres.in API Testing

This project was created to simulate 2 API testing scenarios. The scenarios conducted involve integration testing and performance testing on the [reqres.in](https://reqres.in/) API.

Table of Contents
-----------------

* [Prerequisite](#prerequisite)
* [Scenario](#scenario)
    * [Integration Testing](#integrationtesting)
    * [Performance Testing](#performancetesting)
* [Report](#report)

<a name="prerequisite"></a>
Prerequisite
------------

The API is tested by performing CREATE and UPDATE operations on the reqres.in database using the POST and PUT methods. Before executing the k6 testing scenarios, the API is initially tested using Postman to identify the response body that needs to be validated in the k6 testing scenarios. This is done to ensure that the API functions properly and produces expected outputs.

Scenario: Create
------------

| **Content-Type** | `application/json`     	   |
| :--------------- | :---------------------------- |
| **Endpoint**     | `https://reqres.in/api/users` |
| **Method**       | `POST`						   |
| **Status**       | `201 CREATED`				   |

Using the request body as shown below,
```JSON
{
    "name": "morpheus",
    "job": "leader"
}
```
the expected response body should appear as follows
```JSON
{
    "name": "morpheus",
    "job": "leader",
    "id": "744",
    "createdAt": "2023-12-30T12:00:18.297Z"
}
```
**Note:** in the section `"createdAt": "2023-12-30T12:00:18.297Z"`, the data value is dynamic and depends on the time when the API is accessed.

Scenario: Update
------------

| **Content-Type** | `application/json`				 |
| :--------------- | :------------------------------ |
| **Endpoint**     | `https://reqres.in/api/users/2` |
| **Method**       | `PUT`							 |
| **Status**       | `200 OK`						 |

Using the request body as shown below,
```JSON
{
    "name": "morpheus",
    "job": "zion resident"
}
```
the expected response body should appear as follows
```JSON
{
    "name": "morpheus",
    "job": "zion resident",
    "updatedAt": "2023-12-30T12:11:30.497Z"
}
```
**Note:** in the section `"updatedAt": "2023-12-30T12:11:30.497Z"`, the data value is dynamic and depends on the time when the API is accessed.

Based on the output of the response body, if the API can display the expected results, then the API can undergo testing scenarios using K6. For the installation of K6 testing, you can refer to the [k6 documentation](https://k6.io/docs/).

<a name="scenario"></a>
Scenario
------------

<a name="integrationtesting"></a>
Integration Testing
------------

Integration testing aims to verify whether components or modules within the system interact correctly and produce expected outcomes when integrated. In this scenario, testing is conducted on 2 APIs (Create and Update) to ensure that the operations of data creation and update function properly when integrated. This is intended to ensure smooth integration among components or systems.

The script code is written in the JavaScript programming language. The script begins by importing several methods that will be used from the `k6` library.
```JavaScript
import { check, group } from "k6";
import http from "k6/http";
```

Next, we set variables to be used, such as the base URL and payload.
```JavaScript
const testing_url = "https://reqres.in/api/users";
const payload_create = JSON.stringify(
    {
        name: "morpheus",
        job: "leader"
    });
const payload_update = JSON.stringify(
    {
        name: "morpheus",
        job: "zion resident"
    });
```

Next, the testing script is created in the following format.
```JavaScript
export default function(){
    group("Reqres.in POST API", ()=>{
        // POST request script

        // Response Validating script
    });
    sleep(1);

    group("Reqres.in PUT API", ()=>{
        // PUT request script

        // Response Validating script
    });
    sleep(1);
};
```

The script for making a POST request is demonstrated in the following code.
```JavaScript
let request_body = http.post(testing_url, payload_create, {
    headers: {
        "Content-Type": "application/json",
        }
    });
```
In the above script, the http module is utilized to access the post method. When making a request, the base URL and payload are used as input arguments. Meanwhile, headers are employed to ensure that the payload used is in JSON format. As for scripting the validation of the response, it is demonstrated in the following code.
```JavaScript
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
```
The `check` module is utilized for validating the tests. This module takes the request and validation script as input arguments. As seen in the above script, referring to the [response](#scenario-create) from Postman, there are several aspects that need validation, including:
* Ensuring that the status code corresponds to the used method
* The response body is not empty
* The response body contains keys that should be present in the response body, and
* Some values from the response data are present or match the payload data.

Similar to the Create scenario script, for writing the Update scenario script, it also refers to the Update [response](#scenario-update) from Postman, as shown in the attached script. The script code is then saved with the name [`integration_test.js`](https://github.com/ismoyoas/k6-reqres-in-api-testing/blob/master/test/integration_test.js), and the script code is tested by running the following code in the terminal or command prompt:
```SHELL
$ k6 run integration_test.js
```

<a name="performancetesting"></a>
Performance Testing
------------

Performance testing is used to measure and evaluate the application's performance under specific load conditions to ensure that the application can handle the expected user volume. In this scenario, the API is tested by executing a series of requests to the API (Create and Update) with 1000 virtual users, 3500 iterations, and ensuring that the 95% response duration of requests is less than 2 seconds. This aims to assess the speed, resilience, and overall performance of the application under load conditions.

For scripting the performance test, it follows a similar structure to the integration testing script, but includes additional scripts to specify the number of virtual users, the number of test iterations, and the threshold duration after the test variable script.
```JavaScript
export let options = {
    vus: 1000,
    iterations: 3500,
    thresholds:{
        "http_req_duration": ["p(95)<2000"],
    }
};
```

Next, the [test results](https://github.com/ismoyoas/k6-reqres-in-api-testing/blob/master/assets/report/performance_test_report.html) are saved in HTML format with a visually intuitive representation for easy understanding and sharing. This feature requires additional libraries and script code at the bottom of the code script.
```JavaScript
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export function handleSummary(data){
    return {
        "performance_test_report.html": htmlReport(data),
        stdout: textSummary(data, {
            indent: " ",
            enableColors: true
        }),
        "performance_test_report.json": JSON.stringify(data, null, 2),
    };
};
```

Next, the script code is saved with the name [`performance_test.js`](https://github.com/ismoyoas/k6-reqres-in-api-testing/blob/master/test/performance_test.js), and the script code is tested by running the following code in the terminal or command prompt:
```SHELL
$ k6 run performance_test.js
```

<a name="report"></a>
Report
------------

Based on the performance testing report, you can see the information in the image below, particularly in the 'Request Metrics' tab. The colored data in the request metrics are the actual results of what we tested.
![report 1](https://github.com/ismoyoas/k6-reqres-in-api-testing/blob/master/assets/img/img_1.png)
In the 'Other Stats' tab, there is data on checks, iterations, virtual users, requests, data received, and data sent. 
![report 2](https://github.com/ismoyoas/k6-reqres-in-api-testing/blob/master/assets/img/img_2.png)
In the 'Checks & Group' tab, you can find information about the functional APIs that we tested.
![report 3](https://github.com/ismoyoas/k6-reqres-in-api-testing/blob/master/assets/img/img_3.png)
The total requests in green represent the number of requests that passed. Failed requests and checks may be highlighted in red if there are requests that failed, typically due to request timeouts. Breached thresholds may also be highlighted in red, representing the number of failed thresholds. Green-colored data in the request metrics indicates the actual results of what we tested and passed, while red-colored data in the request metrics indicates the actual results of what we tested and failed.